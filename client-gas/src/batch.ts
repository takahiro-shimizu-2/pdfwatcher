import { Page, BatchResult } from '@pdf-watcher/core';
import { CLIENT_CONFIG } from './config';
import { ServerLibrary } from './types';

export function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

export async function executeBatchesInParallel(
  pageBatches: Page[][],
  user: string,
  serverLib: ServerLibrary
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const maxConcurrent = CLIENT_CONFIG.MAX_CONCURRENT_BATCHES;
  
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
      masterSpreadsheetId: CLIENT_CONFIG.MASTER_SPREADSHEET_ID,
    });
  } catch (error) {
    return {
      execId: 'error',
      processedPages: 0,
      updatedPages: 0,
      addedPdfs: 0,
      duration: 0,
      errors: [error as Error],
    };
  }
}