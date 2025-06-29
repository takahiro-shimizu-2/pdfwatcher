/**
 * PDFリンク件名取得機能 & PageSummary 7世代拡張 - 統合検証ツール
 * 新形式のデータが各シートで正しく処理されているか検証
 * PageSummaryの世代管理も同時に検証
 */

// マスタースプレッドシートID（必要に応じて変更）
const MASTER_SPREADSHEET_ID = '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0';

/**
 * Currentシートのデータ形式を検証
 */
function verifyCurrentSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const currentSheet = spreadsheet.getSheetByName('Current');
    
    if (!currentSheet) {
      SpreadsheetApp.getUi().alert('エラー', 'Currentシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const data = currentSheet.getDataRange().getValues();
    console.log('Currentシート検証');
    console.log(`行数: ${data.length}`);
    
    let validRows = 0;
    let invalidRows = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // 新形式: ページURL, ハッシュ, 件名, PDF URL の4列
      if (row[0] && row[1] && row[2] && row[3]) {
        if (row.length === 4) {
          validRows++;
        } else {
          invalidRows.push({ rowNum: i + 1, columns: row.length, data: row });
        }
      }
    }
    
    console.log(`\n有効な行数: ${validRows}`);
    console.log(`無効な行数: ${invalidRows.length}`);
    
    if (invalidRows.length > 0) {
      console.log('\n無効な行:');
      invalidRows.forEach(invalid => {
        console.log(`  行${invalid.rowNum}: ${invalid.columns}列 - ${invalid.data.join(' | ')}`);
      });
    }
    
    // パーサーのテスト
    testParser(data);
    
  } catch (error) {
    console.error('エラー:', error);
    SpreadsheetApp.getUi().alert('エラー', `検証中にエラーが発生しました: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * パーサーのテスト
 */
function testParser(data) {
  console.log('\nパーサーテスト');
  
  // parseCurrentSheetのロジックをテスト
  const pageMap = new Map();
  
  data.forEach((row, index) => {
    if (row[0] && row[1] && row[2] && row[3]) {
      const key = `${row[0]}_${row[1]}`; // URL + Hash
      
      if (!pageMap.has(key)) {
        pageMap.set(key, {
          url: row[0],
          hash: row[1],
          pdfs: []
        });
      }
      
      pageMap.get(key).pdfs.push({
        url: row[3],
        subject: row[2]
      });
    }
  });
  
  console.log(`\nページ数: ${pageMap.size}`);
  
  // 最初の3ページを表示
  let count = 0;
  for (const [key, page] of pageMap) {
    if (count >= 3) break;
    console.log(`\nページ${count + 1}: ${page.url}`);
    console.log(`  ハッシュ: ${page.hash}`);
    console.log(`  PDF数: ${page.pdfs.length}`);
    page.pdfs.slice(0, 3).forEach((pdf, idx) => {
      console.log(`    PDF${idx + 1}: ${pdf.subject} - ${pdf.url}`);
    });
    if (page.pdfs.length > 3) {
      console.log(`    ... 他 ${page.pdfs.length - 3} 件`);
    }
    count++;
  }
}

/**
 * 各シートの件名表示を検証
 */
function verifySubjectInSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let report = '各シートの件名表示検証\n';
  
  // Changesシート
  const changesSheet = spreadsheet.getSheetByName('Changes');
  if (changesSheet) {
    const data = changesSheet.getDataRange().getValues();
    report += '\n【Changesシート】\n';
    report += `列数: ${data[0] ? data[0].length : 0}\n`;
    if (data.length > 0) {
      // ヘッダー確認（ページURL | 件名 | PDFのURL）
      report += `ヘッダー: ${data[0].join(' | ')}\n`;
      // データサンプル
      for (let i = 1; i < Math.min(4, data.length); i++) {
        if (data[i][1]) { // 件名列
          report += `  件名: "${data[i][1]}" (${data[i][2]})\n`;
        }
      }
    }
  }
  
  // ArchivePDFシート
  const archiveSheet = spreadsheet.getSheetByName('ArchivePDF');
  if (archiveSheet) {
    const data = archiveSheet.getDataRange().getValues();
    report += '\n【ArchivePDFシート】\n';
    report += `列数: ${data[0] ? data[0].length : 0}\n`;
    if (data.length > 0) {
      // ヘッダー確認（ページURL | 件名 | PDF URL | ...）
      report += `ヘッダー: ${data[0].join(' | ')}\n`;
      // データサンプル
      for (let i = 1; i < Math.min(4, data.length); i++) {
        if (data[i][1]) { // 件名列
          report += `  件名: "${data[i][1]}" (${data[i][2]})\n`;
        }
      }
    }
  }
  
  // ChangesHistoryシート
  const historySheet = spreadsheet.getSheetByName('ChangesHistory');
  if (historySheet) {
    const data = historySheet.getDataRange().getValues();
    report += '\n【ChangesHistoryシート】\n';
    report += `列数: ${data[0] ? data[0].length : 0}\n`;
    if (data.length > 0) {
      // ヘッダー確認（保存日時 | 実行ID | ページURL | 件名 | PDFのURL | 削除予定日時）
      report += `ヘッダー: ${data[0].join(' | ')}\n`;
      // データサンプル
      for (let i = 1; i < Math.min(4, data.length); i++) {
        if (data[i][3]) { // 件名列
          report += `  件名: "${data[i][3]}" (${data[i][4]})\n`;
        }
      }
    }
  }
  
  console.log(report);
  
  // レポートをシートに出力
  outputReport(report);
}

/**
 * レポートをシートに出力
 */
function outputReport(report) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let reportSheet = spreadsheet.getSheetByName('SubjectVerificationReport');
  
  if (!reportSheet) {
    reportSheet = spreadsheet.insertSheet('SubjectVerificationReport');
  }
  
  reportSheet.clear();
  
  const reportLines = report.split('\n');
  reportSheet.getRange(1, 1).setValue('PDFリンク件名取得機能 検証レポート');
  reportSheet.getRange(2, 1).setValue(new Date().toLocaleString());
  
  for (let i = 0; i < reportLines.length; i++) {
    reportSheet.getRange(i + 4, 1).setValue(reportLines[i]);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('検証レポートを生成しました', 'SubjectVerificationReport', 3);
}

/**
 * テストデータをCurrentシートに貼り付け
 */
function pasteTestData(testDataNumber) {
  if (!testDataNumber) {
    testDataNumber = SpreadsheetApp.getUi().prompt(
      'テストデータ選択',
      'テストデータ番号を入力してください (1-8):',
      SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
    ).getResponseText();
  }
  
  const num = parseInt(testDataNumber);
  if (isNaN(num) || num < 1 || num > 8) {
    SpreadsheetApp.getUi().alert('エラー', '1から8の数字を入力してください', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // ここにテストデータを定義（実際のファイルから読み込む代わりに）
  // 実装時は実際のテストデータを使用
  SpreadsheetApp.getUi().alert('情報', `Current${num}_new_format.txt のデータをCurrentシートに貼り付けてください`, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * PageSummary 7世代拡張の検証（test-verification-tool.gsより）
 */
function verifyPageSummary() {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      SpreadsheetApp.getUi().alert('エラー', 'マスターシートのPageSummaryが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const data = pageSummarySheet.getDataRange().getValues();
    console.log('\nPageSummary 7世代拡張検証');
    console.log(`行数: ${data.length}`);
    
    if (data.length > 0) {
      // ヘッダー行の確認
      console.log('\nヘッダー:');
      console.log(data[0].join(' | '));
      
      // データ行のサンプル表示（最初の3行）
      console.log('\nデータサンプル:');
      for (let i = 1; i < Math.min(4, data.length); i++) {
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
    generatePageSummaryReport(data);
    
  } catch (error) {
    console.error('エラー:', error);
    SpreadsheetApp.getUi().alert('エラー', `PageSummary検証でエラーが発生しました: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * PageSummary世代シフトの検証レポート生成
 */
function generatePageSummaryReport(data) {
  let report = '\nPageSummary 世代シフト検証レポート\n';
  
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
  
  console.log(report);
  return report;
}

/**
 * 統合レポートの出力
 */
function outputIntegratedReport(subjectReport, pageSummaryReport) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let reportSheet = spreadsheet.getSheetByName('IntegratedVerificationReport');
  
  if (!reportSheet) {
    reportSheet = spreadsheet.insertSheet('IntegratedVerificationReport');
  }
  
  reportSheet.clear();
  
  // ヘッダー
  reportSheet.getRange(1, 1).setValue('PDFリンク件名 & PageSummary 統合検証レポート');
  reportSheet.getRange(2, 1).setValue(new Date().toLocaleString());
  
  // テストデータ情報を追加
  reportSheet.getRange(3, 1).setValue('使用テストデータ');
  reportSheet.getRange(4, 1).setValue('新形式データ（ページURL | ハッシュ | 件名 | PDF URL）');
  reportSheet.getRange(5, 1).setValue('※ 1ページに複数PDFがある場合は、PDFごとに1行ずつ記載');
  
  // 件名検証レポート
  const subjectLines = subjectReport.split('\n');
  let row = 7;
  for (let i = 0; i < subjectLines.length; i++) {
    reportSheet.getRange(row++, 1).setValue(subjectLines[i]);
  }
  
  // PageSummaryレポート
  row += 2;
  reportSheet.getRange(row++, 1).setValue('PageSummary 7世代拡張検証');
  const pageSummaryLines = pageSummaryReport.split('\n');
  for (let i = 0; i < pageSummaryLines.length; i++) {
    reportSheet.getRange(row++, 1).setValue(pageSummaryLines[i]);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('統合検証レポートを生成しました', 'IntegratedVerificationReport', 3);
}

/**
 * 統合検証の実行
 */
function runIntegratedVerification() {
  console.log('統合検証開始\n');
  
  // Currentシート検証
  verifyCurrentSheet();
  
  // 各シートの件名表示検証
  const subjectReport = getSubjectVerificationReport();
  
  // PageSummary検証
  const pageSummaryReport = getPageSummaryVerificationReport();
  
  // 統合レポート出力
  outputIntegratedReport(subjectReport, pageSummaryReport);
}

/**
 * 件名検証レポートの取得（レポート文字列を返す）
 */
function getSubjectVerificationReport() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let report = '各シートの件名表示検証\n';
  
  // Changesシート
  const changesSheet = spreadsheet.getSheetByName('Changes');
  if (changesSheet) {
    const data = changesSheet.getDataRange().getValues();
    report += '\n【Changesシート】\n';
    report += `列数: ${data[0] ? data[0].length : 0}\n`;
    if (data.length > 0) {
      report += `ヘッダー: ${data[0].join(' | ')}\n`;
      for (let i = 1; i < Math.min(4, data.length); i++) {
        if (data[i][1]) {
          report += `  件名: "${data[i][1]}" (${data[i][2]})\n`;
        }
      }
    }
  }
  
  // ArchivePDFシート
  const archiveSheet = spreadsheet.getSheetByName('ArchivePDF');
  if (archiveSheet) {
    const data = archiveSheet.getDataRange().getValues();
    report += '\n【ArchivePDFシート】\n';
    report += `列数: ${data[0] ? data[0].length : 0}\n`;
    if (data.length > 0) {
      report += `ヘッダー: ${data[0].join(' | ')}\n`;
      for (let i = 1; i < Math.min(4, data.length); i++) {
        if (data[i][1]) {
          report += `  件名: "${data[i][1]}" (${data[i][2]})\n`;
        }
      }
    }
  }
  
  return report;
}

/**
 * PageSummary検証レポートの取得
 */
function getPageSummaryVerificationReport() {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      return 'PageSummaryシートが見つかりません';
    }
    
    const data = pageSummarySheet.getDataRange().getValues();
    return generatePageSummaryReport(data);
    
  } catch (error) {
    return `PageSummary検証エラー: ${error.message}`;
  }
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
    message += '世代履歴 ===\n';
    
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
 * マスターシートのPageSummaryを直接取得して表示（詳細版）
 */
