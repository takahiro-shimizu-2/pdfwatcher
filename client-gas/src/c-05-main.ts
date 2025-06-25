/**
 * メイン処理関数（グローバル関数として定義）
 */

declare const PDFWatcherServerLib: ServerLibrary;

// グローバル変数として処理情報を保持
let processingGroups: PageGroup[] = [];
let processingStartTime: number = 0;

async function runJudge(): Promise<void> {
  // const startTime = Date.now();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const user = Session.getActiveUser().getEmail();
  
  try {
    // ロックを取得して同時実行を防ぐ
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000); // 10秒待機
    } catch (e) {
      SpreadsheetApp.getUi().alert('別の処理が実行中です。しばらく待ってから再度お試しください。');
      return;
    }
    
    try {
      // 処理状態を確認
      const existingState = StateManager.loadState();
      
      if (existingState && existingState.status === 'processing') {
        // 継続実行の場合
        console.log('継続実行を開始します');
        await runJudgeContinuation();
        return;
      }
      
      // 新規処理の場合
      console.log('新規処理を開始します');
      initializeSheets(spreadsheet);
      
      const currentSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
      if (!currentSheet) {
        throw new Error('Current sheet not found');
      }
      
      const parsedRows = parseCurrentSheet(currentSheet);
      if (parsedRows.length === 0) {
        SpreadsheetApp.getUi().alert('No data found in Current sheet');
        return;
      }
      
      const pages = convertToPages(parsedRows);
      
      // 初期化処理
      await initializeProcessing(pages, user);
      
      // 処理を開始
      await processNextGroup();
      
    } finally {
      lock.releaseLock();
    }
    
  } catch (error) {
    console.error('Error in runJudge:', error);
    SpreadsheetApp.getUi().alert(`Error: ${error}`);
    
    // エラー情報を状態に保存
    StateManager.updateError(String(error));
  }
}

/**
 * 処理を初期化
 * @param pages 処理するページ配列
 * @param user 実行ユーザー
 */
