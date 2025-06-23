// テストユーティリティ関数
// このファイルをGASエディタにコピーして使用してください

function generateTestData(pageCount, pdfCountPerPage = 50) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current');
  sheet.clear();
  
  // ヘッダーなし（Chrome拡張からの生データ形式）
  const data = [];
  for (let i = 1; i <= pageCount; i++) {
    const row = [
      `https://example.com/page${i}`,  // ページURL
      generateRandomHash(),             // ハッシュ値
    ];
    
    // 各ページに大量のPDF URLを追加（デフォルト50個、ランダムで±20%）
    const actualPdfCount = Math.floor(pdfCountPerPage * (0.8 + Math.random() * 0.4));
    for (let j = 1; j <= actualPdfCount; j++) {
      row.push(`https://example.com/page${i}/document-${j.toString().padStart(3, '0')}.pdf`);
    }
    
    data.push(row);
  }
  
  if (data.length > 0) {
    // 最大列数を計算
    const maxColumns = Math.max(...data.map(row => row.length));
    
    // すべての行を同じ列数に揃える（空文字で埋める）
    const normalizedData = data.map(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
      return row;
    });
    
    sheet.getRange(1, 1, normalizedData.length, maxColumns).setValues(normalizedData);
  }
}

function generateRandomHash() {
  // 簡単なランダムハッシュ生成（実際のハッシュ形式を模倣）
  return Math.random().toString(36).substring(2, 10);
}

// テスト実行用の関数
function test_TC001_smallData() {
  generateTestData(20, 50);  // 20ページ、各ページ約50個のPDF
  console.log('20ページのテストデータを生成しました（各ページ約50個のPDF）');
  SpreadsheetApp.getActiveSpreadsheet().toast('20ページのテストデータを生成しました（各ページ約50個のPDF）', 'テスト準備', 3);
}

function test_TC002_mediumData() {
  generateTestData(60, 50);  // 60ページ、各ページ約50個のPDF
  console.log('60ページのテストデータを生成しました（各ページ約50個のPDF）');
  SpreadsheetApp.getActiveSpreadsheet().toast('60ページのテストデータを生成しました（各ページ約50個のPDF）', 'テスト準備', 3);
}

function test_TC003_largeData() {
  generateTestData(120, 50);  // 120ページ、各ページ約50個のPDF
  console.log('120ページのテストデータを生成しました（各ページ約50個のPDF）');
  SpreadsheetApp.getActiveSpreadsheet().toast('120ページのテストデータを生成しました（各ページ約50個のPDF）', 'テスト準備', 3);
}

// 超大量PDFテスト用
function test_heavyData() {
  generateTestData(10, 200);  // 10ページ、各ページ約200個のPDF（計2000個）
  console.log('10ページのテストデータを生成しました（各ページ約200個のPDF）');
  SpreadsheetApp.getActiveSpreadsheet().toast('10ページのテストデータを生成しました（各ページ約200個のPDF）', 'テスト準備', 3);
}

// 大量ページテスト用
function test_500pages() {
  generateTestData(500, 50);  // 500ページ、各ページ約50個のPDF
  console.log('500ページのテストデータを生成しました');
  SpreadsheetApp.getActiveSpreadsheet().toast('500ページのテストデータを生成しました', 'テスト準備', 3);
}

function test_1000pages() {
  generateTestData(1000, 30);  // 1000ページ、各ページ約30個のPDF
  console.log('1000ページのテストデータを生成しました');
  SpreadsheetApp.getActiveSpreadsheet().toast('1000ページのテストデータを生成しました', 'テスト準備', 3);
}

function test_300pages() {
  generateTestData(300, 50);  // 300ページ、各ページ約50個のPDF
  console.log('300ページのテストデータを生成しました');
  SpreadsheetApp.getActiveSpreadsheet().toast('300ページのテストデータを生成しました', 'テスト準備', 3);
}

