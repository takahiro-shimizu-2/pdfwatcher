/**
 * トリガー管理モジュール
 * GASトリガーの設定・削除・管理
 */

/**
 * トリガーを管理するクラス
 */
class TriggerManager {
  private static readonly HANDLER_FUNCTION = 'runJudgeContinuation';
  
  /**
   * 次回実行トリガーを設定
   * @param delayMinutes 遅延時間（分）
   * @returns トリガーID
   */
  static scheduleNextExecution(delayMinutes: number): string {
    try {
      // 既存の重複トリガーをクリーンアップ
      this.cleanupDuplicateTriggers();
      
      // 新しいトリガーを作成
      const trigger = ScriptApp.newTrigger(this.HANDLER_FUNCTION)
        .timeBased()
        .after(delayMinutes * 60 * 1000)
        .create();
      
      const triggerId = trigger.getUniqueId();
      console.log(`次回実行トリガーを設定しました: ${delayMinutes}分後, ID: ${triggerId}`);
      
      // 処理状態にトリガーIDを保存
      const state = StateManager.loadState();
      if (state) {
        state.triggerId = triggerId;
        StateManager.saveState(state);
      }
      
      return triggerId;
    } catch (error) {
      console.error('トリガーの設定に失敗しました:', error);
      throw new Error(`Failed to schedule trigger: ${error}`);
    }
  }
  
  /**
   * 指定IDのトリガーを削除
   * @param triggerId トリガーID
   */
  static cancelTrigger(triggerId: string): void {
    if (!triggerId) {
      console.log('削除するトリガーIDが指定されていません');
      return;
    }
    
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const targetTrigger = triggers.find(t => t.getUniqueId() === triggerId);
      
      if (targetTrigger) {
        ScriptApp.deleteTrigger(targetTrigger);
        console.log(`トリガーを削除しました: ID: ${triggerId}`);
      } else {
        console.log(`指定されたトリガーが見つかりません: ID: ${triggerId}`);
      }
    } catch (error) {
      console.error('トリガーの削除に失敗しました:', error);
      // エラーが発生してもプロセスは継続
    }
  }
  
  /**
   * 重複トリガーを削除
   */
  static cleanupDuplicateTriggers(): void {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const continuationTriggers = triggers.filter(t => 
        t.getHandlerFunction() === this.HANDLER_FUNCTION
      );
      
      if (continuationTriggers.length > 1) {
        console.log(`${continuationTriggers.length}個の重複トリガーを検出しました`);
        
        // 最新の1つを残して削除
        const sortedTriggers = continuationTriggers.sort((a, b) => {
          // トリガーの作成時刻は直接取得できないため、IDで代用
          return a.getUniqueId().localeCompare(b.getUniqueId());
        });
        
        // 最初のものを残して削除
        for (let i = 1; i < sortedTriggers.length; i++) {
          ScriptApp.deleteTrigger(sortedTriggers[i]);
          console.log(`重複トリガーを削除しました: ID: ${sortedTriggers[i].getUniqueId()}`);
        }
      }
    } catch (error) {
      console.error('重複トリガーのクリーンアップに失敗しました:', error);
      // エラーが発生してもプロセスは継続
    }
  }
  
  /**
   * アクティブなトリガー一覧を取得
   * @returns トリガー一覧
   */
  static getActiveTriggers(): GoogleAppsScript.Script.Trigger[] {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const continuationTriggers = triggers.filter(t => 
        t.getHandlerFunction() === this.HANDLER_FUNCTION
      );
      
      console.log(`アクティブなトリガー数: ${continuationTriggers.length}`);
      continuationTriggers.forEach((trigger, index) => {
        console.log(`  ${index + 1}. ID: ${trigger.getUniqueId()}, Type: ${trigger.getEventType()}`);
      });
      
      return continuationTriggers;
    } catch (error) {
      console.error('トリガー一覧の取得に失敗しました:', error);
      return [];
    }
  }
  
  /**
   * すべての継続実行トリガーを削除
   */
  static cancelAllTriggers(): void {
    try {
      const triggers = this.getActiveTriggers();
      
      if (triggers.length === 0) {
        console.log('削除するトリガーはありません');
        return;
      }
      
      triggers.forEach(trigger => {
        ScriptApp.deleteTrigger(trigger);
        console.log(`トリガーを削除しました: ID: ${trigger.getUniqueId()}`);
      });
      
      console.log(`${triggers.length}個のトリガーを削除しました`);
    } catch (error) {
      console.error('すべてのトリガーの削除に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * 現在の状態に基づいてトリガーを設定
   * @param state 処理状態
   * @returns トリガーID（設定した場合）
   */
  static setupTriggerForState(state: ProcessingState): string | null {
    // 処理が完了またはキャンセルされている場合はトリガーを設定しない
    if (state.status === 'completed' || state.status === 'cancelled') {
      console.log('処理が完了/キャンセルされているため、トリガーは設定しません');
      return null;
    }
    
    // まだ処理すべきグループが残っている場合
    if (state.currentGroupIndex < state.totalGroups - 1) {
      const delayMinutes = PDFWatcher.CONSTANTS.TRIGGER_DELAY_MS / 60000;
      return this.scheduleNextExecution(delayMinutes);
    }
    
    console.log('すべてのグループが処理済みのため、トリガーは設定しません');
    return null;
  }
  
  /**
   * トリガー情報を文字列で取得（デバッグ用）
   * @returns トリガー情報
   */
  static getTriggerInfo(): string {
    const triggers = this.getActiveTriggers();
    
    if (triggers.length === 0) {
      return '設定されているトリガーはありません';
    }
    
    const info = triggers.map((trigger, index) => {
      return `${index + 1}. ID: ${trigger.getUniqueId()}, Type: ${trigger.getEventType()}`;
    }).join('\n');
    
    return `アクティブなトリガー:\n${info}`;
  }
}