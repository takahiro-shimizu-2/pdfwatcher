/**
 * サーバーGAS用グローバル定義
 * import/exportを使わずにグローバル変数として定義
 */

// 定数定義
const SHEET_NAMES = {
  CURRENT: 'Current',
  CHANGES: 'Changes',
  SUMMARY: 'Summary',
  USER_LOG: 'UserLog',
  ARCHIVE_PDF: 'ArchivePDF',
  PAGE_HISTORY: 'PageHistory',
  PAGE_SUMMARY: 'PageSummary',
  RUN_LOG: 'RunLog'
};

const CONSTANTS = {
  MAX_ERROR_MESSAGE_LENGTH: 255,
  SCRIPT_VERSION: '1.0.0',
  DEFAULT_SHEET_CONFIG: 'sheet' as const,
  LOCK_TIMEOUT_MS: 30000,
  LOCK_RETRY_COUNT: 3
};

// 型定義
interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
}

interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  addedCount: number;
}

interface BatchResult {
  execId: string;
  processedPages: number;
  updatedPages: number;
  addedPdfs: number;
  duration: number;
  errors: Error[];
  diffResults?: DiffResult[];
}

interface RunBatchOptions {
  pages: Page[];
  user: string;
  masterSpreadsheetId: string;
}

interface PageSummary {
  pageUrl: string;
  run1?: {
    date: Date;
    pageUpdated: boolean;
    pdfUpdated: boolean;
    addedCount: number;
  };
  run2?: {
    date: Date;
    pageUpdated: boolean;
    pdfUpdated: boolean;
    addedCount: number;
  };
  run3?: {
    date: Date;
    pageUpdated: boolean;
    pdfUpdated: boolean;
    addedCount: number;
  };
}

interface PageHistoryEntry {
  runDate: Date;
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
  user: string;
}

interface RunLogEntry {
  execId: string;
  timestamp: Date;
  user: string;
  durationSeconds: number;
  pagesProcessed: number;
  pagesUpdated: number;
  pdfsAdded: number;
  result: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  scriptVersion: string;
}

type PDFStatus = 'ページ内に存在' | 'ページから削除';

interface PDF {
  pageUrl: string;
  pdfUrl: string;
  firstSeen: Date;
  lastSeen: Date;
  status: PDFStatus;
}

// ConfigType定義
type ConfigType = 'sheet' | 'drive' | 'bq';

// Repository Interfaces
interface IArchiveRepository {
  getPdfsByPage(pageUrl: string): Promise<PDF[]>;
  upsertPdfs(pdfs: PDF[]): Promise<void>;
  getAllPdfs(): Promise<PDF[]>;
}

interface IHistoryRepository {
  addPageHistory(entries: PageHistoryEntry[]): Promise<void>;
  getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]>;
}

interface ISummaryRepository {
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  getPageSummary(pageUrl: string): Promise<PageSummary | null>;
}

interface IRunLogRepository {
  addRunLog(log: RunLogEntry): Promise<void>;
  getRunLogs(limit: number): Promise<RunLogEntry[]>;
}

// Service Container
interface ServiceContainer {
  archiveRepo: IArchiveRepository;
  historyRepo: IHistoryRepository;
  summaryRepo: ISummaryRepository;
  runLogRepo: IRunLogRepository;
  diffService: DiffService;
  summaryService: SummaryService;
}

// グローバル関数の宣言（実装は各ファイルで行う）
declare function generateUUID(): string;
declare function runBatch(options: RunBatchOptions): Promise<BatchResult>;
declare function configure(configType: ConfigType, masterSpreadsheetId: string): void;
declare function setupMasterSpreadsheet(): void;
declare function setupClientSpreadsheet(masterSpreadsheetId?: string): void;