function verifyMasterPageSummaryDetailed() {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      SpreadsheetApp.getUi().alert('エラー', 'マスターシートのPageSummaryが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const data = pageSummarySheet.getDataRange().getValues();
    console.log('マスターシートのPageSummary（詳細版）');
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
 * 世代シフトの詳細検証レポート生成
 */
function generateShiftVerificationReport(data) {
  let report = '\n\n世代シフト検証レポート（詳細版）\n';
  
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
  outputDetailedVerificationReport(report, data);
}

/**
 * 詳細検証レポートをシートに出力
 */
function outputDetailedVerificationReport(report, rawData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let reportSheet = spreadsheet.getSheetByName('DetailedVerificationReport');
  
  if (!reportSheet) {
    reportSheet = spreadsheet.insertSheet('DetailedVerificationReport');
  }
  
  reportSheet.clear();
  
  // レポートテキストを出力
  const reportLines = report.split('\n');
  reportSheet.getRange(1, 1).setValue('PageSummary 7世代拡張 詳細検証レポート');
  reportSheet.getRange(2, 1).setValue(new Date().toLocaleString());
  
  for (let i = 0; i < reportLines.length; i++) {
    reportSheet.getRange(i + 4, 1).setValue(reportLines[i]);
  }
  
  // 生データのスナップショットも保存
  if (rawData && rawData.length > 0) {
    const startRow = reportLines.length + 6;
    reportSheet.getRange(startRow, 1).setValue('マスターシートのPageSummaryスナップショット');
    
    const numRows = Math.min(rawData.length, 100); // 最大100行
    const numCols = rawData[0].length;
    reportSheet.getRange(startRow + 2, 1, numRows, numCols).setValues(rawData.slice(0, numRows));
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('詳細検証レポートを生成しました', 'DetailedVerificationReport', 3);
}

/**
 * 検証メニューの追加
 */
function addVerificationMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('統合検証ツール')
    .addItem('統合検証実行', 'runIntegratedVerification')
    .addSeparator()
    .addSubMenu(ui.createMenu('個別検証')
      .addItem('Currentシート検証', 'verifyCurrentSheet')
      .addItem('各シートの件名表示検証', 'verifySubjectInSheets')
      .addItem('PageSummary検証', 'verifyPageSummary')
      .addItem('PageSummary詳細検証', 'verifyMasterPageSummaryDetailed'))
    .addSeparator()
    .addItem('特定ページの履歴追跡', 'trackPageHistory')
    .addItem('テストデータ貼り付けガイド', 'pasteTestData')
    .addToUi();
}

// スプレッドシート開いた時に自動実行
function onOpen() {
  addVerificationMenu();
}