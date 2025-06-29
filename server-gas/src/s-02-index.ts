/**
 * バッチ処理のメイン関数
 */
async function runBatch(options: RunBatchOptions): Promise<BatchResult> {
  const startTime = Date.now();
  // クライアントから渡されたexecIdを使用、なければ新規生成
  const execId = options.execId || generateUUID();
  const errors: Error[] = [];
  
  // エラーハンドリング用にservicesを事前に取得
  let services: ServiceContainer | null = null;
  
  try {
    DIContainer.configure('sheet', options.masterSpreadsheetId);
    services = DIContainer.getServices();
    const lock = new DocumentLock(options.masterSpreadsheetId);
    
    // 再実行モードを設定
    if (options.isRetry) {
      services.diffService.setRetryMode(true);
    }
    
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
    
    // 新規PDFと既存PDFの更新を処理
    for (const result of diffResults) {
      const page = options.pages.find(p => p.url === result.pageUrl);
      if (!page) continue;
      
      // 新規PDFを追加
      for (const pdfUrl of result.addedPdfUrls) {
        const pdfInfo = page.pdfs.find(p => p.url === pdfUrl);
        pdfsToUpdate.push({
          pageUrl: result.pageUrl,
          pdfUrl,
          subject: pdfInfo?.subject || '',
          firstSeen: now,
          deletedAt: null,
          status: 'ページ内に存在',
        });
      }
      
      // 現在存在するPDFのステータスを更新（削除確認日時は変更しない）
      for (const pdf of page.pdfs) {
        if (!result.addedPdfUrls.includes(pdf.url)) {
          // 既存のPDFのステータスを維持
          pdfsToUpdate.push({
            pageUrl: result.pageUrl,
            pdfUrl: pdf.url,
            subject: pdf.subject,
            firstSeen: now, // リポジトリ側で既存のfirstSeenが保持される
            deletedAt: null, // リポジトリ側で既存のdeletedAtが保持される
            status: 'ページ内に存在',
          });
        }
      }
      
      // 削除されたPDFのステータスを更新
      for (const pdfUrl of result.removedPdfUrls) {
        // 削除されたPDFの件名情報は保持しないので空文字列
        pdfsToUpdate.push({
          pageUrl: result.pageUrl,
          pdfUrl,
          subject: '',
          firstSeen: now, // リポジトリ側で既存のfirstSeenが保持される
          deletedAt: now, // リポジトリ側で削除時に現在時刻が設定される
          status: 'ページから削除',
        });
      }
    }
    
    await lock.executeWithLock(async () => {
      if (pdfsToUpdate.length > 0) {
        await services!.archiveRepo.upsertPdfs(pdfsToUpdate);
      }
      
      await services!.summaryService.updateBatchSummaries(diffResults, options.user);
    });
    
    const stats = await services!.diffService.mergeDiffResults(diffResults);
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
    
    await services!.runLogRepo.addRunLog(runLog);
    
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
      // エラー処理中は既に取得済みのservicesを使用、なければスキップ
      if (services) {
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
      } else {
        console.error('Services not available for error logging');
      }
    } catch (logError) {
      console.error('Failed to write error log:', logError);
      console.error('Error details:', {
        message: (logError as Error).message,
        stack: (logError as Error).stack,
        toString: (logError as Error).toString()
      });
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