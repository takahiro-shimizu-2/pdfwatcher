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

/**
 * 開発用ログシートを作成または取得
 */
function getOrCreateDevLogSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'DevLog';
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // ヘッダーを設定
    const headers = [
      'テスト日時',
      'テスト種別',
      'ページURL', 
      'PDF数',
      '追加PDF数',
      '削除PDF数',
      'サンプルPDF1_URL',
      'サンプルPDF1_初回',
      'サンプルPDF1_最終',
      'サンプルPDF1_状態',
      'サンプルPDF2_URL',
      'サンプルPDF2_初回',
      'サンプルPDF2_最終',
      'サンプルPDF2_状態',
      'サンプルPDF3_URL',
      'サンプルPDF3_初回',
      'サンプルPDF3_最終',
      'サンプルPDF3_状態',
      '実行時間',
      '結果',
      'エラー',
      '備考'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * 開発用ログにテスト結果を記録
 * @param testType テストの種類（例: "新規追加", "継続確認", "削除検出", "再追加"）
 * @param note 備考（オプション）
 */
function logTestResult(testType: string, note?: string): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSS = SpreadsheetApp.openById(PDFWatcher.CONSTANTS.MASTER_SPREADSHEET_ID);
  const devLogSheet = getOrCreateDevLogSheet();
  
  try {
    // 現在のページURLを取得
    const currentSheet = ss.getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
    const pageUrl = currentSheet && currentSheet.getLastRow() > 1 
      ? currentSheet.getRange(2, 1).getValue() as string 
      : '';
    
    // 最新の実行結果を取得
    const userLogSheet = ss.getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
    let executionTime = '';
    let result = '';
    let error = '';
    let addedPdfCount = 0;
    
    if (userLogSheet && userLogSheet.getLastRow() > 1) {
      const lastRow = userLogSheet.getLastRow();
      const lastRun = userLogSheet.getRange(lastRow, 1, 1, 7).getValues()[0];
      executionTime = lastRun[1] ? `${lastRun[1]}秒` : '';
      addedPdfCount = lastRun[4] || 0;
      result = lastRun[5] || '';
      error = lastRun[6] || '';
    }
    
    // ArchivePDFから統計情報を取得
    const archiveSheet = masterSS.getSheetByName(PDFWatcher.SHEET_NAMES.ARCHIVE_PDF);
    let totalPdfCount = 0;
    let deletedPdfCount = 0;
    const samplePdfs: any[] = [];
    
    if (archiveSheet && pageUrl) {
      const archiveData = archiveSheet.getDataRange().getValues();
      const pageData = archiveData.filter(row => row[0] === pageUrl);
      totalPdfCount = pageData.length;
      deletedPdfCount = pageData.filter(row => row[4] === 'ページから削除').length;
      
      // サンプルPDF（最初の3つ）を取得
      for (let i = 0; i < Math.min(3, pageData.length); i++) {
        const row = pageData[i];
        samplePdfs.push({
          url: row[1],
          firstSeen: row[2],
          lastSeen: row[3],
          status: row[4]
        });
      }
    }
    
    // ログ行を作成
    const logRow = [
      new Date().toLocaleString('ja-JP'),
      testType,
      pageUrl,
      totalPdfCount,
      addedPdfCount,
      deletedPdfCount
    ];
    
    // サンプルPDFの情報を追加（3つ分のスペースを確保）
    for (let i = 0; i < 3; i++) {
      if (i < samplePdfs.length) {
        const pdf = samplePdfs[i];
        logRow.push(
          pdf.url,
          pdf.firstSeen,
          pdf.lastSeen,
          pdf.status
        );
      } else {
        logRow.push('', '', '', ''); // 空欄
      }
    }
    
    // 残りの情報を追加
    logRow.push(
      executionTime,
      result,
      error,
      note || ''
    );
    
    // ログシートに追記
    const newRow = devLogSheet.getLastRow() + 1;
    devLogSheet.getRange(newRow, 1, 1, logRow.length).setValues([logRow]);
    
    // 最新行を見やすくする
    devLogSheet.autoResizeColumns(1, logRow.length);
    devLogSheet.getRange(newRow, 1, 1, logRow.length).setBackground('#ffffcc');
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `テスト結果をDevLogシートに記録しました（${testType}）`,
      '記録完了',
      3
    );
    
  } catch (error) {
    console.error('テスト結果の記録エラー:', error);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `エラー: ${error}`,
      'エラー',
      5
    );
  }
}

/**
 * DevLogシートの内容を簡潔にまとめて出力
 */
function getDevLogSummary(): string {
  const devLogSheet = getOrCreateDevLogSheet();
  const lastRow = devLogSheet.getLastRow();
  
  if (lastRow <= 1) {
    return 'DevLogシートにデータがありません';
  }
  
  // 最新の5件を取得
  const startRow = Math.max(2, lastRow - 4);
  const numRows = lastRow - startRow + 1;
  const data = devLogSheet.getRange(startRow, 1, numRows, devLogSheet.getLastColumn()).getValues();
  const headers = devLogSheet.getRange(1, 1, 1, devLogSheet.getLastColumn()).getValues()[0];
  
  let summary = '=== DevLog 最新記録 ===\n\n';
  
  // 逆順で表示（最新を上に）
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    summary += `【${row[1]}】 ${row[0]}\n`;
    summary += `結果: ${row[19]} / 実行時間: ${row[18]}\n`;
    
    // サンプルPDF1の状態
    if (row[6]) {
      const pdfName = (row[6] as string).split('/').pop();
      summary += `${pdfName}: ${row[8]} → ${row[9]} [${row[10]}]\n`;
    }
    
    if (row[21]) summary += `備考: ${row[21]}\n`;
    summary += '\n';
  }
  
  console.log(summary);
  return summary;
}