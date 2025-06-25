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
    .addItem('判定を実行', 'runJudge')
    .addSeparator()
    .addItem('初期設定', 'setupClientSpreadsheet')
    .addSeparator()
    .addSubMenu(ui.createMenu('開発用')
      .addItem('テスト結果を記録 - 新規追加', 'logTestResult_New')
      .addItem('テスト結果を記録 - 継続確認', 'logTestResult_Continue')
      .addItem('テスト結果を記録 - 削除検出', 'logTestResult_Delete')
      .addItem('テスト結果を記録 - 再追加', 'logTestResult_ReAdd')
      .addSeparator()
      .addItem('DevLogサマリーを表示', 'showDevLogSummary'))
    .addToUi();
}

// メニューから呼び出される関数
function logTestResult_New(): void { logTestResult('新規追加'); }
function logTestResult_Continue(): void { logTestResult('継続確認'); }
function logTestResult_Delete(): void { logTestResult('削除検出'); }
function logTestResult_ReAdd(): void { logTestResult('再追加'); }
function showDevLogSummary(): void {
  const summary = getDevLogSummary();
  SpreadsheetApp.getUi().alert('DevLog サマリー', summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 手動でメニューを追加する関数（初回用）
 */
function setupMenu(): void {
  onOpen();
}

/**
 * 継続実行用のエントリーポイント（トリガーから呼び出される）
 * この関数はc-05-main.tsのrunJudgeContinuationを呼び出す
 */
// runJudgeContinuation関数はc-05-main.tsで定義されているため、ここでは定義不要