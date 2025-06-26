/**
 * 初期設定関数（グローバル関数として定義）
 */

function setupClientSpreadsheet(): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSpreadsheetId = PDFWatcher.CONSTANTS.MASTER_SPREADSHEET_ID;
  
  // Currentシートの作成（ヘッダーなし）
  let currentSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
  if (!currentSheet) {
    currentSheet = spreadsheet.insertSheet(PDFWatcher.SHEET_NAMES.CURRENT);
  }
  currentSheet.clear();
  
  // Changesシートの作成
  createOrUpdateSheet(spreadsheet, PDFWatcher.SHEET_NAMES.CHANGES, [
    ['ページURL', '追加数', '新規PDF']
  ]);
  
  // Summaryシートの作成（IMPORTRANGE設定）
  let summarySheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.SUMMARY);
  if (!summarySheet) {
    summarySheet = spreadsheet.insertSheet(PDFWatcher.SHEET_NAMES.SUMMARY);
  }
  summarySheet.clear();
  const importRangeFormula = `=IMPORTRANGE("${masterSpreadsheetId}", "PageSummary!A:N")`;
  summarySheet.getRange('A1').setFormula(importRangeFormula);
  summarySheet.getRange('A1').setNote(
    'このシートは中央ブックのPageSummaryを参照しています。\n' +
    '初回アクセス時は承認が必要です。'
  );
  
  // UserLogシートの作成
  createOrUpdateSheet(spreadsheet, PDFWatcher.SHEET_NAMES.USER_LOG, [
    ['タイムスタンプ', '実行時間(秒)', '処理ページ数', '更新ページ数', '追加PDF数', '結果', 'エラーメッセージ']
  ]);
  
  // ChangesHistoryシートの作成
  createOrUpdateSheet(spreadsheet, PDFWatcher.SHEET_NAMES.CHANGES_HISTORY, [
    ['保存日時', '実行ID', 'ページURL', 'PDFのURL', '削除予定日時']
  ]);
  
  // デフォルトシートを削除（必要に応じて）
  const defaultSheet = spreadsheet.getSheetByName('シート1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  SpreadsheetApp.getUi().alert(
    'クライアントテンプレートの初期設定が完了しました。\n' +
    'Summaryシートを開いて、IMPORTRANGEの承認を行ってください。'
  );
}

function createOrUpdateSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  sheetName: string,
  headers: string[][]
): void {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  if (headers.length > 0) {
    const headerRange = sheet.getRange(1, 1, headers.length, headers[0].length);
    headerRange.setValues(headers);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');
    
    // 列幅の自動調整
    for (let i = 1; i <= headers[0].length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}