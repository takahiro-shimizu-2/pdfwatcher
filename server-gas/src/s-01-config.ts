/**
 * DIコンテナ - サービスの依存性注入管理
 */
class DIContainer {
  static configure(
    config: ConfigType,
    spreadsheetId: string
  ): void {
    (DIContainer as unknown as Record<string, unknown>)._config = config;
    
    try {
      (DIContainer as unknown as Record<string, unknown>)._spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      // アクセス権限エラーの場合、より具体的なメッセージを提供
      const errorMessage = (error as Error).toString();
      if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        throw new Error(`マスタースプレッドシートへのアクセス権限がありません。スプレッドシートID: ${spreadsheetId}. 管理者に共有権限の付与を依頼してください。`);
      } else if (errorMessage.includes('not found')) {
        throw new Error(`マスタースプレッドシートが見つかりません。スプレッドシートID: ${spreadsheetId}. IDが正しいか確認してください。`);
      } else {
        throw new Error(`マスタースプレッドシートを開けませんでした: ${errorMessage}`);
      }
    }
    
    (DIContainer as unknown as Record<string, unknown>)._instance = null;
  }

  static getServices(): ServiceContainer {
    const instance = (DIContainer as unknown as Record<string, unknown>)._instance;
    const spreadsheet = (DIContainer as unknown as Record<string, unknown>)._spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
    
    if (!instance) {
      if (!spreadsheet) {
        throw new Error('DIContainer not configured. Call configure() first.');
      }
      
      (DIContainer as unknown as Record<string, unknown>)._instance = this.createServices();
    }
    
    return (DIContainer as unknown as Record<string, unknown>)._instance as ServiceContainer;
  }

  private static createServices(): ServiceContainer {
    const config = (DIContainer as unknown as Record<string, unknown>)._config as ConfigType || 'sheet';
    const spreadsheet = (DIContainer as unknown as Record<string, unknown>)._spreadsheet as GoogleAppsScript.Spreadsheet.Spreadsheet;
    
    if (config !== 'sheet' || !spreadsheet) {
      throw new Error('Only sheet configuration is currently supported');
    }

    const archiveRepo = new SheetArchiveRepository(spreadsheet);
    const historyRepo = new SheetHistoryRepository(spreadsheet);
    const summaryRepo = new SheetSummaryRepository(spreadsheet);
    const runLogRepo = new SheetRunLogRepository(spreadsheet);
    
    const diffService = new DiffService(archiveRepo, summaryRepo);
    const summaryService = new SummaryService(summaryRepo, historyRepo);

    return {
      archiveRepo,
      historyRepo,
      summaryRepo,
      runLogRepo,
      diffService,
      summaryService,
    };
  }
}

// Initialize static properties in ES5-compatible way
(DIContainer as unknown as Record<string, unknown>)._instance = null;
(DIContainer as unknown as Record<string, unknown>)._config = 'sheet';
(DIContainer as unknown as Record<string, unknown>)._spreadsheet = null;