// カスタムPDF数でのテスト
function test_customData() {
  const pageCount = 30;
  const pdfCount = 100;
  generateTestData(pageCount, pdfCount);
  console.log(`${pageCount}ページのテストデータを生成しました（各ページ約${pdfCount}個のPDF）`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`${pageCount}ページのテストデータを生成しました（各ページ約${pdfCount}個のPDF）`, 'テスト準備', 3);
}

// データクリア関数
function clearTestData() {
  const sheets = ['Current', 'Changes', 'UserLog'];
  sheets.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      sheet.clear();
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('テストデータをクリアしました', 'クリア完了', 3);
}

// 処理状態確認関数
function checkProcessState() {
  const state = PropertiesService.getScriptProperties().getProperty('processState');
  if (state) {
    const parsed = JSON.parse(state);
    const message = `ステータス: ${parsed.status}\n` +
                   `現在のグループ: ${parsed.currentGroupIndex}/${parsed.totalGroups}\n` +
                   `処理済みページ: ${parsed.processedPages}\n` +
                   `開始時刻: ${new Date(parsed.startTime).toLocaleString()}`;
    
    SpreadsheetApp.getUi().alert('処理状態', message, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('処理状態', '保存された状態はありません', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// トリガー確認関数
function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  if (triggers.length === 0) {
    SpreadsheetApp.getUi().alert('トリガー状態', 'トリガーは設定されていません', SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    const message = triggers.map(trigger => {
      return `関数: ${trigger.getHandlerFunction()}\n` +
             `タイプ: ${trigger.getEventType()}\n` +
             `ソース: ${trigger.getTriggerSource()}`;
    }).join('\n---\n');
    
    SpreadsheetApp.getUi().alert('トリガー状態', message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// 処理時間測定用デコレーター
function measureExecutionTime(funcName) {
  const startTime = new Date().getTime();
  console.log(`[${funcName}] 開始時刻: ${new Date().toLocaleString()}`);
  
  return function() {
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    console.log(`[${funcName}] 終了時刻: ${new Date().toLocaleString()}`);
    console.log(`[${funcName}] 処理時間: ${duration}秒`);
    
    // UserLogシートに記録
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 0) {
        const lastRowData = sheet.getRange(lastRow, 1, 1, 7).getValues()[0];
        // 処理時間を更新
        sheet.getRange(lastRow, 2).setValue(duration);
      }
    }
  };
}

// テスト結果記録関数
function recordTestResult(testCase, pageCount, executionCount, totalTime, status, notes = '') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TestResults');
  if (!sheet) {
    // TestResultsシートがなければ作成
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = ss.insertSheet('TestResults');
    newSheet.getRange(1, 1, 1, 7).setValues([
      ['テストケース', '実行日時', 'ページ数', '処理回数', '総処理時間(秒)', '成功/失敗', '備考']
    ]);
  }
  
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TestResults');
  targetSheet.appendRow([
    testCase,
    new Date().toLocaleString(),
    pageCount,
    executionCount,
    totalTime,
    status,
    notes
  ]);
}

// 処理状態のクリア
function clearProcessState() {
  PropertiesService.getScriptProperties().deleteProperty('processState');
  // トリガーも削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'runJudgeContinuation') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('処理状態とトリガーをクリアしました', 'クリア完了', 3);
}

// 実際のPDF処理をモック化するための関数
function mockBatchJudgePages(pages, startIndex = 0) {
  // 本来のbatchJudgePagesの代わりに使用
  // 実際のHTTPリクエストは行わず、ダミーの結果を返す
  const results = pages.map((page, index) => {
    // ランダムに変更を生成（10%の確率）
    const hasChange = Math.random() < 0.1;
    const addedPdfs = hasChange ? [`https://example.com/new-pdf-${startIndex + index}.pdf`] : [];
    
    return {
      pageUrl: page.url,
      pageChanged: hasChange,
      pdfChanged: hasChange,
      addedPdfUrls: addedPdfs,
      deletedPdfUrls: [],
      error: null
    };
  });
  
  // 処理時間のシミュレーション（1ページあたり0.1秒）
  Utilities.sleep(pages.length * 100);
  
  return results;
}