/**
 * PageSummary 7世代拡張テスト - 本番フロー版
 * 
 * 本番の「PDF Watcher」→「判定を実行」フローを使用してテストを実施
 * Currentシートへのテストデータ投入→本番判定実施→世代進行確認
 */

// ===== テストデータ生成関数 =====

/**
 * 前回の実行データを保存（3回目以降のテスト用）
 */
let previousExecutionData = null;

/**
 * 前回データを確認する関数
 */
function checkPreviousData() {
  if (!previousExecutionData) {
    console.log('前回データが保存されていません');
    return;
  }
  
  console.log('前回データが保存されています:');
  console.log('ページ数:', previousExecutionData.length);
  console.log('ページ1のPDF数:', previousExecutionData[0].slice(2).filter(url => url && url !== '').length);
  console.log('サンプルPDF:', previousExecutionData[0][2]);
}

/**
 * Currentシートにテストデータを投入
 * @param {number} pageCount - 生成するページ数
 * @param {number} pdfPerPage - 各ページのPDF数
 * @param {boolean} useFixedUrls - 固定URLモードを使用するか（世代シフトテスト用）
 * @param {string} testId - 固定URLモードで使用するテストID
 * @param {number} executionNumber - 実行回数（3回目以降で特殊処理）
 */
function generateTestDataForCurrent(pageCount = 15, pdfPerPage = 5, useFixedUrls = false, testId = 'test', executionNumber = 1) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('エラー', 'Currentシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // 前回のデータを保存（3回目以降の比較用）
  if (executionNumber >= 2 && sheet.getLastRow() > 0) {
    const lastCol = sheet.getLastColumn();
    previousExecutionData = sheet.getRange(1, 1, sheet.getLastRow(), lastCol).getValues();
  }
  
  sheet.clear();
  
  // タイムスタンプを使用して毎回異なるURLを生成（固定URLモードでない場合）
  const timestamp = new Date().getTime();
  const data = [];
  
  // 異なる組織やカテゴリーのURLを生成
  const organizations = ['company-a', 'company-b', 'org-x', 'dept-y', 'team-z'];
  const categories = ['reports', 'documents', 'manuals', 'presentations', 'data'];
  const fileTypes = ['report', 'guide', 'manual', 'presentation', 'analysis', 'summary', 'overview'];
  
  for (let i = 1; i <= pageCount; i++) {
    const org = organizations[i % organizations.length];
    const category = categories[Math.floor(i / 5) % categories.length];
    
    // URLを生成（固定URLモードの場合は同じURL構造を使用）
    const pageUrl = useFixedUrls 
      ? `https://${org}.example.com/${category}/page-${testId}-${i}`  // 固定URL（testIdで識別）
      : `https://${org}.example.com/${category}/page-${timestamp}-${i}`;  // ページURL（毎回異なる）
    
    const row = [
      pageUrl,
      generateRandomHash(),  // ハッシュ値（常に新しく生成）
    ];
    
    // 3回目以降の実行では、ページごとに異なるパターンを適用
    if (executionNumber >= 3 && previousExecutionData && i <= previousExecutionData.length) {
      const previousRow = previousExecutionData[i - 1];
      const previousPdfs = previousRow.slice(2).filter(url => url && url !== '');
      
      // ページごとのパターンを決定
      let pattern;
      if (i <= 5) {
        pattern = 'all-same';  // ページ1-5: 全て同一
      } else if (i <= 10) {
        pattern = 'partial-change';  // ページ6-10: 一部変更
      } else if (i <= 13) {
        pattern = 'all-new';  // ページ11-13: 全て新規
      } else if (i <= 16) {
        pattern = 'add-delete';  // ページ14-16: 追加と削除
      } else {
        pattern = 'mixed';  // ページ17-20: 混合パターン
      }
      
      generatePdfsWithPattern(row, previousPdfs, pattern, org, category, i, executionNumber);
    } else {
      // 通常のPDF生成（1,2回目または前回データがない場合）
      const actualPdfCount = Math.floor(pdfPerPage * (0.8 + Math.random() * 0.4)); // ±20%の変動
      for (let j = 1; j <= actualPdfCount; j++) {
        const fileType = fileTypes[j % fileTypes.length];
        const year = 2020 + (j % 5);
        const month = String((j % 12) + 1).padStart(2, '0');
        
        // より現実的なPDF URLを生成
        // 1,2回目は毎回異なるタイムスタンプを使用
        const pdfTimestamp = timestamp;
        row.push(`https://${org}.example.com/${category}/files/${year}/${month}/${fileType}_${i}_${j}_v${pdfTimestamp}.pdf`);
      }
    }
    
    data.push(row);
  }
  
  if (data.length > 0) {
    const maxColumns = Math.max(...data.map(row => row.length));
    const normalizedData = data.map(row => {
      while (row.length < maxColumns) {
        row.push('');
      }
      return row;
    });
    
    sheet.getRange(1, 1, normalizedData.length, maxColumns).setValues(normalizedData);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${pageCount}ページ分のテストデータを生成しました`, 
    'データ生成完了', 
    3
  );
}

/**
 * ランダムハッシュ生成
 */
function generateRandomHash() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * パターンに基づいてPDFを生成
 */
function generatePdfsWithPattern(row, previousPdfs, pattern, org, category, pageNum, executionNumber) {
  const timestamp = new Date().getTime();
  const fileTypes = ['report', 'guide', 'manual', 'presentation', 'analysis', 'summary', 'overview'];
  
  switch (pattern) {
    case 'all-same':
      // 全て同一: 前回のPDFをそのまま使用
      previousPdfs.forEach(pdf => row.push(pdf));
      break;
      
    case 'partial-change':
      // 一部変更: 60%は同一、20%は更新、20%は新規
      previousPdfs.forEach((pdf, index) => {
        const rand = Math.random();
        if (rand < 0.6) {
          // 60%: 同一
          row.push(pdf);
        } else if (rand < 0.8) {
          // 20%: 更新（バージョン番号のみ変更）
          row.push(pdf.replace(/v\d+\.pdf$/, `v${timestamp}.pdf`));
        } else {
          // 20%: 完全に新規
          const fileType = fileTypes[index % fileTypes.length];
          const year = 2020 + (index % 5);
          const month = String((index % 12) + 1).padStart(2, '0');
          row.push(`https://${org}.example.com/${category}/files/${year}/${month}/${fileType}_${pageNum}_${index + 1}_new_v${timestamp}.pdf`);
        }
      });
      // 10%の確率で新規追加
      if (Math.random() < 0.1) {
        const newIndex = previousPdfs.length + 1;
        const fileType = fileTypes[newIndex % fileTypes.length];
        row.push(`https://${org}.example.com/${category}/files/2025/01/${fileType}_${pageNum}_${newIndex}_added_v${timestamp}.pdf`);
      }
      break;
      
    case 'all-new':
      // 全て新規: 前回と同じ数だけ全く新しいPDFを生成
      for (let j = 1; j <= previousPdfs.length; j++) {
        const fileType = fileTypes[j % fileTypes.length];
        const year = 2024 + (j % 2);
        const month = String((j % 12) + 1).padStart(2, '0');
        row.push(`https://${org}.example.com/${category}/files/${year}/${month}/${fileType}_${pageNum}_${j}_exec${executionNumber}_v${timestamp}.pdf`);
      }
      break;
      
    case 'add-delete':
      // 追加と削除: 前回の70%を保持、30%削除、新規追加
      const keepCount = Math.floor(previousPdfs.length * 0.7);
      // ランダムに選択して保持
      const shuffled = [...previousPdfs].sort(() => Math.random() - 0.5);
      shuffled.slice(0, keepCount).forEach(pdf => row.push(pdf));
      // 新規追加（削除分を補填＋α）
      const addCount = Math.floor(previousPdfs.length * 0.4);
      for (let j = 1; j <= addCount; j++) {
        const fileType = fileTypes[j % fileTypes.length];
        row.push(`https://${org}.example.com/${category}/files/2025/02/${fileType}_${pageNum}_new${j}_v${timestamp}.pdf`);
      }
      break;
      
    case 'mixed':
      // 混合パターン: 各PDFごとにランダムに決定
      const newPdfCount = Math.floor(previousPdfs.length * (0.8 + Math.random() * 0.4));
      let addedCount = 0;
      
      previousPdfs.forEach((pdf, index) => {
        const rand = Math.random();
        if (rand < 0.5 && addedCount < newPdfCount) {
          // 50%: 保持
          row.push(pdf);
          addedCount++;
        } else if (rand < 0.8 && addedCount < newPdfCount) {
          // 30%: 更新
          row.push(pdf.replace(/v\d+\.pdf$/, `v${timestamp}.pdf`));
          addedCount++;
        }
        // 20%: 削除（何も追加しない）
      });
      
      // 不足分を新規追加
      while (addedCount < newPdfCount) {
        const fileType = fileTypes[addedCount % fileTypes.length];
        row.push(`https://${org}.example.com/${category}/files/2025/03/${fileType}_${pageNum}_mixed${addedCount}_v${timestamp}.pdf`);
        addedCount++;
      }
      break;
  }
}