async function initializeProcessing(pages: Page[], user: string): Promise<void> {
  // ページをグループに分割
  processingGroups = GroupProcessor.splitIntoGroups(pages, PDFWatcher.CONSTANTS.PAGES_PER_GROUP);
  processingStartTime = Date.now();
  
  // 処理状態を初期化
  const state = StateManager.createNewState(pages.length, processingGroups.length, user);
  StateManager.saveState(state);
  
  // 次回実行トリガーを先行設定
  const delayMinutes = PDFWatcher.CONSTANTS.TRIGGER_DELAY_MS / 60000;
  TriggerManager.scheduleNextExecution(delayMinutes);
  console.log(`次回実行トリガーを設定しました（${delayMinutes}分後）`);
  
  // 初回実行時はChangesシートをクリア
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const changesSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CHANGES);
  if (changesSheet) {
    changesSheet.clear();
    // ヘッダーを設定
    const headers = ['PageURL', 'PDFのURL'];
    changesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    changesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    console.log('Changesシートをクリアしました（新規処理のため）');
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${pages.length}ページを${processingGroups.length}グループに分割して処理を開始します`,
    'PDF Watcher - 6分制限対策モード',
    5
  );
}

/**
 * 次のグループを処理
 * @returns 処理が完了した場合true
 */
async function processNextGroup(): Promise<boolean> {
  const state = StateManager.loadState();
  if (!state) {
    throw new Error('処理状態が見つかりません');
  }
  
  // 現在のグループを取得
  const currentGroup = GroupProcessor.getCurrentGroup(processingGroups, state.currentGroupIndex);
  if (!currentGroup) {
    console.log('処理するグループがありません');
    return true;
  }
  
  console.log(`\n=== グループ ${state.currentGroupIndex + 1}/${state.totalGroups} の処理 ===`);
  
  try {
    // グループを処理（stateを渡す）
    const serverLib = getServerLibrary();
    await GroupProcessor.processGroup(currentGroup, serverLib, state);
    
    // 注：Changesシート・UserLogの更新は、processGroup内で
    // ミニバッチごとに実行されるため、ここでは不要
    
    // 進捗は既にprocessGroup内で更新されているため、
    // ここでは更新しない（重複を避ける）
    
    // 進捗を表示
    GroupProcessor.showProgress(processingGroups, state.currentGroupIndex);
    
    // 次のグループがあるか確認
    if (state.currentGroupIndex >= state.totalGroups - 1) {
      // すべてのグループが完了
      console.log('\nすべてのグループの処理が完了しました');
      await completeProcessing();
      return true;
    }
    
    // 残り時間を確認
    if (!GroupProcessor.canProcessMoreGroups(processingStartTime)) {
      // 時間切れの場合は一時停止
      console.log('\n実行時間制限に近づいたため、処理を一時停止します');
      StateManager.pauseProcessing();
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `グループ ${state.currentGroupIndex + 1}/${state.totalGroups} まで完了。5分後に自動的に再開されます。`,
        'PDF Watcher - 一時停止',
        10
      );
      
      return false;
    }
    
    // 次のグループへ
    StateManager.moveToNextGroup();
    
    // 再帰的に次のグループを処理
    return await processNextGroup();
    
  } catch (error) {
    console.error('グループ処理中にエラーが発生しました:', error);
    StateManager.updateError(String(error));
    throw error;
  }
}

/**
 * 継続実行のエントリーポイント
 */
async function runJudgeContinuation(): Promise<void> {
  console.log('\n=== 継続実行開始 ===');
  processingStartTime = Date.now();
  
  try {
    // ロックを取得（30秒待機）
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
    } catch (e) {
      console.log('別の処理が実行中です - 30秒待機しましたが取得できませんでした');
      // 2分後に再試行するトリガーを設定
      TriggerManager.scheduleNextExecution(2);
      return;
    }
    
    try {
      // 処理状態を読み込み
      const state = StateManager.loadState();
      if (!state) {
        console.error('処理状態が見つかりません');
        return;
      }
      
      // 状態を検証
      if (state.status === 'completed') {
        console.log('処理は既に完了しています');
        TriggerManager.cancelAllTriggers();
        return;
      }
      
      if (state.status === 'cancelled') {
        console.log('処理はキャンセルされています');
        TriggerManager.cancelAllTriggers();
        return;
      }
      
      // グループ情報を復元
      const currentSheet = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
      if (!currentSheet) {
        throw new Error('Current sheet not found');
      }
      
      const parsedRows = parseCurrentSheet(currentSheet);
      const pages = convertToPages(parsedRows);
      processingGroups = GroupProcessor.splitIntoGroups(pages, PDFWatcher.CONSTANTS.PAGES_PER_GROUP);
      
      // 次回実行トリガーを再設定
      const delayMinutes = PDFWatcher.CONSTANTS.TRIGGER_DELAY_MS / 60000;
      TriggerManager.scheduleNextExecution(delayMinutes);
      
      // statusがprocessingの場合は同じグループを再実行
      if (state.status === 'processing') {
        console.log(`前回の処理が中断されたため、グループ ${state.currentGroupIndex + 1} を再実行します`);
        console.log('注：既に処理済みのページは「変更なし」と判定されます（重複防止のため）');
        SpreadsheetApp.getActiveSpreadsheet().toast(
          `中断されたグループ ${state.currentGroupIndex + 1}/${state.totalGroups} を再実行します\n※既に処理済みのページはスキップされます`,
          'PDF Watcher - 継続実行',
          10
        );
      } else {
        // pausedの場合は次のグループへ
        StateManager.moveToNextGroup();
        SpreadsheetApp.getActiveSpreadsheet().toast(
          `処理を再開します（グループ ${state.currentGroupIndex + 2}/${state.totalGroups}）`,
          'PDF Watcher - 継続実行',
          5
        );
      }
      
      // 処理を継続
      await processNextGroup();
      
    } finally {
      lock.releaseLock();
    }
    
  } catch (error) {
    console.error('継続実行中にエラーが発生しました:', error);
    StateManager.updateError(String(error));
  }
}

/**
 * 処理を完了
 */
async function completeProcessing(): Promise<void> {
  try {
    // 処理状態を完了に更新
    StateManager.completeProcessing();
    
    // トリガーを削除
    const state = StateManager.loadState();
    if (state && state.triggerId) {
      TriggerManager.cancelTrigger(state.triggerId);
    }
    TriggerManager.cancelAllTriggers();
    
    // Currentシートをクリア
    const currentSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(PDFWatcher.SHEET_NAMES.CURRENT);
    if (currentSheet) {
      clearCurrentSheet(currentSheet);
    }
    
    // 完了通知
    const totalDuration = (Date.now() - processingStartTime) / 1000;
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `すべての処理が完了しました（総処理時間: ${totalDuration.toFixed(1)}秒）`,
      'PDF Watcher - 完了',
      10
    );
    
    // 処理状態をクリア
    StateManager.clearState();
    
  } catch (error) {
    console.error('処理完了時にエラーが発生しました:', error);
    throw error;
  }
}

function getServerLibrary(): ServerLibrary {
  try {
    return PDFWatcherServerLib;
  } catch (error) {
    throw new Error(
      'Server library not found. Please add the PDF Watcher Server Library to this project.'
    );
  }
}