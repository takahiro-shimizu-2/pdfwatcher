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
    ['ページURL', 'PDF URL', '初回発見日時', '最終確認日時', 'ステータス']
  ]);
  
  // PageHistoryシートの作成
  createOrUpdateSheet(spreadsheet, 'PageHistory', [
    ['実行日時', 'ページURL', 'ページ更新', 'PDF更新', '追加数', 'ユーザー']
  ]);
  
  // PageSummaryシートの作成
  createOrUpdateSheet(spreadsheet, 'PageSummary', [
    ['ページURL', '最新ハッシュ',
     '実行1-日時', '実行1-ページ', '実行1-PDF', '実行1-追加数',
     '実行2-日時', '実行2-ページ', '実行2-PDF', '実行2-追加数',
     '実行3-日時', '実行3-ページ', '実行3-PDF', '実行3-追加数']
  ]);
  
  // RunLogシートの作成
  createOrUpdateSheet(spreadsheet, 'RunLog', [
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