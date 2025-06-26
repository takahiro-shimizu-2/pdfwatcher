// Changes履歴保存機能テスト用ユーティリティ関数
// このファイルをGASエディタにコピーして使用してください

// 既存のtest-utilities.gsから必要な関数をインポート
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

// データクリア関数（ChangesHistoryも含む）
function clearTestData() {
  const sheets = ['Current', 'Changes', 'UserLog', 'ChangesHistory'];
  sheets.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const lastColumn = sheet.getLastColumn();
      
      if ((sheetName === 'UserLog' || sheetName === 'Changes' || sheetName === 'ChangesHistory') && lastRow > 1) {
        // ヘッダー行（1行目）を残してクリア
        sheet.getRange(2, 1, lastRow - 1, lastColumn).clear();
      } else if (sheetName === 'Current' && lastRow > 0) {
        // Currentはヘッダーなしなので全クリア
        sheet.clear();
      }
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('テストデータをクリアしました（ChangesHistory含む）', 'クリア完了', 3);
}

// ========== Changes履歴機能専用のテスト関数 ==========

// CHT-001: 基本的な履歴転写テスト
function test_CHT001_basicTransfer() {
  console.log('=== CHT-001: 基本的な履歴転写テスト ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. 3ページの小規模データを生成
  generateTestData(3, 5);  // 3ページ、各5個のPDF
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-001準備完了: 3ページのテストデータを生成しました。\n初回runJudge()を実行してください。', 
    'CHT-001', 
    5
  );
}

// CHT-002: 大量データ転写テスト
function test_CHT002_largeTransfer() {
  console.log('=== CHT-002: 大量データ転写テスト ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. 50ページの大規模データを生成
  generateTestData(50, 10);  // 50ページ、各10個のPDF
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-002準備完了: 50ページのテストデータを生成しました（約500個のPDF）。\nrunJudge()を実行してください。', 
    'CHT-002', 
    5
  );
}

// CHT-003: 期限切れデータ削除テスト用のデータ作成
function test_CHT003_setupExpiredData() {
  console.log('=== CHT-003: 期限切れデータ削除テスト ===');
  
  const historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  if (!historySheet) {
    SpreadsheetApp.getUi().alert('エラー', 'ChangesHistoryシートが存在しません。初期設定を実行してください。', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // 古いデータを手動で追加
  const now = new Date();
  const testData = [
    // 6日前のデータ（削除対象）
    [
      new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),  // 保存日時
      'test_old_001',                                       // 実行ID
      'https://example.com/oldpage1',                       // ページURL
      'https://example.com/old1.pdf',                       // PDFのURL
      new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)   // 削除予定日時（1日前）
    ],
    // 5日と1時間前のデータ（削除対象）
    [
      new Date(now.getTime() - (5 * 24 + 1) * 60 * 60 * 1000),
      'test_old_002',
      'https://example.com/oldpage2',
      'https://example.com/old2.pdf',
      new Date(now.getTime() - 1 * 60 * 60 * 1000)  // 1時間前
    ],
    // 4日前のデータ（削除対象外）
    [
      new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      'test_recent_001',
      'https://example.com/recentpage1',
      'https://example.com/recent1.pdf',
      new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)  // 1日後
    ],
    // 3日前のデータ（削除対象外）
    [
      new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      'test_recent_002',
      'https://example.com/recentpage2',
      'https://example.com/recent2.pdf',
      new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)  // 2日後
    ]
  ];
  
  const lastRow = historySheet.getLastRow();
  historySheet.getRange(lastRow + 1, 1, testData.length, 5).setValues(testData);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-003準備完了: 期限切れテストデータを追加しました。\n削除対象: 2件、保持対象: 2件\nrunJudge()を実行してください。', 
    'CHT-003', 
    10
  );
}

