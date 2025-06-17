/**
 * メイン処理関数（グローバル関数として定義）
 */

declare const PDFWatcherServerLib: ServerLibrary;

async function runJudge(): Promise<void> {
  const startTime = Date.now();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const user = Session.getActiveUser().getEmail();
  
  try {
    initializeSheets(spreadsheet);
    
    const currentSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
    if (!currentSheet) {
      throw new Error('Current sheet not found');
    }
    
    const parsedRows = parseCurrentSheet(currentSheet);
    if (parsedRows.length === 0) {
      SpreadsheetApp.getUi().alert('No data found in Current sheet');
      return;
    }
    
    const pages = convertToPages(parsedRows);
    const pageBatches = splitIntoBatches(pages, PDFWatcher.CLIENT_CONFIG.BATCH_SIZE);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Processing ${pages.length} pages in ${pageBatches.length} batches...`,
      'PDF Watcher',
      5
    );
    
    const serverLib = getServerLibrary();
    const batchResults = await executeBatchesInParallel(
      pageBatches,
      user,
      serverLib
    );
    
    // TODO: DiffResultsの取得処理を追加
    const allDiffResults: DiffResult[] = [];
    
    const changesSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CHANGES);
    if (changesSheet) {
      updateChangesSheet(changesSheet, allDiffResults);
    }
    
    const userLogSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
    if (userLogSheet) {
      const totalDuration = (Date.now() - startTime) / 1000;
      updateUserLog(userLogSheet, batchResults, totalDuration);
    }
    
    clearCurrentSheet(currentSheet);
    
    const totalUpdated = batchResults.reduce((sum, r) => sum + r.updatedPages, 0);
    const totalPdfsAdded = batchResults.reduce((sum, r) => sum + r.addedPdfs, 0);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Completed: ${totalUpdated} pages updated, ${totalPdfsAdded} PDFs added`,
      'PDF Watcher',
      5
    );
    
  } catch (error) {
    console.error('Error in runJudge:', error);
    SpreadsheetApp.getUi().alert(`Error: ${error}`);
    
    const userLogSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
    if (userLogSheet) {
      const totalDuration = (Date.now() - startTime) / 1000;
      updateUserLog(userLogSheet, [], totalDuration);
    }
  }
}

function getServerLibrary(): ServerLibrary {
  try {
    return PDFWatcherServerLib;
  } catch (error) {
    throw new Error(
      'Server library not found. Please add the PDF Watcher Server Library to this project.'
    );
  }
}