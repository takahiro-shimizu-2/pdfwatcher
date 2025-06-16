/**
 * PDF_Watcher_Client_Template用の初期設定スクリプト
 * 
 * 使い方：
 * 1. PDF_Watcher_Client_TemplateスプレッドシートのGASエディタを開く
 * 2. このコードを新しいスクリプトファイルに貼り付け
 * 3. setupClientSpreadsheet関数を実行
 */

function setupClientSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const masterSpreadsheetId = '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0';
  
  // Currentシートの作成（ヘッダーなし）
  let currentSheet = spreadsheet.getSheetByName('Current');
  if (!currentSheet) {
    currentSheet = spreadsheet.insertSheet('Current');
  }
  currentSheet.clear();
  
  // Changesシートの作成
  createOrUpdateSheet(spreadsheet, 'Changes', [
    ['PageURL', 'AddedCnt', 'NewPDFs']
  ]);
  
  // Summaryシートの作成（IMPORTRANGE設定）
  let summarySheet = spreadsheet.getSheetByName('Summary');
  if (!summarySheet) {
    summarySheet = spreadsheet.insertSheet('Summary');
  }
  summarySheet.clear();
  const importRangeFormula = '=IMPORTRANGE("' + masterSpreadsheetId + '", "PageSummary!A:M")';
  summarySheet.getRange('A1').setFormula(importRangeFormula);
  summarySheet.getRange('A1').setNote(
    'このシートは中央ブックのPageSummaryを参照しています。\n' +
    '初回アクセス時は承認が必要です。'
  );
  
  // UserLogシートの作成
  createOrUpdateSheet(spreadsheet, 'UserLog', [
    ['Timestamp', 'Duration s', 'PagesProc', 'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg']
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

function createOrUpdateSheet(spreadsheet, sheetName, headers) {
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

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Watcher')
    .addItem('Run Judge', 'runJudge')
    .addSeparator()
    .addItem('初期設定', 'setupClientSpreadsheet')
    .addToUi();
}

// ダミーのrunJudge関数（後で本実装に置き換え）
function runJudge() {
  SpreadsheetApp.getUi().alert('runJudge機能は後ほど実装されます');
}