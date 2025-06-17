/**
 * DIコンテナ - サービスの依存性注入管理
 */
class DIContainer {
  static configure(
    config: ConfigType,
    spreadsheetId: string
  ): void {
    (DIContainer as unknown as Record<string, unknown>)._config = config;
    (DIContainer as unknown as Record<string, unknown>)._spreadsheet = SpreadsheetApp.openById(spreadsheetId);
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
    
    const diffService = new DiffService(archiveRepo);
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