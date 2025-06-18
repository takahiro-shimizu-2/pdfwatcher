/**
 * スプレッドシートの結果を読み取るスクリプト
 * Changes シートと UserLog シートから最新のデータを取得して表示
 */

/**
 * Changes シートの内容を読み取る関数
 * @param limit 取得する件数（デフォルト: 10）
 */
function readChangesSheet(limit: number = 10): void {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PDFWatcher.SHEET_NAMES.CHANGES);
    if (!sheet) {
      console.error('Changes シートが見つかりません');
      return;
    }

    // ヘッダー行を取得
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('=== Changes シートの内容 ===');
    console.log('ヘッダー:', headers);
    console.log('形式: 1行1URL（コピペしやすい縦並び）');

    // データの最終行を取得
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('データがありません');
      return;
    }

    // 最新のデータから指定件数分を取得（最新が下にあるため、下から取得）
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

    console.log(`\n最新 ${numRows} 件のデータ:`);
    
    // 逆順で表示（最新を上に）
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      console.log('\n--- レコード', data.length - i, '---');
      headers.forEach((header, index) => {
        if (row[index]) {
          console.log(`${header}: ${row[index]}`);
        }
      });
    }
  } catch (error) {
    console.error('Changes シートの読み取りエラー:', error);
  }
}

/**
 * UserLog シートの内容を読み取る関数
 * @param limit 取得する件数（デフォルト: 10）
 */
function readUserLogSheet(limit: number = 10): void {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
    if (!sheet) {
      console.error('UserLog シートが見つかりません');
      return;
    }

    // ヘッダー行を取得
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('\n=== UserLog シートの内容 ===');
    console.log('ヘッダー:', headers);

    // データの最終行を取得
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('データがありません');
      return;
    }

    // 最新のデータから指定件数分を取得
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

    console.log(`\n最新 ${numRows} 件のデータ:`);
    
    // 逆順で表示（最新を上に）
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      console.log('\n--- レコード', data.length - i, '---');
      headers.forEach((header, index) => {
        if (row[index]) {
          console.log(`${header}: ${row[index]}`);
        }
      });
    }
  } catch (error) {
    console.error('UserLog シートの読み取りエラー:', error);
  }
}

/**
 * 両方のシートの内容を確認するメイン関数
 */
function checkAllResults(): void {
  console.log('PDFWatcher - スプレッドシート結果チェック');
  console.log('実行時刻:', new Date().toLocaleString('ja-JP'));
  console.log('==========================================\n');

  // Changes シートを読み取り
  readChangesSheet(10);

  // UserLog シートを読み取り
  readUserLogSheet(10);

  console.log('\n==========================================');
  console.log('チェック完了');
}

/**
 * Changes シートの統計情報を表示
 */
function showChangesStatistics(): void {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PDFWatcher.SHEET_NAMES.CHANGES);
    if (!sheet) {
      console.error('Changes シートが見つかりません');
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('Changes シートにデータがありません');
      return;
    }

    console.log('\n=== Changes シート統計情報 ===');
    console.log('総レコード数:', lastRow - 1);

    // ページ更新とPDF更新の件数をカウント
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const pageUpdatedIndex = headers.indexOf('ページ更新');
    const pdfUpdatedIndex = headers.indexOf('PDF更新');
    
    let pageUpdatedCount = 0;
    let pdfUpdatedCount = 0;
    let bothUpdatedCount = 0;

    data.forEach(row => {
      const pageUpdated = row[pageUpdatedIndex] === 'TRUE' || row[pageUpdatedIndex] === true;
      const pdfUpdated = row[pdfUpdatedIndex] === 'TRUE' || row[pdfUpdatedIndex] === true;
      
      if (pageUpdated) pageUpdatedCount++;
      if (pdfUpdated) pdfUpdatedCount++;
      if (pageUpdated && pdfUpdated) bothUpdatedCount++;
    });

    console.log('ページ更新件数:', pageUpdatedCount);
    console.log('PDF更新件数:', pdfUpdatedCount);
    console.log('両方更新件数:', bothUpdatedCount);
  } catch (error) {
    console.error('統計情報の取得エラー:', error);
  }
}

/**
 * UserLog シートの統計情報を表示
 */
function showUserLogStatistics(): void {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
    if (!sheet) {
      console.error('UserLog シートが見つかりません');
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('UserLog シートにデータがありません');
      return;
    }

    console.log('\n=== UserLog シート統計情報 ===');
    console.log('総実行回数:', lastRow - 1);

    // 実行者別の統計を取得
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const userIndex = headers.indexOf('実行者');
    const processedIndex = headers.indexOf('処理ページ数');
    const updatedIndex = headers.indexOf('更新ページ数');
    const addedIndex = headers.indexOf('追加PDF数');
    
    const userStats: { [key: string]: { count: number; processed: number; updated: number; added: number } } = {};

    data.forEach(row => {
      const user = row[userIndex] || '不明';
      const processed = Number(row[processedIndex]) || 0;
      const updated = Number(row[updatedIndex]) || 0;
      const added = Number(row[addedIndex]) || 0;

      if (!userStats[user]) {
        userStats[user] = { count: 0, processed: 0, updated: 0, added: 0 };
      }

      userStats[user].count++;
      userStats[user].processed += processed;
      userStats[user].updated += updated;
      userStats[user].added += added;
    });

    console.log('\n実行者別統計:');
    Object.entries(userStats).forEach(([user, stats]) => {
      console.log(`\n${user}:`);
      console.log(`  実行回数: ${stats.count}`);
      console.log(`  処理ページ数合計: ${stats.processed}`);
      console.log(`  更新ページ数合計: ${stats.updated}`);
      console.log(`  追加PDF数合計: ${stats.added}`);
    });
  } catch (error) {
    console.error('統計情報の取得エラー:', error);
  }
}

/**
 * すべての結果と統計情報を表示
 */
function checkResultsWithStatistics(): void {
  // 基本的な結果チェック
  checkAllResults();
  
  // 統計情報を表示
  showChangesStatistics();
  showUserLogStatistics();
}