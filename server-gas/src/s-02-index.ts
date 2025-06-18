/**
 * バッチ処理のメイン関数
 */
async function runBatch(options: RunBatchOptions): Promise<BatchResult> {
  const startTime = Date.now();
  const execId = generateUUID();
  const errors: Error[] = [];
  
  try {
    DIContainer.configure('sheet', options.masterSpreadsheetId);
    const services = DIContainer.getServices();
    const lock = new DocumentLock(options.masterSpreadsheetId);
    
    const diffResults: DiffResult[] = [];
    for (const page of options.pages) {
      try {
        const result = await services.diffService.calculateDiff(page);
        diffResults.push(result);
      } catch (error) {
        errors.push(new Error(`Failed to process ${page.url}: ${error}`));
      }
    }
    
    const pdfsToUpdate: PDF[] = [];
    const now = new Date();
    
    for (const result of diffResults) {
      for (const pdfUrl of result.addedPdfUrls) {
        pdfsToUpdate.push({
          pageUrl: result.pageUrl,
          pdfUrl,
          firstSeen: now,
          lastSeen: now,
        });
      }
    }
    
    await lock.executeWithLock(async () => {
      if (pdfsToUpdate.length > 0) {
        await services.archiveRepo.upsertPdfs(pdfsToUpdate);
      }
      
      await services.summaryService.updateBatchSummaries(diffResults, options.user);
    });
    
    const stats = await services.diffService.mergeDiffResults(diffResults);
    const duration = (Date.now() - startTime) / 1000;
    
    const runLog: RunLogEntry = {
      execId,
      timestamp: new Date(),
      user: options.user,
      durationSeconds: duration,
      pagesProcessed: stats.totalProcessed,
      pagesUpdated: stats.totalUpdated,
      pdfsAdded: stats.totalPdfsAdded,
      result: errors.length === 0 ? 'SUCCESS' : 'ERROR',
      errorMessage: errors.length > 0 ? errors[0].message.substring(0, CONSTANTS.MAX_ERROR_MESSAGE_LENGTH) : undefined,
      scriptVersion: CONSTANTS.SCRIPT_VERSION,
    };
    
    await services.runLogRepo.addRunLog(runLog);
    
    return {
      execId,
      processedPages: stats.totalProcessed,
      updatedPages: stats.totalUpdated,
      addedPdfs: stats.totalPdfsAdded,
      duration,
      errors,
      diffResults,
    };
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    errors.push(error as Error);
    
    try {
      const services = DIContainer.getServices();
      const runLog: RunLogEntry = {
        execId,
        timestamp: new Date(),
        user: options.user,
        durationSeconds: duration,
        pagesProcessed: options.pages.length,
        pagesUpdated: 0,
        pdfsAdded: 0,
        result: 'ERROR',
        errorMessage: (error as Error).message.substring(0, CONSTANTS.MAX_ERROR_MESSAGE_LENGTH),
        scriptVersion: CONSTANTS.SCRIPT_VERSION,
      };
      await services.runLogRepo.addRunLog(runLog);
    } catch (logError) {
      console.error('Failed to write error log:', logError);
    }
    
    return {
      execId,
      processedPages: 0,
      updatedPages: 0,
      addedPdfs: 0,
      duration,
      errors,
    };
  }
}

function configure(config: ConfigType, spreadsheetId: string): void {
  DIContainer.configure(config, spreadsheetId);
}