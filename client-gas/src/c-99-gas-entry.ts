/**
 * GASエントリーポイント
 * メニューとトリガー関数の定義
 */

/**
 * スプレッドシートを開いた時に自動実行される関数
 */
function onOpen(): void {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Watcher')
    .addItem('Run Judge', 'runJudge')
    .addSeparator()
    .addItem('初期設定', 'setupClientSpreadsheet')
    .addToUi();
}

/**
 * 手動でメニューを追加する関数（初回用）
 */
function setupMenu(): void {
  onOpen();
}