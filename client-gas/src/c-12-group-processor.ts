/**
 * グループ処理モジュール
 * ページをグループに分割して処理
 */

/**
 * ページグループの処理を管理するクラス
 */
class GroupProcessor {
  /**
   * ページをグループに分割
   * @param pages 分割するページ配列
   * @param groupSize 1グループあたりのページ数
   * @returns ページグループの配列
   */
  static splitIntoGroups(pages: Page[], groupSize: number): PageGroup[] {
    if (!pages || pages.length === 0) {
      console.log('分割するページがありません');
      return [];
    }
    
    const groups: PageGroup[] = [];
    const totalPages = pages.length;
    
    for (let i = 0; i < totalPages; i += groupSize) {
      const startIndex = i;
      const endIndex = Math.min(i + groupSize - 1, totalPages - 1);
      const groupPages = pages.slice(startIndex, endIndex + 1);
      
      groups.push({
        groupIndex: groups.length,
        pages: groupPages,
        startIndex: startIndex,
        endIndex: endIndex
      });
    }
    
    console.log(`${totalPages}ページを${groups.length}グループに分割しました`);
    groups.forEach(group => {
      console.log(`  グループ${group.groupIndex + 1}: ${group.pages.length}ページ (${group.startIndex + 1}-${group.endIndex + 1})`);
    });
    
    return groups;
  }
  
