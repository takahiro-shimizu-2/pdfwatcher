/**
 * PageSummary 7世代拡張 - 検証ツール
 * マスターシートのPageSummaryを直接確認して世代シフトを検証
 */

// マスタースプレッドシートID
const MASTER_SPREADSHEET_ID = '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0';

/**
 * マスターシートのPageSummaryを直接取得して表示
 */
function verifyMasterPageSummary() {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      SpreadsheetApp.getUi().alert('エラー', 'マスターシートのPageSummaryが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const data = pageSummarySheet.getDataRange().getValues();
    console.log('=== マスターシートのPageSummary ===');
    console.log(`行数: ${data.length}`);
    
    if (data.length > 0) {
      // ヘッダー行の確認
      console.log('\nヘッダー:');
      console.log(data[0].join(' | '));
      
      // データ行のサンプル表示（最初の5行）
      console.log('\nデータサンプル:');
      for (let i = 1; i < Math.min(6, data.length); i++) {
        const row = data[i];
        console.log(`\n--- 行${i}: ${row[0]} ---`);
        console.log(`最新ハッシュ: ${row[1]}`);
        
        // 各世代の状態を確認
        const runs = ['実行1', '実行2', '実行3', '実行4', '実行5', '実行6', '実行7'];
        for (let j = 0; j < 7; j++) {
          const baseIdx = 2 + (j * 4);
          if (row[baseIdx]) {
            console.log(`${runs[j]}: 日時=${row[baseIdx]}, ページ=${row[baseIdx+1]}, PDF=${row[baseIdx+2]}, 追加数=${row[baseIdx+3]}`);
          }
        }
      }
    }
    
    // 世代シフトの検証レポート生成
    generateShiftVerificationReport(data);
    
  } catch (error) {
    console.error('エラー:', error);
    SpreadsheetApp.getUi().alert('エラー', `マスターシートへのアクセスでエラーが発生しました: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 世代シフトの検証レポート生成
 */
function generateShiftVerificationReport(data) {
  let report = '\n\n=== 世代シフト検証レポート ===\n';
  
  // 各ページURLごとの世代使用状況を分析
  const pageStats = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const pageUrl = row[0];
    if (!pageUrl) continue;
    
    let generationCount = 0;
    let generations = [];
    
    // 各世代のデータ有無を確認
    for (let j = 0; j < 7; j++) {
      const dateIdx = 2 + (j * 4);
      if (row[dateIdx]) {
        generationCount++;
        generations.push({
          generation: j + 1,
          date: row[dateIdx],
          addedCount: row[dateIdx + 3]
        });
      }
    }
    
    pageStats[pageUrl] = {
      generationCount,
      generations
    };
  }
  
  // 統計情報
  const totalPages = Object.keys(pageStats).length;
  let maxGenerations = 0;
  let pagesWithFullGenerations = 0;
  
  for (const [url, stats] of Object.entries(pageStats)) {
    if (stats.generationCount > maxGenerations) {
      maxGenerations = stats.generationCount;
    }
    if (stats.generationCount === 7) {
      pagesWithFullGenerations++;
    }
  }
  
  report += `\n総ページ数: ${totalPages}`;
  report += `\n最大世代数: ${maxGenerations}`;
  report += `\n7世代フルのページ数: ${pagesWithFullGenerations}`;
  
  // 詳細表示（最初の3ページ）
  report += '\n\n--- ページごとの世代状況（サンプル） ---';
  let count = 0;
  for (const [url, stats] of Object.entries(pageStats)) {
    if (count >= 3) break;
    report += `\n\n${url}:`;
    report += `\n  世代数: ${stats.generationCount}`;
    for (const gen of stats.generations) {
      report += `\n  実行${gen.generation}: ${gen.date} (追加数: ${gen.addedCount})`;
    }
    count++;
  }
  
  console.log(report);
  
  // レポートをシートに出力
  outputVerificationReport(report, data);
}

/**
 * 検証レポートをシートに出力
 */
function outputVerificationReport(report, rawData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let reportSheet = spreadsheet.getSheetByName('VerificationReport');
  
  if (!reportSheet) {
    reportSheet = spreadsheet.insertSheet('VerificationReport');
  }
  
  reportSheet.clear();
  
  // レポートテキストを出力
  const reportLines = report.split('\n');
  reportSheet.getRange(1, 1).setValue('PageSummary 7世代拡張 検証レポート');
  reportSheet.getRange(2, 1).setValue(new Date().toLocaleString());
  
  for (let i = 0; i < reportLines.length; i++) {
    reportSheet.getRange(i + 4, 1).setValue(reportLines[i]);
  }
  
  // 生データのスナップショットも保存
  if (rawData && rawData.length > 0) {
    const startRow = reportLines.length + 6;
    reportSheet.getRange(startRow, 1).setValue('=== マスターシートのPageSummaryスナップショット ===');
    
    const numRows = Math.min(rawData.length, 100); // 最大100行
    const numCols = rawData[0].length;
    reportSheet.getRange(startRow + 2, 1, numRows, numCols).setValues(rawData.slice(0, numRows));
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('検証レポートを生成しました', 'VerificationReport', 3);
}

/**
 * 特定ページの世代履歴を追跡
 */
function trackPageHistory(pageUrl) {
  if (!pageUrl) {
    pageUrl = SpreadsheetApp.getUi().prompt(
      'ページURL入力',
      '追跡するページURLを入力してください:',
      SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
    ).getResponseText();
  }
  
  if (!pageUrl) return;
  
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      SpreadsheetApp.getUi().alert('エラー', 'PageSummaryシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const data = pageSummarySheet.getDataRange().getValues();
    let targetRow = null;
    
    // 対象ページを検索
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === pageUrl) {
        targetRow = data[i];
        break;
      }
    }
    
    if (!targetRow) {
      SpreadsheetApp.getUi().alert('結果', `ページ ${pageUrl} は見つかりませんでした`, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // 履歴を表示
    let message = `ページ: ${pageUrl}\n`;
    message += `最新ハッシュ: ${targetRow[1]}\n\n`;
    message += '=== 世代履歴 ===\n';
    
    for (let j = 0; j < 7; j++) {
      const baseIdx = 2 + (j * 4);
      if (targetRow[baseIdx]) {
        message += `\n実行${j + 1}:\n`;
        message += `  日時: ${targetRow[baseIdx]}\n`;
        message += `  ページ更新: ${targetRow[baseIdx + 1]}\n`;
        message += `  PDF更新: ${targetRow[baseIdx + 2]}\n`;
        message += `  追加数: ${targetRow[baseIdx + 3]}\n`;
      }
    }
    
    console.log(message);
    SpreadsheetApp.getUi().alert('ページ履歴', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('エラー:', error);
    SpreadsheetApp.getUi().alert('エラー', `エラーが発生しました: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 検証メニューの追加
 */
function addVerificationMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('7世代検証ツール')
    .addItem('マスターシートのPageSummary確認', 'verifyMasterPageSummary')
    .addItem('特定ページの履歴追跡', 'trackPageHistory')
    .addSeparator()
    .addItem('検証レポート再生成', 'regenerateReport')
    .addToUi();
}

/**
 * レポート再生成
 */
function regenerateReport() {
  verifyMasterPageSummary();
}

// スプレッドシート開いた時に自動実行
function onOpen() {
  addVerificationMenu();
}