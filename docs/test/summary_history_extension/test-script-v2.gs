/**
 * PageSummary 7世代拡張テスト - 改良版
 * 前回データを適切に保存して3回目以降のパターンテストを実現
 */

/**
 * 前回のCurrentデータを保存
 */
function savePreviousData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current');
  if (!sheet || sheet.getLastRow() === 0) {
    console.log('保存するデータがありません');
    return;
  }
  
  // PreviousDataシートを作成または取得
  let prevSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PreviousData');
  if (!prevSheet) {
    prevSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('PreviousData');
  }
  
  // 現在のCurrentデータをPreviousDataにコピー
  prevSheet.clear();
  const data = sheet.getDataRange().getValues();
  if (data.length > 0) {
    prevSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    console.log('前回データを保存しました');
  }
}

/**
 * 前回のデータを読み込み
 */
function loadPreviousData() {
  const prevSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PreviousData');
  if (!prevSheet || prevSheet.getLastRow() === 0) {
    return null;
  }
  
  return prevSheet.getDataRange().getValues();
}

/**
 * Currentシートにテストデータを投入（改良版）
 */
function generateTestDataForCurrentV2(pageCount = 20, pdfPerPage = 12, executionNumber = 1) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('エラー', 'Currentシートが見つかりません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // 3回目以降の実行前に前回データを読み込み
  let previousData = null;
  if (executionNumber >= 3) {
    previousData = loadPreviousData();
    if (!previousData) {
      SpreadsheetApp.getUi().alert('警告', 
        '前回のデータが見つかりません。\n' +
        '2回目の実行後に savePreviousData() を実行してから3回目を実行してください。', 
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }
  
  sheet.clear();
  
  const timestamp = new Date().getTime();
  const data = [];
  
  const organizations = ['company-a', 'company-b', 'org-x', 'dept-y', 'team-z'];
  const categories = ['reports', 'documents', 'manuals', 'presentations', 'data'];
  const fileTypes = ['report', 'guide', 'manual', 'presentation', 'analysis', 'summary', 'overview'];
  
  for (let i = 1; i <= pageCount; i++) {
    const org = organizations[i % organizations.length];
    const category = categories[Math.floor(i / 5) % categories.length];
    
    // ページURLは固定
    const pageUrl = `https://${org}.example.com/${category}/page-test001-${i}`;
    
    const row = [
      pageUrl,
      generateRandomHash(),
    ];
    
    // 3回目以降の実行では、ページごとに異なるパターンを適用
    if (executionNumber >= 3 && previousData && i <= previousData.length) {
      const previousRow = previousData[i - 1];
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
      
      generatePdfsWithPatternV2(row, previousPdfs, pattern, org, category, i, executionNumber);
    } else {
      // 通常のPDF生成（1,2回目）
      const actualPdfCount = Math.floor(pdfPerPage * (0.8 + Math.random() * 0.4));
      for (let j = 1; j <= actualPdfCount; j++) {
        const fileType = fileTypes[j % fileTypes.length];
        const year = 2020 + (j % 5);
        const month = String((j % 12) + 1).padStart(2, '0');
        row.push(`https://${org}.example.com/${category}/files/${year}/${month}/${fileType}_${i}_${j}_v${timestamp}.pdf`);
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
    `実行${executionNumber}: ${pageCount}ページ分のテストデータを生成しました`, 
    'データ生成完了', 
    3
  );
}

/**
 * パターンに基づいてPDFを生成（改良版）
 */
function generatePdfsWithPatternV2(row, previousPdfs, pattern, org, category, pageNum, executionNumber) {
  const timestamp = new Date().getTime();
  const fileTypes = ['report', 'guide', 'manual', 'presentation', 'analysis', 'summary', 'overview'];
  
  console.log(`ページ${pageNum}: ${pattern}パターン, 前回PDF数: ${previousPdfs.length}`);
  
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
      const shuffled = [...previousPdfs].sort(() => Math.random() - 0.5);
      shuffled.slice(0, keepCount).forEach(pdf => row.push(pdf));
      // 新規追加
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
        // 20%: 削除
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

/**
 * ランダムハッシュ生成
 */
function generateRandomHash() {
  return Math.random().toString(36).substring(2, 10);
}

// ===== 新しいテスト実行関数 =====

/**
 * V2-TEST-001: 初回実行
 */
function v2Test001_FirstRun() {
  console.log('=== V2-TEST-001: 初回実行 ===');
  generateTestDataForCurrentV2(20, 12, 1);
  
  SpreadsheetApp.getUi().alert('V2-TEST-001', 
    '初回データを生成しました。\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」\n' +
    '2. 処理完了を待つ', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * V2-TEST-002: 2回目実行（データ保存付き）
 */
function v2Test002_SecondRun() {
  console.log('=== V2-TEST-002: 2回目実行 ===');
  
  // 現在のデータを保存
  savePreviousData();
  
  // 2回目のデータ生成
  generateTestDataForCurrentV2(20, 12, 2);
  
  SpreadsheetApp.getUi().alert('V2-TEST-002', 
    '2回目データを生成しました。\n' +
    '前回データはPreviousDataシートに保存されています。\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」\n' +
    '2. 処理完了を待つ', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * V2-TEST-003: 3回目実行（混在パターン）
 */
function v2Test003_MixedPattern() {
  console.log('=== V2-TEST-003: 3回目実行（混在パターン） ===');
  
  // 現在のデータを保存
  savePreviousData();
  
  // 3回目のデータ生成（パターン適用）
  generateTestDataForCurrentV2(20, 12, 3);
  
  SpreadsheetApp.getUi().alert('V2-TEST-003', 
    '3回目データを生成しました（混在パターン適用）。\n\n' +
    'パターン:\n' +
    '- ページ1-5: 全て同一\n' +
    '- ページ6-10: 一部変更（60%同一、20%更新、20%新規）\n' +
    '- ページ11-13: 全て新規\n' +
    '- ページ14-16: 追加と削除（70%保持、30%削除、新規追加）\n' +
    '- ページ17-20: 混合パターン\n\n' +
    '次の手順:\n' +
    '1. メニュー「PDF Watcher」→「判定を実行」\n' +
    '2. ChangesHistoryで動作確認', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 前回データの確認
 */
function checkSavedPreviousData() {
  const prevData = loadPreviousData();
  if (!prevData) {
    SpreadsheetApp.getUi().alert('確認', 'PreviousDataシートにデータがありません', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  let message = '=== 保存された前回データ ===\n\n';
  message += `ページ数: ${prevData.length}\n\n`;
  
  // サンプル表示
  for (let i = 0; i < Math.min(3, prevData.length); i++) {
    const row = prevData[i];
    const pdfCount = row.slice(2).filter(url => url && url !== '').length;
    message += `ページ${i + 1}: ${row[0]}\n`;
    message += `  PDF数: ${pdfCount}\n`;
    if (pdfCount > 0) {
      message += `  サンプル: ${row[2]}\n`;
    }
    message += '\n';
  }
  
  SpreadsheetApp.getUi().alert('前回データ確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
}