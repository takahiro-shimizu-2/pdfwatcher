/**
 * 中央ブック（PDF_Watcher_Master）の初期設定
 * この関数をGASエディタから実行してシートとヘッダーを作成
 */
function setupMasterSpreadsheet(): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // ArchivePDFシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.ARCHIVE_PDF, [
    ['ページURL', 'PDF URL', '初回発見日時', '最終確認日時']
  ]);
  
  // PageHistoryシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.PAGE_HISTORY, [
    ['実行日時', 'ページURL', 'ページ更新', 'PDF更新', '追加数', 'ユーザー']
  ]);
  
  // PageSummaryシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.PAGE_SUMMARY, [
    ['ページURL', 
     '実行1-日時', '実行1-ページ', '実行1-PDF', '実行1-追加数',
     '実行2-日時', '実行2-ページ', '実行2-PDF', '実行2-追加数',
     '実行3-日時', '実行3-ページ', '実行3-PDF', '実行3-追加数']
  ]);
  
  // RunLogシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.RUN_LOG, [
    ['実行ID', 'タイムスタンプ', 'ユーザー', '実行時間(秒)', '処理ページ数', 
     '更新ページ数', '追加PDF数', '結果', 'エラーメッセージ', 'スクリプトVer']
  ]);
  
  // デフォルトシートを削除（必要に応じて）
  const defaultSheet = spreadsheet.getSheetByName('シート1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  SpreadsheetApp.getUi().alert('中央ブックの初期設定が完了しました');
}

/**
 * クライアントテンプレートの初期設定
 * この関数をGASエディタから実行してシートとヘッダーを作成
 */
function setupClientSpreadsheet(masterSpreadsheetId?: string): void {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!masterSpreadsheetId) {
    masterSpreadsheetId = '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0';
  }
  
  // Currentシートの作成（ヘッダーなし）
  let currentSheet = spreadsheet.getSheetByName(SHEET_NAMES.CURRENT);
  if (!currentSheet) {
    currentSheet = spreadsheet.insertSheet(SHEET_NAMES.CURRENT);
  }
  currentSheet.clear();
  
  // Changesシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.CHANGES, [
    ['ページURL', '追加数', '新規PDF']
  ]);
  
  // Summaryシートの作成（IMPORTRANGE設定）
  let summarySheet = spreadsheet.getSheetByName(SHEET_NAMES.SUMMARY);
  if (!summarySheet) {
    summarySheet = spreadsheet.insertSheet(SHEET_NAMES.SUMMARY);
  }
  summarySheet.clear();
  const importRangeFormula = `=IMPORTRANGE("${masterSpreadsheetId}", "PageSummary!A:M")`;
  summarySheet.getRange('A1').setFormula(importRangeFormula);
  summarySheet.getRange('A1').setNote(
    'このシートは中央ブックのPageSummaryを参照しています。\n' +
    '初回アクセス時は承認が必要です。'
  );
  
  // UserLogシートの作成
  createOrUpdateSheet(spreadsheet, SHEET_NAMES.USER_LOG, [
    ['タイムスタンプ', '実行時間(秒)', '処理ページ数', '更新ページ数', '追加PDF数', '結果', 'エラーメッセージ']
  ]);
  
  // デフォルトシートを削除（必要に応じて）
  const defaultSheet = spreadsheet.getSheetByName('シート1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  // メニューの追加
  onOpen();
  
  SpreadsheetApp.getUi().alert(
    'クライアントテンプレートの初期設定が完了しました。\n' +
    'Summaryシートを開いて、IMPORTRANGEの承認を行ってください。'
  );
}

/**
 * シートを作成または更新する共通関数
 */
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

/**
 * メニューの追加（クライアント用）
 */
function onOpen(): void {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Watcher')
    .addItem('Run Judge', 'runJudge')
    .addSeparator()
    .addItem('初期設定', 'setupClientSpreadsheet')
    .addToUi();
}