/**
 * UI関連関数（グローバル関数として定義）
 */

function updateChangesSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, results: DiffResult[], pages?: Page[]): void {
  // ヘッダー行が存在しない場合のみ追加
  if (sheet.getLastRow() === 0) {
    const headers = ['PageURL', '件名', 'PDFのURL'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  // 既存のデータの最終行を取得
  const lastRow = sheet.getLastRow();
  const startRow = lastRow > 0 ? lastRow + 1 : 1;
  
  const rows: string[][] = [];
  
  for (const result of results) {
    if (result.pdfUpdated && result.addedPdfUrls.length > 0) {
      // ページ情報から対応するPDFの件名を取得
      const page = pages?.find(p => p.url === result.pageUrl);
      
      // 各PDFのURLを個別の行として追加
      for (const pdfUrl of result.addedPdfUrls) {
        // PDFの件名情報を取得
        const pdfInfo = page?.pdfs.find(pdf => pdf.url === pdfUrl);
        const subject = pdfInfo?.subject || '';
        
        rows.push([result.pageUrl, subject, pdfUrl]);
      }
    }
  }
  
  if (rows.length > 0) {
    sheet.getRange(startRow, 1, rows.length, 3).setValues(rows);
  }
}

function updateUserLog(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  batchResults: BatchResult[],
  totalDuration: number
): void {
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalPdfsAdded = 0;
  let hasError = false;
  let errorMessage = '';
  
  for (const result of batchResults) {
    totalProcessed += result.processedPages;
    totalUpdated += result.updatedPages;
    totalPdfsAdded += result.addedPdfs;
    
    if (result.errors.length > 0) {
      hasError = true;
      if (!errorMessage) {
        errorMessage = result.errors[0].message.substring(0, PDFWatcher.CONSTANTS.MAX_ERROR_MESSAGE_LENGTH);
      }
    }
  }
  
  const row = [
    new Date(),
    totalDuration,
    totalProcessed,
    totalUpdated,
    totalPdfsAdded,
    hasError ? 'Error' : 'Success',
    errorMessage,
  ];
  
  sheet.appendRow(row);
}

function clearCurrentSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  sheet.clear();
}

function initializeSheets(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  const sheetNames = [
    PDFWatcher.SHEET_NAMES.CURRENT,
    PDFWatcher.SHEET_NAMES.CHANGES,
    PDFWatcher.SHEET_NAMES.SUMMARY,
    PDFWatcher.SHEET_NAMES.USER_LOG,
  ];
  
  for (const name of sheetNames) {
    if (!spreadsheet.getSheetByName(name)) {
      spreadsheet.insertSheet(name);
    }
  }
  
  const userLogSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
  if (userLogSheet && userLogSheet.getLastRow() === 0) {
    const headers = ['Timestamp', 'Duration s', 'PagesProc', 'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg'];
    userLogSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    userLogSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}