// ===== 世代確認関数 =====

/**
 * PageSummaryシートの現在の世代状態を確認
 */
function checkPageSummaryGenerations() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // マスターブックのSummaryシートを確認（IMPORTRANGEで参照）
  const summarySheet = spreadsheet.getSheetByName('Summary');
  if (!summarySheet) {
    console.log('Summaryシートが見つかりません');
    return;
  }
  
  const lastRow = summarySheet.getLastRow();
  if (lastRow <= 1) {
    console.log('PageSummaryにデータがありません');
    SpreadsheetApp.getUi().alert('確認', 'PageSummaryにデータがありません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // ヘッダーを確認
  const headers = summarySheet.getRange(1, 1, 1, summarySheet.getLastColumn()).getValues()[0];
  console.log('列数:', headers.length);
  console.log('期待値: 30列（7世代形式）');
  
  // 最初の数行のデータを確認
  const sampleSize = Math.min(5, lastRow - 1);
  const sampleData = summarySheet.getRange(2, 1, sampleSize, Math.min(30, summarySheet.getLastColumn())).getValues();
  
  let message = '=== PageSummary 世代状態 ===\n\n';
  message += `総データ行数: ${lastRow - 1}行\n`;
  message += `列数: ${headers.length}列 (期待値: 30列)\n\n`;
  
  // サンプルデータの世代情報を表示
  message += '【サンプルデータ（最大5行）】\n';
  sampleData.forEach((row, index) => {
    const pageUrl = row[0];
    message += `\n${index + 1}. ${pageUrl}\n`;
    
    // 各世代のデータを確認（AddedCount列のみ表示）
    for (let gen = 1; gen <= 7; gen++) {
      const addedCountIndex = 2 + (gen - 1) * 4 + 3; // AddedCount列のインデックス
      const addedCount = row[addedCountIndex];
      if (addedCount !== undefined && addedCount !== '') {
        message += `  実行${gen}: ${addedCount}件\n`;
      }
    }
  });
  
  SpreadsheetApp.getUi().alert('PageSummary世代確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  // コンソールにも詳細を出力
  console.log(message);
}

// ===== テスト実行関数 =====

/**
 * TEST-7GEN-001: 初回実行（実行1にデータ）
 */
function test7Gen001_FirstRun() {
  console.log('=== TEST-7GEN-001: 初回実行テスト ===');
  
  // 1. 固定URLモードでテストデータを投入（20ページ、各10-15個のPDF）
  // TEST-002で同じURLを使用するため、固定URLモードを使用
  generateTestDataForCurrent(20, 12, true, 'test001');
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'テストデータを投入しました（固定URLモード）。\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」をクリック\n' +
    '2. 処理完了を待つ\n' +
    '3. checkPageSummaryGenerations()で実行1にデータが入ったことを確認', 
    'TEST-001', 
    10
  );
}

/**
 * TEST-7GEN-002: 2回目実行（実行1→実行2へシフト）
 */
function test7Gen002_SecondRun() {
  console.log('=== TEST-7GEN-002: 2回目実行（シフト確認） ===');
  
  // 1. 固定URLモードでテストデータを投入（TEST-001と同じURL、異なるハッシュ値とPDF）
  generateTestDataForCurrent(20, 12, true, 'test001', 2);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '固定URLモードでテストデータを投入しました。\n' +
    '（TEST-001と同じURL、異なるハッシュ値とPDF）\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」をクリック\n' +
    '2. 処理完了を待つ\n' +
    '3. checkPageSummaryGenerations()で確認:\n' +
    '   - 実行1に更新されたデータ\n' +
    '   - 実行2に前回（TEST-001）のデータがシフト', 
    'TEST-002', 
    10
  );
}

