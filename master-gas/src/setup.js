/**
 * PDF_Watcher_Master用の初期設定スクリプト
 * 
 * 使い方：
 * 1. PDF_Watcher_MasterスプレッドシートのGASエディタを開く
 * 2. このコードを新しいスクリプトファイルに貼り付け
 * 3. setupMasterSpreadsheet関数を実行
 */

function setupMasterSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // ArchivePDFシートの作成
  createOrUpdateSheet(spreadsheet, 'ArchivePDF', [
    ['PageURL', 'PDFURL', 'FirstSeen', 'LastSeen']
  ]);
  
  // PageHistoryシートの作成
  createOrUpdateSheet(spreadsheet, 'PageHistory', [
    ['RunDate', 'PageURL', 'PageUpd?', 'PDFUpd?', 'AddedCnt', 'User']
  ]);
  
  // PageSummaryシートの作成
  createOrUpdateSheet(spreadsheet, 'PageSummary', [
    ['PageURL', 
     'Run-1 Date', 'Run-1 PU', 'Run-1 PFU', 'Run-1 Cnt',
     'Run-2 Date', 'Run-2 PU', 'Run-2 PFU', 'Run-2 Cnt',
     'Run-3 Date', 'Run-3 PU', 'Run-3 PFU', 'Run-3 Cnt']
  ]);
  
  // RunLogシートの作成
  createOrUpdateSheet(spreadsheet, 'RunLog', [
    ['ExecID', 'Timestamp', 'User', 'Dur s', 'PagesProc', 
     'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg', 'ScriptVer']
  ]);
  
  // デフォルトシートを削除（必要に応じて）
  const defaultSheet = spreadsheet.getSheetByName('シート1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  SpreadsheetApp.getUi().alert('中央ブックの初期設定が完了しました');
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