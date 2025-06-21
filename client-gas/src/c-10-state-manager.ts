/**
 * 状態管理モジュール
 * 処理状態をPropertiesServiceで管理
 */

/**
 * 処理状態を管理するクラス
 */
class StateManager {
  private static readonly STATE_KEY = 'PDF_WATCHER_PROCESSING_STATE';
  private static readonly VERSION = '1.0.0';
  
  /**
   * 処理状態を保存
   * @param state 保存する処理状態
   */
  static saveState(state: ProcessingState): void {
    try {
      const properties = PropertiesService.getScriptProperties();
      properties.setProperty(this.STATE_KEY, JSON.stringify(state));
      console.log('処理状態を保存しました:', {
        status: state.status,
        currentGroup: state.currentGroupIndex + 1,
        totalGroups: state.totalGroups,
        processedPages: state.processedPages
      });
    } catch (error) {
      console.error('処理状態の保存に失敗しました:', error);
      throw new Error(`Failed to save processing state: ${error}`);
    }
  }
  
  /**
   * 処理状態を読み込み
   * @returns 処理状態（存在しない場合はnull）
   */
  static loadState(): ProcessingState | null {
    try {
      const properties = PropertiesService.getScriptProperties();
      const stateJson = properties.getProperty(this.STATE_KEY);
      
      if (!stateJson) {
        console.log('保存された処理状態はありません');
        return null;
      }
      
      const state = JSON.parse(stateJson) as ProcessingState;
      
      // 有効性チェック
      if (!this.isStateValid(state)) {
        console.log('処理状態が無効または期限切れです');
        this.clearState();
        return null;
      }
      
      console.log('処理状態を読み込みました:', {
        status: state.status,
        currentGroup: state.currentGroupIndex + 1,
        totalGroups: state.totalGroups,
        processedPages: state.processedPages
      });
      
      return state;
    } catch (error) {
      console.error('処理状態の読み込みに失敗しました:', error);
      return null;
    }
  }
  
  /**
   * 処理状態をクリア
   */
  static clearState(): void {
    try {
      const properties = PropertiesService.getScriptProperties();
      properties.deleteProperty(this.STATE_KEY);
      console.log('処理状態をクリアしました');
    } catch (error) {
      console.error('処理状態のクリアに失敗しました:', error);
    }
  }
  
  /**
   * 状態の有効性を検証
   * @param state 検証する処理状態
   * @returns 有効な場合true
   */
  static isStateValid(state: ProcessingState): boolean {
    // バージョンチェック
    if (state.version !== this.VERSION) {
      console.log('状態管理バージョンが一致しません');
      return false;
    }
    
    // 有効期限チェック（24時間）
    const now = Date.now();
    const elapsed = now - state.lastUpdateTime;
    if (elapsed > PDFWatcher.CONSTANTS.STATE_EXPIRY_MS) {
      console.log('処理状態が有効期限を超過しています');
      return false;
    }
    
    // 必須フィールドの存在チェック
    if (!state.sessionId || 
        state.currentGroupIndex === undefined || 
        state.totalGroups === undefined ||
        !state.status) {
      console.log('処理状態に必須フィールドが不足しています');
      return false;
    }
    
    return true;
  }
  
  /**
   * 進捗のみを更新
   * @param processedCount 処理済みページ数
   */
  static updateProgress(processedCount: number): void {
    try {
      const state = this.loadState();
      if (!state) {
        throw new Error('No processing state found to update');
      }
      
      state.processedPages = processedCount;
      state.lastUpdateTime = Date.now();
      
      this.saveState(state);
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * 新しい処理状態を作成
   * @param totalPages 総ページ数
   * @param totalGroups 総グループ数
   * @param user 実行ユーザー
   * @returns 新しい処理状態
   */
  static createNewState(totalPages: number, totalGroups: number, user: string): ProcessingState {
    const now = Date.now();
    return {
      version: this.VERSION,
      status: 'processing',
      startTime: now,
      lastUpdateTime: now,
      currentGroupIndex: 0,
      totalGroups: totalGroups,
      processedPages: 0,
      totalPages: totalPages,
      user: user,
      errorCount: 0,
      sessionId: Utilities.getUuid()
    };
  }
  
  /**
   * エラー情報を更新
   * @param errorMessage エラーメッセージ
   */
  static updateError(errorMessage: string): void {
    try {
      const state = this.loadState();
      if (!state) {
        console.warn('エラー更新時に処理状態が見つかりません');
        return;
      }
      
      state.errorCount++;
      state.lastError = errorMessage.substring(0, PDFWatcher.CONSTANTS.MAX_ERROR_MESSAGE_LENGTH);
      state.lastUpdateTime = Date.now();
      
      // 3回連続エラーの場合はキャンセル
      if (state.errorCount >= 3) {
        state.status = 'cancelled';
        console.log('3回連続エラーのため処理をキャンセルしました');
      } else {
        state.status = 'error';
      }
      
      this.saveState(state);
    } catch (error) {
      console.error('エラー情報の更新に失敗しました:', error);
    }
  }
  
  /**
   * 次のグループへ進む
   */
  static moveToNextGroup(): void {
    try {
      const state = this.loadState();
      if (!state) {
        throw new Error('No processing state found');
      }
      
      state.currentGroupIndex++;
      state.lastUpdateTime = Date.now();
      state.status = 'processing';
      
      this.saveState(state);
    } catch (error) {
      console.error('次のグループへの移動に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * 処理を一時停止
   */
  static pauseProcessing(): void {
    try {
      const state = this.loadState();
      if (!state) {
        throw new Error('No processing state found');
      }
      
      state.status = 'paused';
      state.lastUpdateTime = Date.now();
      
      this.saveState(state);
      console.log('処理を一時停止しました');
    } catch (error) {
      console.error('処理の一時停止に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * 処理を完了
   */
  static completeProcessing(): void {
    try {
      const state = this.loadState();
      if (!state) {
        throw new Error('No processing state found');
      }
      
      state.status = 'completed';
      state.lastUpdateTime = Date.now();
      
      this.saveState(state);
      console.log('処理が完了しました');
    } catch (error) {
      console.error('処理の完了に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * 現在の処理セッション情報を取得
   * @returns 処理セッション情報
   */
  static getSessionInfo(): ProcessingSession | null {
    const state = this.loadState();
    if (!state) {
      return null;
    }
    
    return {
      sessionId: state.sessionId,
      isFirstRun: state.currentGroupIndex === 0,
      isContinuation: state.currentGroupIndex > 0,
      startedAt: state.startTime
    };
  }
}