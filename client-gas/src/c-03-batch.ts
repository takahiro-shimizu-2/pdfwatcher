/**
 * バッチ処理関数（グローバル関数として定義）
 */

function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

async function executeBatchesInParallel(
  pageBatches: Page[][],
  user: string,
  serverLib: ServerLibrary
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const maxConcurrent = PDFWatcher.CONSTANTS.MAX_CONCURRENT_BATCHES;
  
  for (let i = 0; i < pageBatches.length; i += maxConcurrent) {
    const currentBatches = pageBatches.slice(i, i + maxConcurrent);
    const promises = currentBatches.map(batch => 
      executeSingleBatch(batch, user, serverLib)
    );
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  return results;
}

async function executeSingleBatch(
  pages: Page[],
  user: string,
  serverLib: ServerLibrary
): Promise<BatchResult> {
  try {
    return await serverLib.runBatch({
      pages,
      user,
      masterSpreadsheetId: PDFWatcher.CONSTANTS.MASTER_SPREADSHEET_ID,
    });
  } catch (error) {
    return {
      execId: 'error',
      processedPages: 0,
      updatedPages: 0,
      addedPdfs: 0,
      duration: 0,
      errors: [new Error(String(error))],
    };
  }
}