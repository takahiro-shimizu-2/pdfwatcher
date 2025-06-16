import { ConfigType, IArchiveRepository, IHistoryRepository, ISummaryRepository, IRunLogRepository } from '@pdf-watcher/core';
import { SheetArchiveRepository } from './infrastructure/repositories/SheetArchiveRepository';
import { SheetHistoryRepository } from './infrastructure/repositories/SheetHistoryRepository';
import { SheetSummaryRepository } from './infrastructure/repositories/SheetSummaryRepository';
import { SheetRunLogRepository } from './infrastructure/repositories/SheetRunLogRepository';
import { DiffService } from './domain/services/DiffService';
import { SummaryService } from './domain/services/SummaryService';

export interface ServiceContainer {
  archiveRepo: IArchiveRepository;
  historyRepo: IHistoryRepository;
  summaryRepo: ISummaryRepository;
  runLogRepo: IRunLogRepository;
  diffService: DiffService;
  summaryService: SummaryService;
}

export class DIContainer {
  static configure(
    config: ConfigType,
    spreadsheetId: string
  ): void {
    (DIContainer as any)._config = config;
    (DIContainer as any)._spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    (DIContainer as any)._instance = null;
  }

  static getServices(): ServiceContainer {
    const instance = (DIContainer as any)._instance;
    const spreadsheet = (DIContainer as any)._spreadsheet;
    
    if (!instance) {
      if (!spreadsheet) {
        throw new Error('DIContainer not configured. Call configure() first.');
      }
      
      (DIContainer as any)._instance = this.createServices();
    }
    
    return (DIContainer as any)._instance;
  }

  private static createServices(): ServiceContainer {
    const config = (DIContainer as any)._config || 'sheet';
    const spreadsheet = (DIContainer as any)._spreadsheet;
    
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
(DIContainer as any)._instance = null;
(DIContainer as any)._config = 'sheet';
(DIContainer as any)._spreadsheet = null;