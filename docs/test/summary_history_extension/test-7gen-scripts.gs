/**
 * PageSummary 7世代拡張テストスクリプト
 * 
 * 使用方法:
 * 1. このスクリプトをGASエディタにコピー
 * 2. runAllTests() を実行
 * 3. コンソールで結果を確認
 */

// ===== TEST-001: 空シートからの7世代初期化テスト =====
function test001_InitializeEmpty7GenSheet() {
  console.log('=== TEST-001: 空シートからの7世代初期化テスト ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // PageSummaryシートが存在する場合は削除（クリーンな状態から開始）
  const existingSheet = spreadsheet.getSheetByName('PageSummary');
  if (existingSheet) {
    console.log('既存のPageSummaryシートを削除します');
    spreadsheet.deleteSheet(existingSheet);
  }
  
  // ServerLibを使って最初のデータを投入
  const testData = {
    pageUrl: 'https://test-page1.com',
    pageUpdated: true,
    pdfUpdated: false,
    addedPdfUrls: ['https://test-page1.com/test.pdf'],
    removedPdfUrls: [],
    addedCount: 1,
    pageHash: 'hash001'
  };
  
  console.log('テストデータを投入:', testData);
  
  try {
    // この呼び出しで新規シートが作成される
    ServerLib.updatePageSummary(testData.pageUrl, testData);
    
    // シートの状態を確認
    const sheet = spreadsheet.getSheetByName('PageSummary');
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

// ===== TEST-002: 7世代シフト動作テスト =====
function test002_SevenGenerationShift() {
  console.log('\n=== TEST-002: 7世代シフト動作テスト ===');
  
  const testUrl = 'https://test-shift.com';
  const results = [];
  
  // 7回実行
  for (let i = 1; i <= 7; i++) {
    const testData = {
      pageUrl: testUrl,
      pageUpdated: true,
      pdfUpdated: i % 2 === 0, // 偶数回はPDFも更新
      addedPdfUrls: [],
      removedPdfUrls: [],
      addedCount: i,
      pageHash: `hash00${i}`
    };
    
    console.log(`\n--- 実行 ${i} ---`);
    ServerLib.updatePageSummary(testUrl, testData);
    
    // 結果を確認
    const summary = ServerLib.getPageSummary(testUrl);
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
  const testData8 = {
    pageUrl: testUrl,
    pageUpdated: true,
    pdfUpdated: false,
    addedPdfUrls: [],
    removedPdfUrls: [],
    addedCount: 8,
    pageHash: 'hash008'
  };
  
  ServerLib.updatePageSummary(testUrl, testData8);
  
  const finalSummary = ServerLib.getPageSummary(testUrl);
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

// ===== TEST-003: 複数ページでの動作確認 =====
function test003_MultiplePages() {
  console.log('\n=== TEST-003: 複数ページでの動作確認 ===');
  
  const testPages = [
    'https://test-multi1.com',
    'https://test-multi2.com',
    'https://test-multi3.com'
  ];
  
  // 各ページに3回ずつデータを投入
  testPages.forEach((pageUrl, pageIndex) => {
    console.log(`\n--- ページ ${pageIndex + 1}: ${pageUrl} ---`);
    
    for (let i = 1; i <= 3; i++) {
      const testData = {
        pageUrl: pageUrl,
        pageUpdated: true,
        pdfUpdated: false,
        addedPdfUrls: [],
        removedPdfUrls: [],
        addedCount: i * 10 + pageIndex,
        pageHash: `hash-p${pageIndex}-${i}`
      };
      
      ServerLib.updatePageSummary(pageUrl, testData);
    }
  });
  
  // 各ページのデータを確認
  console.log('\n=== 各ページの最終状態 ===');
  let allCorrect = true;
  
  testPages.forEach((pageUrl, pageIndex) => {
    const summary = ServerLib.getPageSummary(pageUrl);
    console.log(`\n${pageUrl}:`);
    
    if (summary) {
      console.log(`  run1: ${summary.run1?.addedCount} (期待値: ${30 + pageIndex})`);
      console.log(`  run2: ${summary.run2?.addedCount} (期待値: ${20 + pageIndex})`);
      console.log(`  run3: ${summary.run3?.addedCount} (期待値: ${10 + pageIndex})`);
      
      const isPageCorrect = 
        summary.run1?.addedCount === (30 + pageIndex) &&
        summary.run2?.addedCount === (20 + pageIndex) &&
        summary.run3?.addedCount === (10 + pageIndex);
        
      if (!isPageCorrect) allCorrect = false;
    } else {
      allCorrect = false;
    }
  });
  
  return allCorrect ? 'PASS' : 'FAIL';
}

// ===== TEST-004: 既存データとの互換性確認 =====
function test004_BackwardCompatibility() {
  console.log('\n=== TEST-004: 既存データとの互換性確認 ===');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('PageSummary');
  
  // 一旦シートを削除して3世代形式で作成
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
  }
  
  // 3世代形式のシートを手動で作成
  sheet = spreadsheet.insertSheet('PageSummary');
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
  
  // ServerLibで読み込み（自動移行がトリガーされる）
  console.log('\nServerLibでデータを読み込み...');
  const summary = ServerLib.getPageSummary('https://legacy-test.com');
  
  // 移行後の確認
  sheet = spreadsheet.getSheetByName('PageSummary');
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

// ===== 全テスト実行 =====
function runAllTests() {
  console.log('===== PageSummary 7世代拡張テスト開始 =====\n');
  console.log('実行時刻:', new Date().toLocaleString('ja-JP'));
  console.log('スプレッドシート:', SpreadsheetApp.getActiveSpreadsheet().getName());
  console.log('');
  
  const results = [];
  
  // Test 1: 初期化テスト
  results.push({
    test: 'TEST-001: 空シートからの7世代初期化',
    result: test001_InitializeEmpty7GenSheet()
  });
  
  // Test 2: シフト動作テスト
  results.push({
    test: 'TEST-002: 7世代シフト動作',
    result: test002_SevenGenerationShift()
  });
  
  // Test 3: 複数ページテスト
  results.push({
    test: 'TEST-003: 複数ページでの動作',
    result: test003_MultiplePages()
  });
  
  // Test 4: 後方互換性テスト
  results.push({
    test: 'TEST-004: 3世代データの移行',
    result: test004_BackwardCompatibility()
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

// 現在のPageSummaryシートの状態を確認
function checkPageSummaryState() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('PageSummary');
  
  if (!sheet) {
    console.log('PageSummaryシートが存在しません');
    return;
  }
  
  console.log('=== PageSummaryシートの状態 ===');
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

// PageSummaryシートをクリア（ヘッダーは残す）
function clearPageSummaryData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('PageSummary');
  
  if (!sheet) {
    console.log('PageSummaryシートが存在しません');
    return;
  }
  
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    console.log('PageSummaryシートのデータをクリアしました');
  } else {
    console.log('クリアするデータがありません');
  }
}