/**
 * TEST-7GEN-003: 3回目実行（混在パターンテスト）
 */
function test7Gen003_MixedPatternRun() {
  console.log('=== TEST-7GEN-003: 3回目実行（混在パターン） ===');
  
  // 重要: previousExecutionDataが正しく設定されているか確認
  if (!previousExecutionData) {
    SpreadsheetApp.getUi().alert('警告', '前回のデータが保存されていません。\n2回目の実行後に3回目を実行してください。', SpreadsheetApp.getUi().ButtonSet.OK);
  }
  
  // 3回目実行: パターン別のPDF生成
  generateTestDataForCurrent(20, 12, true, 'test001', 3);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '3回目のテストデータを投入しました。\n\n' +
    'ページごとのパターン:\n' +
    '- ページ1-5: 全て同一（変更なし）\n' +
    '- ページ6-10: 一部変更（60%同一、20%更新、20%新規）\n' +
    '- ページ11-13: 全て新規\n' +
    '- ページ14-16: 追加と削除（70%保持、30%削除、新規追加）\n' +
    '- ページ17-20: 混合パターン\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」\n' +
    '2. ChangesHistoryで各パターンの動作を確認\n' +
    '3. checkPageSummaryGenerations()で世代管理を確認', 
    'TEST-003', 
    15
  );
}

