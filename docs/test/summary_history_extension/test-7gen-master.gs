/**
 * PageSummary 7世代拡張テストスクリプト（マスター用）
 * 
 * 使用方法:
 * 1. マスタースプレッドシートのGASエディタにこのスクリプトをコピー
 * 2. runAllMasterTests() を実行
 * 3. コンソールで結果を確認
 */

// マスタースプレッドシートIDを設定
const MASTER_SPREADSHEET_ID = '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0';

// ===== TEST-M001: マスターでの空シートからの7世代初期化テスト =====
function testM001_InitializeEmpty7GenSheet() {
  console.log('=== TEST-M001: マスターでの空シートからの7世代初期化テスト ===');
  
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  
  // PageSummaryシートが存在する場合は削除（クリーンな状態から開始）
  const existingSheet = masterSpreadsheet.getSheetByName('PageSummary');
  if (existingSheet) {
    console.log('既存のPageSummaryシートを削除します');
    masterSpreadsheet.deleteSheet(existingSheet);
  }
  
  // 設定とサービスの初期化
  configure('sheet', MASTER_SPREADSHEET_ID);
  const container = createServiceContainer(masterSpreadsheet);
  
  // テストデータ
  const testResult = {
    pageUrl: 'https://test-page1.com',
    pageUpdated: true,
    pdfUpdated: false,
    addedPdfUrls: ['https://test-page1.com/test.pdf'],
    removedPdfUrls: [],
    addedCount: 1,
    pageHash: 'hash001'
  };
  
  console.log('テストデータを投入:', testResult);
  
  try {
    // summaryRepoを使って直接更新
    container.summaryRepo.updatePageSummary(testResult.pageUrl, testResult);
    
    // シートの状態を確認
    const sheet = masterSpreadsheet.getSheetByName('PageSummary');
    if (sheet) {
      console.log('\n=== 作成されたシートの確認 ===');
      console.log('列数:', sheet.getLastColumn());
      console.log('行数:', sheet.getLastRow());
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      console.log('ヘッダー数:', headers.length);
      console.log('期待値: 30列（7世代形式）');
      
      // ヘッダーの内容を確認
      console.log('\nヘッダー内容:');
      for (let i = 0; i < headers.length; i += 4) {
        if (i === 0) {
          console.log(`列${i+1}-${i+2}: ${headers[i]}, ${headers[i+1]}`);
        } else {
          console.log(`列${i+1}-${i+4}: ${headers[i]}, ${headers[i+1]}, ${headers[i+2]}, ${headers[i+3]}`);
        }
      }
      
      // データの確認
      if (sheet.getLastRow() > 1) {
        const dataRow = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
        console.log('\n=== 投入されたデータ ===');
        console.log('PageURL:', dataRow[0]);
        console.log('LastHash:', dataRow[1]);
        console.log('Run-1 Date:', dataRow[2]);
        console.log('Run-1 PageUpdated:', dataRow[3]);
        console.log('Run-1 PDFUpdated:', dataRow[4]);
        console.log('Run-1 AddedCount:', dataRow[5]);
      }
      
      return sheet.getLastColumn() === 30 ? 'PASS' : 'FAIL';
    } else {
      console.error('シートが作成されませんでした');
      return 'FAIL';
    }
    
  } catch (error) {
    console.error('エラー:', error);
    return 'FAIL';
  }
}

