/**
 * Changes履歴管理モジュール
 * ChangesシートのデータをChangesHistoryシートに保存し、
 * 古いデータを自動削除する機能を提供
 */

/**
 * ChangesHistory エントリーの型定義
 */
interface ChangesHistoryEntry {
  savedAt: Date;      // 保存日時（UTC）
  runId: string;      // 実行ID
  pdfUrl: string;     // 新規検出されたPDF URL
  pageUrl: string;    // PDFが存在するページURL
  expiresAt: Date;    // 削除予定日時（savedAt + 5日）
}

/**
 * 履歴保存期間（日数）
 */
const HISTORY_RETENTION_DAYS = 5;

/**
 * ChangesHistoryシート名
 */
const CHANGES_HISTORY_SHEET_NAME = PDFWatcher.SHEET_NAMES.CHANGES_HISTORY;

/**
 * ChangesシートのデータをChangesHistoryシートに転写する
 * @param runId 実行ID（execIdを使用）
 * @returns 転写された件数
 */
function transferChangesToHistory(runId: string): number {
  const startTime = Date.now();
  
  try {
    // スプレッドシートを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Changesシートを取得
    const changesSheet = ss.getSheetByName('Changes');
    if (!changesSheet) {
      console.log('Changesシートが見つかりません');
      return 0;
    }
    
    // Changesシートのデータを取得（ヘッダーを除く）
    const lastRow = changesSheet.getLastRow();
    if (lastRow <= 1) {
      console.log('Changesシートにデータがありません');
      return 0;
    }
    
    const changesData = changesSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    if (changesData.length === 0) {
      console.log('転写するデータがありません');
      return 0;
    }
    
    // ChangesHistoryシートを取得
    const historySheet = ss.getSheetByName(CHANGES_HISTORY_SHEET_NAME);
    if (!historySheet) {
      console.error('ChangesHistoryシートが見つかりません。初期設定を実行してください。');
      return 0;
    }
    
    // 転写用のデータを準備
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    const historyEntries = changesData
      .filter(row => row[0] && row[1]) // URLとページURLが両方存在する行のみ
      .map(row => [
        now,        // SavedAt
        runId,      // RunId
        row[0],     // PdfUrl
        row[1],     // PageUrl
        expiresAt   // ExpiresAt
      ]);
    
    if (historyEntries.length === 0) {
      console.log('有効なデータがありません');
      return 0;
    }
    
    // ChangesHistoryシートに追記
    const lastHistoryRow = historySheet.getLastRow();
    historySheet.getRange(lastHistoryRow + 1, 1, historyEntries.length, 5)
      .setValues(historyEntries);
    
    const elapsedTime = Date.now() - startTime;
    console.log(`Changes履歴を転写しました: ${historyEntries.length}件 (${elapsedTime}ms)`);
    
    return historyEntries.length;
    
  } catch (error) {
    console.error('Changes履歴の転写中にエラーが発生しました:', error);
    return 0;
  }
}


/**
 * 期限切れの履歴データを削除する
 * @returns 削除された件数
 */
function deleteExpiredHistory(): number {
  const startTime = Date.now();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = ss.getSheetByName(CHANGES_HISTORY_SHEET_NAME);
    
    if (!historySheet) {
      console.log('ChangesHistoryシートが見つかりません');
      return 0;
    }
    
    const lastRow = historySheet.getLastRow();
    if (lastRow <= 1) {
      console.log('削除対象のデータがありません');
      return 0;
    }
    
    // すべてのデータを取得
    const data = historySheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const now = new Date();
    
    // 削除対象の行を特定（下から上へ）
    const rowsToDelete: number[] = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const expiresAt = data[i][4];
      if (expiresAt instanceof Date && expiresAt.getTime() <= now.getTime()) {
        rowsToDelete.push(i + 2); // シート上の行番号（1始まり、ヘッダー含む）
      }
    }
    
    if (rowsToDelete.length === 0) {
      console.log('削除対象のデータはありません');
      return 0;
    }
    
    // 行を削除（下から上へ）
    rowsToDelete.forEach(rowNumber => {
      historySheet.deleteRow(rowNumber);
    });
    
    const elapsedTime = Date.now() - startTime;
    console.log(`期限切れ履歴を削除しました: ${rowsToDelete.length}件 (${elapsedTime}ms)`);
    
    return rowsToDelete.length;
    
  } catch (error) {
    console.error('期限切れ履歴の削除中にエラーが発生しました:', error);
    return 0;
  }
}

/**
 * 履歴管理処理を実行する（処理完了時に呼び出される）
 * @param runId 実行ID
 */
function executeHistoryManagement(runId: string): void {
  console.log('=== Changes履歴管理を開始 ===');
  
  // Changesデータを履歴に転写
  const transferredCount = transferChangesToHistory(runId);
  
  // 期限切れデータを削除
  const deletedCount = deleteExpiredHistory();
  
  console.log(`=== Changes履歴管理完了: 転写${transferredCount}件, 削除${deletedCount}件 ===`);
}