// CHT-004: ChangesHistoryの内容確認
function checkChangesHistory() {
  const historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  if (!historySheet || historySheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('ChangesHistory確認', 'ChangesHistoryシートにデータがありません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const lastRow = historySheet.getLastRow();
  const data = historySheet.getRange(2, 1, Math.min(lastRow - 1, 10), 5).getValues();
  
  let message = '=== ChangesHistory最新10件 ===\n\n';
  data.forEach((row, index) => {
    const savedAt = row[0] instanceof Date ? row[0].toLocaleString() : row[0];
    const expiresAt = row[4] instanceof Date ? row[4].toLocaleString() : row[4];
    message += `[${index + 1}] ${row[1]}\n`;
    message += `  保存: ${savedAt}\n`;
    message += `  削除予定: ${expiresAt}\n`;
    message += `  PDF: ${row[2]}\n\n`;
  });
  
  message += `総件数: ${lastRow - 1}件`;
  
  SpreadsheetApp.getUi().alert('ChangesHistory内容', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// CHT-005: 実行ログの詳細確認
function checkExecutionLogs() {
  const logs = [];
  
  // コンソールログをシミュレート（実際のログは取得できないため）
  const userLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
  if (userLogSheet && userLogSheet.getLastRow() > 1) {
    const lastRow = userLogSheet.getLastRow();
    const lastExecution = userLogSheet.getRange(lastRow, 1, 1, 7).getValues()[0];
    
    logs.push(`最終実行: ${lastExecution[0]}`);
    logs.push(`処理時間: ${lastExecution[1]}秒`);
    logs.push(`処理ページ数: ${lastExecution[2]}`);
    logs.push(`更新ページ数: ${lastExecution[3]}`);
    logs.push(`追加PDF数: ${lastExecution[4]}`);
    logs.push(`結果: ${lastExecution[5]}`);
    if (lastExecution[6]) {
      logs.push(`エラー: ${lastExecution[6]}`);
    }
  }
  
  // ChangesHistoryの転写結果を推定
  const historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  if (historySheet) {
    const historyCount = historySheet.getLastRow() - 1;
    logs.push(`\nChangesHistory件数: ${historyCount}`);
  }
  
  const message = '=== 実行ログサマリ ===\n\n' + logs.join('\n');
  
  SpreadsheetApp.getUi().alert('実行ログ確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// CHT-006: 日本語URLテスト
function test_CHT006_japaneseURL() {
  console.log('=== CHT-006: 日本語URLテスト ===');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current');
  sheet.clear();
  
  // 日本語を含むURLのテストデータ
  const testData = [
    [
      'https://example.com/日本語ページ',
      generateRandomHash(),
      'https://example.com/documents/契約書.pdf',
      'https://example.com/documents/報告書_2025年.pdf',
      'https://example.com/docs/テスト文書.pdf'
    ],
    [
      'https://example.com/page/製品情報',
      generateRandomHash(),
      'https://example.com/pdf/カタログ.pdf',
      'https://example.com/pdf/取扱説明書.pdf',
      ''  // 空文字を追加して列数を合わせる
    ]
  ];
  
  sheet.getRange(1, 1, testData.length, testData[0].length).setValues(testData);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-006準備完了: 日本語URLを含むテストデータを生成しました。\nrunJudge()を実行してください。', 
    'CHT-006', 
    5
  );
}

// CHT-007: パフォーマンス測定
function test_CHT007_performanceMeasure() {
  console.log('=== CHT-007: パフォーマンス測定テスト ===');
  
  // 実行前にUserLogの最新行を記録
  const userLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
  const beforeLastRow = userLogSheet ? userLogSheet.getLastRow() : 0;
  
  // テストデータ生成
  generateTestData(30, 20);  // 30ページ、各20個のPDF（計600個）
  
  PropertiesService.getScriptProperties().setProperty('CHT007_START_ROW', beforeLastRow.toString());
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-007準備完了: 30ページのテストデータを生成しました（計600個のPDF）。\nrunJudge()を実行してパフォーマンスを測定します。', 
    'CHT-007', 
    5
  );
}

// CHT-007の結果確認
function checkCHT007Result() {
  const startRow = parseInt(PropertiesService.getScriptProperties().getProperty('CHT007_START_ROW') || '0');
  const userLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
  
  if (!userLogSheet || userLogSheet.getLastRow() <= startRow) {
    SpreadsheetApp.getUi().alert('CHT-007結果', '新しい実行記録が見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // 履歴機能ありの実行時間を取得
  const withHistoryRow = userLogSheet.getLastRow();
  const withHistoryData = userLogSheet.getRange(withHistoryRow, 1, 1, 7).getValues()[0];
  const withHistoryTime = parseFloat(withHistoryData[1]);
  
  // 履歴機能なしの参考時間（仮定）
  const estimatedBaseTime = withHistoryData[2] * 0.1;  // 1ページあたり0.1秒と仮定
  const overhead = withHistoryTime - estimatedBaseTime;
  
  const message = `=== CHT-007 パフォーマンス測定結果 ===

処理ページ数: ${withHistoryData[2]}ページ
追加PDF数: ${withHistoryData[4]}個

実行時間（履歴機能あり）: ${withHistoryTime.toFixed(2)}秒
推定基本処理時間: ${estimatedBaseTime.toFixed(2)}秒
履歴機能のオーバーヘッド: ${overhead.toFixed(2)}秒

目標: 1秒以内のオーバーヘッド
結果: ${overhead <= 1 ? '✓ 合格' : '✗ 不合格'}`;
  
  SpreadsheetApp.getUi().alert('CHT-007: パフォーマンス測定結果', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  PropertiesService.getScriptProperties().deleteProperty('CHT007_START_ROW');
}

// CHT-005: 6分制限との統合テスト（簡易版）
function test_CHT005_sixMinuteLimit() {
  console.log('=== CHT-005: 6分制限との統合テスト（簡易版） ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. 中規模データを生成（処理は可能だが時間がかかる量）
  generateTestData(20, 30);  // 20ページ、各30個のPDF（計600個）
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-005準備完了: テストデータを生成しました。\n\n' +
    'テスト手順:\n' +
    '1. runJudge()を実行\n' +
    '2. 処理が進行中であることを確認（1-2グループ処理後）\n' +
    '3. 手動で実行を中止（スクリプトエディタの停止ボタン）\n' +
    '4. checkCHT005Status()で中断状態を確認\n' +
    '5. runJudgeContinuation()で継続実行\n' +
    '6. 処理完了後、checkCHT005Result()で結果確認', 
    'CHT-005', 
    20
  );
}

// CHT-005B: 疑似的な6分制限テスト（自動化版）
function test_CHT005B_simulatedTimeout() {
  console.log('=== CHT-005B: 疑似的な6分制限テスト ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. テストデータ生成
  generateTestData(10, 20);  // 10ページ、各20個のPDF（計200個）
  
  // 3. 処理状態を手動で設定（1グループ処理済みの状態をシミュレート）
  const state = {
    execId: Utilities.getUuid(),
    status: 'paused',
    currentGroupIndex: 0,  // 1グループ処理済み
    totalGroups: 3,
    processedPages: 4,
    startTime: new Date().toISOString(),
    triggerId: null
  };
  
  PropertiesService.getScriptProperties().setProperty('PDF_WATCHER_PROCESSING_STATE', JSON.stringify(state));
  
  // 4. Changesシートに仮のデータを追加（1グループ分の処理結果をシミュレート）
  const changesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Changes');
  if (changesSheet && changesSheet.getLastRow() === 1) {
    const simulatedData = [];
    for (let i = 1; i <= 40; i++) {
      simulatedData.push([
        `https://example.com/page${Math.ceil(i/10)}`,
        `https://example.com/page${Math.ceil(i/10)}/document-${String(i).padStart(3, '0')}.pdf`,
        new Date()
      ]);
    }
    changesSheet.getRange(2, 1, simulatedData.length, 3).setValues(simulatedData);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-005B準備完了: 中断状態をシミュレートしました。\n\n' +
    '1. checkCHT005Status()で中断状態を確認\n' +
    '2. runJudgeContinuation()で継続実行\n' +
    '3. 処理完了後、checkCHT005Result()で結果確認', 
    'CHT-005B', 
    10
  );
}

// CHT-005の中断状態確認
function checkCHT005Status() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const stateJson = scriptProperties.getProperty('PDF_WATCHER_PROCESSING_STATE');
  
  if (!stateJson) {
    SpreadsheetApp.getUi().alert('CHT-005状態', '処理状態が見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const state = JSON.parse(stateJson);
  const changesHistory = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  const historyCount = changesHistory ? changesHistory.getLastRow() - 1 : 0;
  
  const message = `=== CHT-005 中断状態確認 ===

現在の状態: ${state.status}
現在のグループ: ${state.currentGroupIndex + 1}/${state.totalGroups}
処理済みページ数: ${state.processedPages || 0}

ChangesHistory件数: ${historyCount}件
${historyCount === 0 ? '✓ 中断時は転写されていない（正常）' : '✗ 中断時に転写されている（異常）'}

${state.status === 'paused' ? '継続実行（runJudgeContinuation）を実行してください' : ''}`;
  
  SpreadsheetApp.getUi().alert('CHT-005: 中断状態', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// CHT-005の結果確認
function checkCHT005Result() {
  const changesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Changes');
  const historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  const userLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
  
  if (!changesSheet || !historySheet) {
    SpreadsheetApp.getUi().alert('エラー', '必要なシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const changesCount = changesSheet.getLastRow() - 1;
  const historyCount = historySheet.getLastRow() - 1;
  
  // 最新の実行ログを取得
  let executionLogs = [];
  if (userLogSheet && userLogSheet.getLastRow() > 1) {
    const lastRows = Math.min(5, userLogSheet.getLastRow() - 1);
    const logs = userLogSheet.getRange(userLogSheet.getLastRow() - lastRows + 1, 1, lastRows, 7).getValues();
    executionLogs = logs.map((log, index) => `実行${lastRows - index}: ${log[5]} (${log[1]}秒)`);
  }
  
  const message = `=== CHT-005 6分制限テスト結果 ===

Changesシート件数: ${changesCount}件
ChangesHistory件数: ${historyCount}件

実行履歴（最新5件）:
${executionLogs.join('\n')}

検証結果:
${historyCount > 0 ? '✓ 最終完了時に転写された' : '✗ 転写されていない'}
${changesCount === historyCount ? '✓ すべてのデータが転写された' : '✗ データ数が一致しない'}`;
  
  SpreadsheetApp.getUi().alert('CHT-005: 6分制限テスト結果', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// CHT-005C: 実際の処理フローで中断をテスト
function test_CHT005C_realInterruption() {
  console.log('=== CHT-005C: 実際の処理フローでの中断テスト ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. 少量のテストデータ生成
  generateTestData(8, 15);  // 8ページ、各15個のPDF（計120個）
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-005C準備完了: テストデータを生成しました。\n\n' +
    'テスト実施方法:\n' +
    '【ステップ1: 処理開始と中断】\n' +
    '1. runJudge()を実行\n' +
    '2. UserLogシートで処理開始を確認\n' +
    '3. 約30秒後に手動で実行を停止\n\n' +
    '【ステップ2: 中断状態の確認】\n' +
    '4. checkCHT005Status()を実行\n' +
    '5. ChangesHistoryが0件であることを確認\n\n' +
    '【ステップ3: 継続実行と完了】\n' +
    '6. runJudgeContinuation()を実行\n' +
    '7. 処理完了を待つ\n' +
    '8. checkCHT005Result()で結果確認', 
    'CHT-005C', 
    30
  );
}

// ========== テストシナリオ実行ヘルパー ==========

// 完全なテストシナリオを順番に実行
function runCompleteChangesHistoryTest() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Changes履歴機能の完全テスト',
    '以下のテストを順番に実行します：\n\n' +
    '1. 基本的な転写機能\n' +
    '2. 大量データ転写\n' +
    '3. 期限切れデータ削除\n' +
    '4. 日本語URL対応\n' +
    '5. パフォーマンス測定\n\n' +
    '各テスト後にrunJudge()の実行が必要です。\n続行しますか？',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  ui.alert(
    'テスト手順',
    'テストは以下の手順で実行してください：\n\n' +
    '1. 各test_CHT関数を実行\n' +
    '2. runJudge()を実行\n' +
    '3. 結果を確認\n' +
    '4. 次のテストへ\n\n' +
    'まずはtest_CHT001_basicTransfer()から始めてください。',
    ui.ButtonSet.OK
  );
}

// CHT-005のクイックテスト（検証用）
function quickTestCHT005() {
  // 現在の状態を確認
  const state = PropertiesService.getScriptProperties().getProperty('PDF_WATCHER_PROCESSING_STATE');
  const changesHistory = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  const historyCount = changesHistory ? changesHistory.getLastRow() - 1 : 0;
  
  console.log('=== CHT-005 クイックチェック ===');
  console.log('処理状態:', state ? JSON.parse(state).status : 'なし');
  console.log('ChangesHistory件数:', historyCount);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `処理状態: ${state ? JSON.parse(state).status : 'なし'}\n` +
    `ChangesHistory件数: ${historyCount}件`,
    'CHT-005 状態',
    5
  );
}

// CHT-005: 実際の5分制限テスト（大量データ版）
function test_CHT005_realTimeout() {
  console.log('=== CHT-005: 実際の5分制限テスト ===');
  
  // 1. データクリア
  clearTestData();
  
  // 2. 5分以上かかる大量データを生成
  // 1グループ30ページなので、5分で処理できない量を設定
  generateTestData(200, 50);  // 200ページ、各50個のPDF（計10000個）
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-005準備完了: 大量のテストデータ（10000個のPDF）を生成しました。\n\n' +
    'テスト手順:\n' +
    '1. runJudge()を実行\n' +
    '2. 5分経過で自動的に処理が中断される\n' +
    '3. UserLogで「paused」状態を確認\n' +
    '4. quickTestCHT005()でChangesHistoryが0件であることを確認\n' +
    '5. 処理が自動継続されるのを待つ（または手動でrunJudgeContinuation()）\n' +
    '6. 最終的に処理完了後、checkCHT005Result()で結果確認', 
    'CHT-005', 
    20
  );
}

// CHT-005E: 5分制限の動作確認テスト（効率版）
function test_CHT005E_efficientTest() {
  console.log('=== CHT-005E: 5分制限の動作確認テスト（効率版） ===');
  
  // ステップ1: テスト準備
  clearTestData();
  generateTestData(30, 20);  // 30ページ、各20個のPDF（計600個）
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'CHT-005E テスト開始\n\n' +
    '【ステップ1】\n' +
    'test_CHT005E_step1()を実行してください', 
    'CHT-005E', 
    10
  );
}

// CHT-005E ステップ1: 中断状態を作成
function test_CHT005E_step1() {
  console.log('=== CHT-005E ステップ1: 中断状態の作成 ===');
  
  // 処理状態を作成（1グループ処理済み、2グループ目で中断）
  const totalGroups = 3;
  const currentGroupIndex = 1; // 2グループ目で中断（0ベースなので1）
  
  const state = {
    execId: Utilities.getUuid(),
    status: 'paused',
    currentGroupIndex: currentGroupIndex,
    totalGroups: totalGroups,
    processedPages: 30, // 1グループ分（30ページ）処理済み
    startTime: new Date().toISOString(),
    triggerId: null
  };
  
  PropertiesService.getScriptProperties().setProperty('PDF_WATCHER_PROCESSING_STATE', JSON.stringify(state));
  
  // Changesシートに1グループ分のテストデータを追加
  const changesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Changes');
  if (changesSheet) {
    // ヘッダー行以降をクリア
    if (changesSheet.getLastRow() > 1) {
      changesSheet.getRange(2, 1, changesSheet.getLastRow() - 1, changesSheet.getLastColumn()).clear();
    }
    
    // 1グループ分の処理結果をシミュレート（150個のPDF）
    const testData = [];
    for (let i = 1; i <= 150; i++) {
      testData.push([
        `https://example.com/page${Math.ceil(i/5)}`,
        `https://example.com/page${Math.ceil(i/5)}/document-${String(i).padStart(3, '0')}.pdf`,
        new Date()
      ]);
    }
    changesSheet.getRange(2, 1, testData.length, 3).setValues(testData);
  }
  
  // UserLogに中断記録を追加
  const userLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UserLog');
  if (userLogSheet) {
    const logData = [
      new Date(),     // 実行日時
      300.5,          // 実行時間（5分で中断）
      30,             // 処理ページ数
      30,             // 更新ページ数
      150,            // 追加PDF数
      'paused',       // 結果
      '5分制限により中断' // エラー
    ];
    userLogSheet.getRange(userLogSheet.getLastRow() + 1, 1, 1, 7).setValues([logData]);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '中断状態を作成しました\n\n' +
    '状態:\n' +
    `- 総グループ数: ${totalGroups}\n` +
    `- 処理済み: ${currentGroupIndex}グループ\n` +
    `- Changesシート: 150件\n` +
    `- ChangesHistory: 0件（未転写）\n\n` +
    '【次のステップ】\n' +
    'checkCHT005Status()を実行して状態を確認してください', 
    'CHT-005E', 
    15
  );
}

// CHT-005E ステップ2: 継続実行して完了確認
function test_CHT005E_step2() {
  console.log('=== CHT-005E ステップ2: 継続実行 ===');
  
  const changesHistory = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ChangesHistory');
  const beforeCount = changesHistory ? changesHistory.getLastRow() - 1 : 0;
  
  console.log(`継続実行前のChangesHistory件数: ${beforeCount}`);
  
  if (beforeCount > 0) {
    SpreadsheetApp.getUi().alert(
      'エラー',
      'ChangesHistoryに既にデータがあります。\n中断時には転写されないはずです。',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '継続実行を開始します...\n' +
    'runJudgeContinuation()を実行してください\n\n' +
    '処理完了後、checkCHT005Result()で結果を確認してください', 
    'CHT-005E', 
    10
  );
}