// ===== TEST-M002: マスターでの7世代シフト動作テスト =====
function testM002_SevenGenerationShift() {
  console.log('\n=== TEST-M002: マスターでの7世代シフト動作テスト ===');
  
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  const container = createServiceContainer(masterSpreadsheet);
  
  const testUrl = 'https://test-shift.com';
  
  // 7回実行
  for (let i = 1; i <= 7; i++) {
    const testResult = {
      pageUrl: testUrl,
      pageUpdated: true,
      pdfUpdated: i % 2 === 0, // 偶数回はPDFも更新
      addedPdfUrls: [],
      removedPdfUrls: [],
      addedCount: i,
      pageHash: `hash00${i}`
    };
    
    console.log(`\n--- 実行 ${i} ---`);
    container.summaryRepo.updatePageSummary(testUrl, testResult);
    
    // 結果を確認
    const summary = container.summaryRepo.getPageSummary(testUrl);
    if (summary) {
      console.log(`run1: ${summary.run1 ? summary.run1.addedCount : 'null'}`);
      console.log(`run2: ${summary.run2 ? summary.run2.addedCount : 'null'}`);
      console.log(`run3: ${summary.run3 ? summary.run3.addedCount : 'null'}`);
      console.log(`run4: ${summary.run4 ? summary.run4.addedCount : 'null'}`);
      console.log(`run5: ${summary.run5 ? summary.run5.addedCount : 'null'}`);
      console.log(`run6: ${summary.run6 ? summary.run6.addedCount : 'null'}`);
      console.log(`run7: ${summary.run7 ? summary.run7.addedCount : 'null'}`);
    }
  }
  
  // 8回目の実行（run7が削除されることを確認）
  console.log('\n--- 実行 8（run7が削除される） ---');
  const testResult8 = {
    pageUrl: testUrl,
    pageUpdated: true,
    pdfUpdated: false,
    addedPdfUrls: [],
    removedPdfUrls: [],
    addedCount: 8,
    pageHash: 'hash008'
  };
  
  container.summaryRepo.updatePageSummary(testUrl, testResult8);
  
  const finalSummary = container.summaryRepo.getPageSummary(testUrl);
  if (finalSummary) {
    console.log('最終状態:');
    console.log(`run1: ${finalSummary.run1 ? finalSummary.run1.addedCount : 'null'} (期待値: 8)`);
    console.log(`run2: ${finalSummary.run2 ? finalSummary.run2.addedCount : 'null'} (期待値: 7)`);
    console.log(`run3: ${finalSummary.run3 ? finalSummary.run3.addedCount : 'null'} (期待値: 6)`);
    console.log(`run4: ${finalSummary.run4 ? finalSummary.run4.addedCount : 'null'} (期待値: 5)`);
    console.log(`run5: ${finalSummary.run5 ? finalSummary.run5.addedCount : 'null'} (期待値: 4)`);
    console.log(`run6: ${finalSummary.run6 ? finalSummary.run6.addedCount : 'null'} (期待値: 3)`);
    console.log(`run7: ${finalSummary.run7 ? finalSummary.run7.addedCount : 'null'} (期待値: 2)`);
    
    // 検証
    const isCorrect = 
      finalSummary.run1?.addedCount === 8 &&
      finalSummary.run2?.addedCount === 7 &&
      finalSummary.run3?.addedCount === 6 &&
      finalSummary.run4?.addedCount === 5 &&
      finalSummary.run5?.addedCount === 4 &&
      finalSummary.run6?.addedCount === 3 &&
      finalSummary.run7?.addedCount === 2;
      
    return isCorrect ? 'PASS' : 'FAIL';
  }
  
  return 'FAIL';
}

// ===== TEST-M003: マスターでの3世代データ移行テスト =====
function testM003_BackwardCompatibility() {
  console.log('\n=== TEST-M003: マスターでの3世代データ移行テスト ===');
  
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  let sheet = masterSpreadsheet.getSheetByName('PageSummary');
  
  // 一旦シートを削除して3世代形式で作成
  if (sheet) {
    masterSpreadsheet.deleteSheet(sheet);
  }
  
  // 3世代形式のシートを手動で作成
  sheet = masterSpreadsheet.insertSheet('PageSummary');
  const oldHeaders = [
    'PageURL', 'LastHash',
    'Run-1 Date', 'Run-1 PU', 'Run-1 PFU', 'Run-1 Cnt',
    'Run-2 Date', 'Run-2 PU', 'Run-2 PFU', 'Run-2 Cnt',
    'Run-3 Date', 'Run-3 PU', 'Run-3 PFU', 'Run-3 Cnt'
  ];
  sheet.getRange(1, 1, 1, 14).setValues([oldHeaders]);
  
  // 3世代形式のテストデータを投入
  const testData = [
    'https://legacy-test.com', 'legacy-hash',
    new Date('2024-01-01'), true, false, 100,
    new Date('2024-01-02'), false, true, 200,
    new Date('2024-01-03'), true, true, 300
  ];
  sheet.getRange(2, 1, 1, 14).setValues([testData]);
  
  console.log('3世代形式のデータを作成しました');
  console.log('列数:', sheet.getLastColumn());
  
  // リポジトリ経由で読み込み（自動移行がトリガーされる）
  console.log('\nリポジトリ経由でデータを読み込み...');
  const container = createServiceContainer(masterSpreadsheet);
  const summary = container.summaryRepo.getPageSummary('https://legacy-test.com');
  
  // 移行後の確認
  sheet = masterSpreadsheet.getSheetByName('PageSummary');
  console.log('\n移行後:');
  console.log('列数:', sheet.getLastColumn());
  
  if (summary) {
    console.log('\n読み込まれたデータ:');
    console.log('run1:', summary.run1?.addedCount, '(期待値: 100)');
    console.log('run2:', summary.run2?.addedCount, '(期待値: 200)');
    console.log('run3:', summary.run3?.addedCount, '(期待値: 300)');
    console.log('run4:', summary.run4?.addedCount, '(期待値: undefined)');
    
    const isCorrect = 
      sheet.getLastColumn() === 30 &&
      summary.run1?.addedCount === 100 &&
      summary.run2?.addedCount === 200 &&
      summary.run3?.addedCount === 300 &&
      summary.run4 === undefined;
      
    return isCorrect ? 'PASS' : 'FAIL';
  }
  
  return 'FAIL';
}