  /**
   * 1グループを処理（ミニバッチに分割して処理）
   * @param group 処理するページグループ
   * @param serverLib サーバーライブラリ
   * @param state 現在の処理状態
   * @returns バッチ処理結果
   */
  static async processGroup(
    group: PageGroup, 
    serverLib: ServerLibrary,
    state: ProcessingState
  ): Promise<BatchResult> {
    console.log(`グループ${group.groupIndex + 1}の処理を開始します（${group.pages.length}ページ）`);
    const groupStartTime = Date.now();
    
    try {
      // グループをミニバッチに分割（5ページずつ）
      const miniBatches = splitIntoBatches(group.pages, PDFWatcher.CONSTANTS.PAGES_PER_MINI_BATCH);
      console.log(`グループを${miniBatches.length}ミニバッチに分割しました（各${PDFWatcher.CONSTANTS.PAGES_PER_MINI_BATCH}ページ）`);
      
      const allResults: BatchResult[] = [];
      // let processedInGroup = 0;
      
      // 各ミニバッチを処理
      for (let i = 0; i < miniBatches.length; i++) {
        // 既に完了したミニバッチはスキップ
        const completedInGroup = state.completedMiniBatches?.[group.groupIndex] || [];
        if (completedInGroup.includes(i)) {
          console.log(`  ミニバッチ ${i + 1}/${miniBatches.length} は処理済みのためスキップ`);
          // processedInGroup += miniBatches[i].length;
          continue;
        }
        
        const miniBatch = miniBatches[i];
        console.log(`  ミニバッチ ${i + 1}/${miniBatches.length} を処理中...`);
        
        // ミニバッチを処理
        const batchResults = await executeBatchesInParallel(
          [miniBatch],  // 1つのミニバッチを処理
          Session.getActiveUser().getEmail(),
          serverLib,
          state.execId,  // 実行IDを渡す
          false  // 再実行フラグは常にfalse（新規として処理）
        );
        
        allResults.push(...batchResults);
        // processedInGroup += miniBatch.length;
        
        // ミニバッチごとにChangesシートとUserLogを更新
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const changesSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.CHANGES);
        const userLogSheet = spreadsheet.getSheetByName(PDFWatcher.SHEET_NAMES.USER_LOG);
        
        if (changesSheet && batchResults[0].diffResults) {
          updateChangesSheet(changesSheet, batchResults[0].diffResults);
        }
        
        if (userLogSheet) {
          updateUserLog(userLogSheet, batchResults, batchResults[0].duration);
        }
        
        // 処理済みページ数とミニバッチ完了状態を更新
        const completedBatches = state.completedMiniBatches || {};
        if (!completedBatches[group.groupIndex]) {
          completedBatches[group.groupIndex] = [];
        }
        completedBatches[group.groupIndex].push(i);
        
        const updatedState = {
          ...state,
          processedPages: state.processedPages + miniBatch.length,
          completedMiniBatches: completedBatches
        };
        StateManager.saveState(updatedState);
        
        // 更新されたstateを次のループで使用するために反映
        state = updatedState;
        
        console.log(`  ミニバッチ ${i + 1} 完了（累計: ${updatedState.processedPages}ページ）`);
      }
      
      // 結果を統合
      const mergedResult = this.mergeBatchResults(allResults);
      
      const groupDuration = (Date.now() - groupStartTime) / 1000;
      console.log(`グループ${group.groupIndex + 1}の処理が完了しました（${groupDuration.toFixed(1)}秒）`);
      console.log(`  処理ページ数: ${mergedResult.processedPages}`);
      console.log(`  更新ページ数: ${mergedResult.updatedPages}`);
      console.log(`  追加PDF数: ${mergedResult.addedPdfs}`);
      
      return mergedResult;
    } catch (error) {
      console.error(`グループ${group.groupIndex + 1}の処理でエラーが発生しました:`, error);
      throw error;
    }
  }
  
  /**
   * 残り時間で処理可能か判定
   * @param startTime 処理開始時刻（ミリ秒）
   * @returns 処理可能な場合true
   */
  static canProcessMoreGroups(startTime: number): boolean {
    const elapsed = Date.now() - startTime;
    const remaining = PDFWatcher.CONSTANTS.MAX_EXECUTION_TIME_MS - elapsed;
    
    // 次のグループを処理するのに必要な最小時間（1分）
    const MIN_TIME_FOR_NEXT_GROUP = 60 * 1000;
    
    const canProcess = remaining > MIN_TIME_FOR_NEXT_GROUP;
    
    console.log(`経過時間: ${(elapsed / 1000).toFixed(1)}秒, 残り時間: ${(remaining / 1000).toFixed(1)}秒`);
    console.log(`次のグループを処理${canProcess ? 'できます' : 'できません'}`);
    
    return canProcess;
  }
  
  /**
   * バッチ結果をマージ
   * @param results バッチ結果の配列
   * @returns マージされた結果
   */
  private static mergeBatchResults(results: BatchResult[]): BatchResult {
    const execId = results[0]?.execId || 'merged';
    let processedPages = 0;
    let updatedPages = 0;
    let addedPdfs = 0;
    let duration = 0;
    const errors: Error[] = [];
    const allDiffResults: DiffResult[] = [];
    
    for (const result of results) {
      processedPages += result.processedPages;
      updatedPages += result.updatedPages;
      addedPdfs += result.addedPdfs;
      duration += result.duration;
      
      if (result.errors) {
        errors.push(...result.errors);
      }
      
      if (result.diffResults) {
        allDiffResults.push(...result.diffResults);
      }
    }
    
    return {
      execId: execId,
      processedPages: processedPages,
      updatedPages: updatedPages,
      addedPdfs: addedPdfs,
      duration: duration,
      errors: errors,
      diffResults: allDiffResults
    };
  }
  
  /**
   * 現在のグループを取得
   * @param groups 全グループ
   * @param currentIndex 現在のインデックス
   * @returns 現在のグループ（存在しない場合null）
   */
  static getCurrentGroup(groups: PageGroup[], currentIndex: number): PageGroup | null {
    if (currentIndex < 0 || currentIndex >= groups.length) {
      console.log(`無効なグループインデックス: ${currentIndex}`);
      return null;
    }
    
    return groups[currentIndex];
  }
  
  /**
   * 処理統計を表示
   * @param groups 全グループ
   * @param processedIndex 処理済みの最後のインデックス
   */
  static showProgress(groups: PageGroup[], processedIndex: number): void {
    const totalGroups = groups.length;
    const processedGroups = processedIndex + 1;
    const remainingGroups = totalGroups - processedGroups;
    
    const totalPages = groups.reduce((sum, g) => sum + g.pages.length, 0);
    const processedPages = groups
      .slice(0, processedGroups)
      .reduce((sum, g) => sum + g.pages.length, 0);
    const remainingPages = totalPages - processedPages;
    
    console.log('=== 処理進捗 ===');
    console.log(`グループ: ${processedGroups}/${totalGroups} (残り${remainingGroups})`);
    console.log(`ページ: ${processedPages}/${totalPages} (残り${remainingPages})`);
    console.log(`進捗率: ${((processedPages / totalPages) * 100).toFixed(1)}%`);
  }
}