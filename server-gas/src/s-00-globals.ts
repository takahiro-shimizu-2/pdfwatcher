/**
 * サーバーGAS用グローバル定義
 * import/exportを使わずにグローバル変数として定義
 */

// 定数定義
// NOTE: core/src/constants.tsからビルド時にコピー
const SHEET_NAMES = {
  ARCHIVE_PDF: 'ArchivePDF',
  PAGE_HISTORY: 'PageHistory',
  PAGE_SUMMARY: 'PageSummary',
  RUN_LOG: 'RunLog',
  CURRENT: 'Current',
  CHANGES: 'Changes',
  SUMMARY: 'Summary',
  USER_LOG: 'UserLog'
};

// NOTE: core/src/constants.tsからビルド時にコピー
const CONSTANTS = {
  BATCH_SIZE: 50,
  MAX_PARALLEL_BATCHES: 10,
  MAX_CONCURRENT_BATCHES: 10,
  LOCK_TIMEOUT_MS: 30000,
  LOCK_RETRY_COUNT: 3,
  LOCK_TIME_PER_URL_MS: 80,
  MAX_ERROR_MESSAGE_LENGTH: 255,
  SCRIPT_VERSION: '1.0.0',
  DEFAULT_SHEET_CONFIG: 'sheet' as const,
  MASTER_SPREADSHEET_ID: '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0',
  SERVER_LIBRARY_ID: 'AKfycbzjRwtPTCkHPy-D54w0ZDXgfctL89-FO82keskf5XFr81BUnETtDEFVTDEuXIwuuSRX',
  SERVER_LIBRARY_VERSION: 'HEAD',
  // 6分制限対策用の定数
  MAX_EXECUTION_TIME_MS: 5 * 60 * 1000,      // 5分（安全マージン1分）
  PAGES_PER_GROUP: 30,                       // 1グループあたりのページ数
  PAGES_PER_MINI_BATCH: 5,                   // ミニバッチあたりのページ数
  TRIGGER_DELAY_MS: 7 * 60 * 1000,          // トリガー実行までの遅延（7分）
  STATE_EXPIRY_MS: 24 * 60 * 60 * 1000      // 状態の有効期限（24時間）
};

// 型定義
// NOTE: core/src/types/gas-types.tsからビルド時にコピー
interface SimplePDF {
  url: string;
  subject: string;
}

interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
  pdfs: SimplePDF[];
}

interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  addedCount: number;
  pageHash?: string;
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
  execId?: string;  // 再実行時は前回と同じIDを使用
  isRetry?: boolean;  // 再実行フラグ
}

// NOTE: core/src/models/PageSummary.tsからビルド時にコピー
interface RunSummary {
  date: Date;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
}

interface PageSummary {
  pageUrl: string;
  lastHash?: string;
  run1?: RunSummary;  // 最新の実行結果
  run2?: RunSummary;  // 1つ前の実行結果
  run3?: RunSummary;  // 2つ前の実行結果
  run4?: RunSummary;  // 3つ前の実行結果
  run5?: RunSummary;  // 4つ前の実行結果
  run6?: RunSummary;  // 5つ前の実行結果
  run7?: RunSummary;  // 6つ前の実行結果（最古）
}

// NOTE: core/src/models/PageHistoryEntry.tsからビルド時にコピー
interface PageHistoryEntry {
  runDate: Date;
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
  user: string;
}

// NOTE: core/src/models/RunLogEntry.tsからビルド時にコピー
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

// NOTE: core/src/models/PDF.tsからビルド時にコピー
interface PDF {
  pageUrl: string;
  pdfUrl: string;
  subject: string;
  firstSeen: Date;
  deletedAt: Date | null;  // 削除確認日時（削除されていない場合はnull）
  status: PDFStatus;
}

// ConfigType定義
// NOTE: core/src/types.tsからビルド時にコピー
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