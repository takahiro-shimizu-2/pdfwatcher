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
      const lastRow = sheet.getLastRow();
      const lastColumn = sheet.getLastColumn();
      
      if (sheetName === 'UserLog' && lastRow > 1) {
        // UserLogはヘッダー行（1行目）を残してクリア
        sheet.getRange(2, 1, lastRow - 1, lastColumn).clear();
      } else if (sheetName === 'Changes' && lastRow > 1) {
        // Changesもヘッダー行を残してクリア
        sheet.getRange(2, 1, lastRow - 1, lastColumn).clear();
      } else if (sheetName === 'Current' && lastRow > 0) {
        // Currentはヘッダーなしなので全クリア
        sheet.clear();
      }
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

// TC-006: 処理状態の保存と復元テスト
function test_TC006_stateManagement() {
  console.log('=== TC-006: 処理状態の保存と復元テスト開始 ===');
  
  // 1. 60ページのテストデータを準備
  generateTestData(60, 50);
  console.log('60ページのテストデータを生成しました');
  SpreadsheetApp.getActiveSpreadsheet().toast('TC-006テスト開始: 60ページのテストデータを生成', 'TC-006', 5);
  
  // 2. 処理前の状態を確認
  const beforeState = PropertiesService.getScriptProperties().getProperty('processState');
  console.log('処理前の状態:', beforeState || 'なし');
  
  // 3. 処理状態の詳細を表示する関数
  const showProcessStateDetails = () => {
    const state = PropertiesService.getScriptProperties().getProperty('processState');
    if (state) {
      const parsed = JSON.parse(state);
      console.log('=== 保存された処理状態 ===');
      console.log('ステータス:', parsed.status);
      console.log('現在のグループ:', parsed.currentGroup);
      console.log('総グループ数:', parsed.totalGroups);
      console.log('処理済みページ:', parsed.processedPages);
      console.log('開始時刻:', new Date(parsed.startTime).toLocaleString());
      console.log('最終更新:', new Date(parsed.lastUpdate).toLocaleString());
      console.log('エラー回数:', parsed.errorCount || 0);
      console.log('================================');
      
      // UIにも表示
      const message = `ステータス: ${parsed.status}
現在のグループ: ${parsed.currentGroup}/${parsed.totalGroups}
処理済みページ: ${parsed.processedPages}ページ
開始時刻: ${new Date(parsed.startTime).toLocaleString()}
最終更新: ${new Date(parsed.lastUpdate).toLocaleString()}`;
      
      SpreadsheetApp.getUi().alert('TC-006: 処理状態確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      console.log('保存された処理状態はありません');
      SpreadsheetApp.getUi().alert('TC-006: 処理状態確認', '保存された処理状態はありません', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  };
  
  return {
    showState: showProcessStateDetails,
    clearState: () => {
      PropertiesService.getScriptProperties().deleteProperty('processState');
      console.log('処理状態をクリアしました');
    }
  };
}

// TC-006: 最初の実行後の状態確認
function checkTC006FirstExecution() {
  console.log('=== TC-006: 最初の実行後の状態確認 ===');
  
  const state = PropertiesService.getScriptProperties().getProperty('processState');
  if (!state) {
    console.log('エラー: 処理状態が保存されていません');
    SpreadsheetApp.getUi().alert('TC-006エラー', '処理状態が保存されていません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const parsed = JSON.parse(state);
  console.log('処理状態:', parsed);
  
  // 期待される状態を確認
  const expectations = {
    status: parsed.status === 'completed' || parsed.status === 'processing',
    totalGroups: parsed.totalGroups === 2, // 60ページ = 2グループ
    processedPages: parsed.processedPages > 0 && parsed.processedPages <= 60,
    hasStartTime: !!parsed.startTime,
    hasLastUpdate: !!parsed.lastUpdate
  };
  
  const allPassed = Object.values(expectations).every(v => v);
  
  const message = `=== TC-006 第1回実行後の検証結果 ===
ステータス: ${parsed.status} (期待: completed/processing) ${expectations.status ? '✓' : '✗'}
総グループ数: ${parsed.totalGroups} (期待: 2) ${expectations.totalGroups ? '✓' : '✗'}
処理済みページ: ${parsed.processedPages} (期待: 1-60) ${expectations.processedPages ? '✓' : '✗'}
開始時刻: ${parsed.startTime ? '設定済み' : '未設定'} ${expectations.hasStartTime ? '✓' : '✗'}
最終更新: ${parsed.lastUpdate ? '設定済み' : '未設定'} ${expectations.hasLastUpdate ? '✓' : '✗'}

総合結果: ${allPassed ? 'すべて合格 ✓' : '一部不合格 ✗'}`;
  
  console.log(message);
  SpreadsheetApp.getUi().alert('TC-006: 第1回実行後の検証', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  return allPassed;
}

// TC-007: 古い処理状態の無視テスト
function test_TC007_oldStateIgnored() {
  console.log('=== TC-007: 古い処理状態の無視テスト開始 ===');
  
  // 1. まず現在の状態をクリア
  clearProcessState();
  console.log('既存の処理状態をクリアしました');
  
  // 2. 25時間前のタイムスタンプを持つ古い状態を作成
  const oldState = {
    sessionId: 'test-old-session-123',
    status: 'processing',
    currentGroupIndex: 1,
    totalGroups: 3,
    processedPages: 30,
    completedMiniBatches: [0, 1, 2, 3, 4, 5], // 最初のグループのミニバッチ完了
    lastUpdateTime: Date.now() - (25 * 60 * 60 * 1000), // 25時間前
    startTime: Date.now() - (25 * 60 * 60 * 1000 + 300000), // 25時間5分前
    version: '1.0.0', // 現在のバージョンと同じ
    errorCount: 0
  };
  
  // 3. PropertiesServiceに古い状態を直接保存
  PropertiesService.getScriptProperties().setProperty('processState', JSON.stringify(oldState));
  console.log('25時間前の処理状態を設定しました:', oldState);
  
  // 4. UI表示
  const message = `TC-007: 古い処理状態を設定しました

セッションID: ${oldState.sessionId}
ステータス: ${oldState.status}
処理済みページ: ${oldState.processedPages}
最終更新: ${new Date(oldState.lastUpdateTime).toLocaleString()} (25時間前)

次にrunJudge()を実行すると、この古い状態は無視され、
新規処理として開始されることを確認してください。`;
  
  SpreadsheetApp.getUi().alert('TC-007: テスト準備完了', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  // 5. テストデータも準備（40ページ）
  generateTestData(40, 50);
  console.log('40ページのテストデータを生成しました');
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'TC-007準備完了: 古い状態を設定し、40ページのテストデータを生成しました。runJudge()を実行してください。', 
    'TC-007', 
    10
  );
  
  return true;
}

// TC-007の結果確認
function checkTC007Result() {
  console.log('=== TC-007: 結果確認 ===');
  
  const state = PropertiesService.getScriptProperties().getProperty('processState');
  if (!state) {
    const message = 'TC-007合格: 処理状態が存在しません（処理完了後）';
    console.log(message);
    SpreadsheetApp.getUi().alert('TC-007: 結果', message, SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  }
  
  const parsed = JSON.parse(state);
  
  // 新しいセッションIDであることを確認（古いセッションIDと異なる）
  const isNewSession = parsed.sessionId !== 'test-old-session-123';
  const isRecentUpdate = (Date.now() - parsed.lastUpdateTime) < (60 * 60 * 1000); // 1時間以内
  
  const message = `=== TC-007 結果確認 ===
セッションID: ${parsed.sessionId}
新規セッション: ${isNewSession ? '✓ 合格（古い状態は無視された）' : '✗ 不合格（古い状態が使用された）'}
最終更新: ${new Date(parsed.lastUpdateTime).toLocaleString()}
最近の更新: ${isRecentUpdate ? '✓ 合格' : '✗ 不合格'}
処理済みページ: ${parsed.processedPages}ページ

総合結果: ${isNewSession && isRecentUpdate ? '✓ TC-007合格: 古い状態が正しく無視されました' : '✗ TC-007不合格'}`;
  
  console.log(message);
  SpreadsheetApp.getUi().alert('TC-007: 結果確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  return isNewSession && isRecentUpdate;
}

// TC-009用: エラーを意図的に発生させる関数
function test_TC009_setupErrorCondition() {
  // エラー発生フラグをPropertiesServiceに設定
  PropertiesService.getScriptProperties().setProperty('TC009_FORCE_ERROR', 'true');
  console.log('TC-009: エラー発生フラグを設定しました');
  SpreadsheetApp.getActiveSpreadsheet().toast('TC-009: エラー発生モードを有効化しました', 'テスト準備', 5);
  
  // 60ページのテストデータを生成（2グループに分割される）
  generateTestData(60, 50);
  console.log('TC-009: 60ページのテストデータを生成しました');
  
  // 現在の状態をクリア
  clearProcessState();
  
  SpreadsheetApp.getUi().alert(
    'TC-009 準備完了',
    'エラー発生モードを有効化し、60ページのテストデータを生成しました。\n\n' +
    '次にrunJudge()を実行すると、処理中にエラーが発生します。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// TC-009用: エラーフラグをクリアする関数
function test_TC009_clearErrorCondition() {
  PropertiesService.getScriptProperties().deleteProperty('TC009_FORCE_ERROR');
  console.log('TC-009: エラー発生フラグをクリアしました');
  SpreadsheetApp.getActiveSpreadsheet().toast('TC-009: エラー発生モードを無効化しました', 'テスト完了', 5);
}

// TC-015: 0ページの処理テスト
function test_TC015_zeroPages() {
  console.log('=== TC-015: 0ページの処理テスト開始 ===');
  
  // シートをクリア
  clearTestData();
  clearProcessState();
  
  // Currentシートにデータを入れない（0ページ）
  console.log('TC-015: 0ページのテストデータ（空のCurrentシート）を準備しました');
  
  SpreadsheetApp.getUi().alert(
    'TC-015: 0ページテスト準備完了',
    'Currentシートが空の状態です。\n\n' +
    '次にrunJudge()を実行して、適切にエラーハンドリングされることを確認してください。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return true;
}

// TC-016: 1ページの処理テスト
function test_TC016_onePage() {
  console.log('=== TC-016: 1ページの処理テスト開始 ===');
  
  // シートをクリア
  clearTestData();
  clearProcessState();
  
  // 1ページのテストデータを生成
  generateTestData(1, 50);
  console.log('TC-016: 1ページのテストデータを生成しました');
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'TC-016準備完了: 1ページのテストデータを生成しました。runJudge()を実行してください。', 
    'TC-016', 
    5
  );
  
  return true;
}

// TC-017: ちょうど30ページの処理テスト
function test_TC017_thirtyPages() {
  console.log('=== TC-017: 30ページの処理テスト開始 ===');
  
  // シートをクリア
  clearTestData();
  clearProcessState();
  
  // 30ページのテストデータを生成
  generateTestData(30, 50);
  console.log('TC-017: 30ページのテストデータを生成しました');
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'TC-017準備完了: 30ページのテストデータを生成しました。runJudge()を実行してください。', 
    'TC-017', 
    5
  );
  
  return true;
}

// TC-018: 同時実行防止テスト準備
function test_TC018_setupConcurrentTest() {
  console.log('=== TC-018: 同時実行防止テスト準備 ===');
  
  // シートをクリア
  clearTestData();
  clearProcessState();
  
  // 60ページのテストデータを生成（処理に時間がかかるように）
  generateTestData(60, 100);
  console.log('TC-018: 60ページのテストデータを生成しました（各ページ100個のPDF）');
  
  SpreadsheetApp.getUi().alert(
    'TC-018: 同時実行防止テスト準備完了',
    '60ページのテストデータ（各100個のPDF）を生成しました。\n\n' +
    'テスト手順:\n' +
    '1. このタブでrunJudge()を実行\n' +
    '2. すぐに別のタブやブラウザで同じスプレッドシートを開く\n' +
    '3. 2つ目のタブでもrunJudge()を実行\n' +
    '4. 「別の処理が実行中」エラーが表示されることを確認',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return true;
}