// ===== TEST-M004: バッチ処理での統合テスト =====
function testM004_BatchProcessing() {
  console.log('\n=== TEST-M004: バッチ処理での統合テスト ===');
  
  const testPages = [
    { url: 'https://batch-test1.com', hash: 'batch-hash1', pdfUrls: [] },
    { url: 'https://batch-test2.com', hash: 'batch-hash2', pdfUrls: [] },
    { url: 'https://batch-test3.com', hash: 'batch-hash3', pdfUrls: [] }
  ];
  
  try {
    // バッチ処理を実行
    const result = runBatch({
      pages: testPages,
      user: 'test-user',
      masterSpreadsheetId: MASTER_SPREADSHEET_ID,
      execId: 'test-exec-' + new Date().getTime()
    });
    
    console.log('バッチ処理結果:', {
      processedPages: result.processedPages,
      updatedPages: result.updatedPages,
      errors: result.errors.length
    });
    
    // 各ページのSummaryを確認
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    const container = createServiceContainer(masterSpreadsheet);
    
    let allCorrect = true;
    testPages.forEach(page => {
      const summary = container.summaryRepo.getPageSummary(page.url);
      console.log(`\n${page.url}:`);
      if (summary && summary.run1) {
        console.log('  run1 date:', summary.run1.date);
        console.log('  run1 pageUpdated:', summary.run1.pageUpdated);
      } else {
        console.log('  データなし');
        allCorrect = false;
      }
    });
    
    return allCorrect ? 'PASS' : 'FAIL';
    
  } catch (error) {
    console.error('バッチ処理エラー:', error);
    return 'FAIL';
  }
}

// ===== 全マスターテスト実行 =====
function runAllMasterTests() {
  console.log('===== PageSummary 7世代拡張テスト（マスター）開始 =====\n');
  console.log('実行時刻:', new Date().toLocaleString('ja-JP'));
  console.log('マスタースプレッドシートID:', MASTER_SPREADSHEET_ID);
  console.log('');
  
  const results = [];
  
  // Test M001: 初期化テスト
  results.push({
    test: 'TEST-M001: 空シートからの7世代初期化',
    result: testM001_InitializeEmpty7GenSheet()
  });
  
  // Test M002: シフト動作テスト
  results.push({
    test: 'TEST-M002: 7世代シフト動作',
    result: testM002_SevenGenerationShift()
  });
  
  // Test M003: 後方互換性テスト
  results.push({
    test: 'TEST-M003: 3世代データの移行',
    result: testM003_BackwardCompatibility()
  });
  
  // Test M004: バッチ処理テスト
  results.push({
    test: 'TEST-M004: バッチ処理での動作',
    result: testM004_BatchProcessing()
  });
  
  // 結果サマリー
  console.log('\n===== テスト結果サマリー =====');
  results.forEach(r => {
    console.log(`${r.test}: ${r.result}`);
  });
  
  const passCount = results.filter(r => r.result === 'PASS').length;
  const totalCount = results.length;
  console.log(`\n合格: ${passCount}/${totalCount}`);
  console.log(`総合結果: ${passCount === totalCount ? '✅ すべて合格' : '❌ 一部失敗'}`);
}

// ===== ユーティリティ関数 =====

// マスターのPageSummaryシートの状態を確認
function checkMasterPageSummaryState() {
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  const sheet = masterSpreadsheet.getSheetByName('PageSummary');
  
  if (!sheet) {
    console.log('PageSummaryシートが存在しません');
    return;
  }
  
  console.log('=== マスターPageSummaryシートの状態 ===');
  console.log('列数:', sheet.getLastColumn());
  console.log('行数:', sheet.getLastRow());
  
  if (sheet.getLastColumn() > 0) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('\nヘッダー:');
    headers.forEach((header, index) => {
      if (header) console.log(`  列${index + 1}: ${header}`);
    });
  }
  
  if (sheet.getLastRow() > 1) {
    console.log('\nデータ行数:', sheet.getLastRow() - 1);
  }
}

// マスターのPageSummaryシートをクリア（ヘッダーは残す）
function clearMasterPageSummaryData() {
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  const sheet = masterSpreadsheet.getSheetByName('PageSummary');
  
  if (!sheet) {
    console.log('PageSummaryシートが存在しません');
    return;
  }
  
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    console.log('マスターPageSummaryシートのデータをクリアしました');
  } else {
    console.log('クリアするデータがありません');
  }
}

// デバッグ用：シートの内容を詳細表示
function debugShowSheetContent() {
  const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
  const sheet = masterSpreadsheet.getSheetByName('PageSummary');
  
  if (!sheet) {
    console.log('PageSummaryシートが存在しません');
    return;
  }
  
  console.log('=== シート内容の詳細 ===');
  const allData = sheet.getDataRange().getValues();
  
  allData.forEach((row, rowIndex) => {
    console.log(`行${rowIndex + 1}:`, row.slice(0, 10).join(' | '));
  });
}