/**
 * TEST-7GEN-004-007: 4〜7回目実行
 */
function test7Gen004to007_ContinueRuns() {
  console.log('=== TEST-7GEN-004-007: 4〜7回目実行 ===');
  
  SpreadsheetApp.getUi().alert(
    'TEST-004-007: 継続実行テスト',
    '4回目から7回目まで、以下を繰り返してください：\n\n' +
    '各実行で:\n' +
    '1. generateTestDataForCurrent(20, 12, true, "test001", 実行回数)\n' +
    '   例: 4回目なら generateTestDataForCurrent(20, 12, true, "test001", 4)\n' +
    '2. メニュー「PDF Watcher」→「判定を実行」\n' +
    '3. 完了を待つ\n\n' +
    '7回目の後、checkPageSummaryGenerations()で\n' +
    '実行1〜実行7すべてにデータがあることを確認します。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * TEST-7GEN-008: 8回目実行（最古データ削除確認）
 */
function test7Gen008_OldestDataDeletion() {
  console.log('=== TEST-7GEN-008: 8回目実行（最古データ削除） ===');
  
  // 実行前の状態を記録
  const summarySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Summary');
  let oldestData = null;
  
  if (summarySheet && summarySheet.getLastRow() > 1) {
    // 実行7のデータを記録（これが削除されるはず）
    const row = summarySheet.getRange(2, 1, 1, 30).getValues()[0];
    const run7AddedCountIndex = 2 + 6 * 4 + 3; // 実行7のAddedCount列
    oldestData = row[run7AddedCountIndex];
  }
  
  // 新しいテストデータを投入
  generateTestDataForCurrent(20, 12, true, 'test001', 8);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '8回目のテストデータを投入しました。\n\n' +
    `現在の実行7のデータ: ${oldestData || '不明'}\n\n` +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」を実行\n' +
    '2. 処理完了を待つ\n' +
    '3. checkPageSummaryGenerations()で確認:\n' +
    '   - 実行1に新データ\n' +
    '   - 実行7に2回目のデータ\n' +
    '   - 1回目のデータは削除されている', 
    'TEST-008', 
    15
  );
}

/**
 * 変更パターンの詳細確認
 */
function checkChangePatterns() {
  const changesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Changes');
  if (!changesSheet || changesSheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('確認', 'Changesシートにデータがありません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const lastRow = changesSheet.getLastRow();
  const data = changesSheet.getRange(2, 1, lastRow - 1, changesSheet.getLastColumn()).getValues();
  
  // ページごとの統計を集計
  const pageStats = {};
  data.forEach(row => {
    const pageUrl = row[0];
    const pdfUrl = row[1];
    const changeType = row[2]; // '新規追加', '更新', '削除' など
    
    if (!pageStats[pageUrl]) {
      pageStats[pageUrl] = { added: 0, updated: 0, deleted: 0, unchanged: 0 };
    }
    
    // 変更タイプに応じてカウント
    if (changeType === '新規追加') {
      pageStats[pageUrl].added++;
    } else if (changeType === '更新') {
      pageStats[pageUrl].updated++;
    } else if (changeType === '削除') {
      pageStats[pageUrl].deleted++;
    } else {
      pageStats[pageUrl].unchanged++;
    }
  });
  
  // レポート生成
  let message = '=== 変更パターン分析 ===\n\n';
  Object.keys(pageStats).sort().forEach((pageUrl, index) => {
    const stats = pageStats[pageUrl];
    const pageNum = pageUrl.match(/page-test001-(\d+)$/)?.[1] || '?';
    message += `ページ${pageNum}: ${pageUrl}\n`;
    message += `  新規: ${stats.added}, 更新: ${stats.updated}, 削除: ${stats.deleted}, 変更なし: ${stats.unchanged}\n`;
    
    // パターン判定
    let pattern = '';
    if (stats.updated === 0 && stats.deleted === 0 && stats.added === 0) {
      pattern = '全て同一';
    } else if (stats.added > 0 && stats.updated > 0) {
      pattern = '一部変更';
    } else if (stats.unchanged === 0) {
      pattern = '全て新規';
    } else if (stats.deleted > 0 && stats.added > 0) {
      pattern = '追加と削除';
    } else {
      pattern = '混合';
    }
    message += `  パターン: ${pattern}\n\n`;
  });
  
  SpreadsheetApp.getUi().alert('変更パターン分析', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ===== ユーティリティ関数 =====

/**
 * PageSummaryシートの詳細構造を確認
 */
function checkPageSummaryStructure() {
  // ServerLibを使ってマスターブックを参照
  const masterId = PropertiesService.getScriptProperties().getProperty('MASTER_SPREADSHEET_ID');
  if (!masterId) {
    SpreadsheetApp.getUi().alert('エラー', 'マスタースプレッドシートIDが設定されていません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(masterId);
    const pageSummarySheet = masterSpreadsheet.getSheetByName('PageSummary');
    
    if (!pageSummarySheet) {
      SpreadsheetApp.getUi().alert('エラー', 'PageSummaryシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const lastColumn = pageSummarySheet.getLastColumn();
    const headers = pageSummarySheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    
    let message = '=== PageSummaryシート構造 ===\n\n';
    message += `列数: ${lastColumn}列 (期待値: 30列)\n`;
    message += `形式: ${lastColumn === 30 ? '7世代形式 ✓' : lastColumn === 14 ? '3世代形式（要移行）' : '不明な形式'}\n\n`;
    
    message += '【ヘッダー構成】\n';
    headers.forEach((header, index) => {
      message += `列${index + 1}: ${header}\n`;
    });
    
    SpreadsheetApp.getUi().alert('PageSummary構造確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('エラー', `マスターブックにアクセスできません: ${error.toString()}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * テストデータをクリア（PageSummaryは保持）
 */
function clearTestData() {
  const sheets = ['Current', 'Changes', 'UserLog'];
  
  sheets.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      if (sheetName === 'Current') {
        sheet.clear();
      } else if (sheet.getLastRow() > 1) {
        // ヘッダー行を残してクリア
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
      }
    }
  });
  
  SpreadsheetApp.getActiveSpreadsheet().toast('テストデータをクリアしました', 'クリア完了', 3);
}

/**
 * テスト実行ガイドを表示
 */
function showTestGuide() {
  const message = `=== 7世代拡張テスト実行ガイド ===

【準備】
1. このスクリプトをクライアントブックのGASエディタに追加
2. 本番の「バッチ処理」メニューが使用可能であることを確認

【テスト手順】
1. test7Gen001_FirstRun() - 初回実行
2. test7Gen002_SecondRun() - シフト動作確認
3. test7Gen003_FillAllGenerations() - 7世代フル活用
4. test7Gen004_OldestDataDeletion() - 最古データ削除
5. test7Gen005_LargeDataPerformance() - パフォーマンス

【各テストの流れ】
1. テスト関数を実行（テストデータ自動生成）
2. メニュー「PDF Watcher」→「判定を実行」
3. 処理完了を待つ
4. checkPageSummaryGenerations()で結果確認

【確認ポイント】
- 新データが実行1に入る
- 既存データが右にシフト
- 8回目で最古データが削除
- 30列構造が維持される`;
  
  SpreadsheetApp.getUi().alert('テスト実行ガイド', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 簡易メニュー追加（オプション）
 * 注意: onOpen()は使用しない（本番メニューを上書きしないため）
 */
function addTestMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('7世代テスト')
    .addItem('テスト実行ガイド', 'showTestGuide')
    .addSeparator()
    .addItem('TEST-001: 初回実行', 'test7Gen001_FirstRun')
    .addItem('TEST-002: 2回目実行', 'test7Gen002_SecondRun')
    .addItem('TEST-003: 3回目実行（混在パターン）', 'test7Gen003_MixedPatternRun')
    .addItem('TEST-004-007: 4〜7回目実行', 'test7Gen004to007_ContinueRuns')
    .addItem('TEST-008: 8回目実行（最古データ削除）', 'test7Gen008_OldestDataDeletion')
    .addSeparator()
    .addItem('世代状態確認', 'checkPageSummaryGenerations')
    .addItem('変更パターン分析', 'checkChangePatterns')
    .addItem('シート構造確認', 'checkPageSummaryStructure')
    .addItem('テストデータクリア', 'clearTestData')
    .addToUi();
}