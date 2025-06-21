/**
 * GAS用グローバル定義
 * import/exportを使わずにすべてグローバル変数として定義
 */

// PDFWatcher名前空間の定義
const PDFWatcher = {
  // 定数
  SHEET_NAMES: {
    CURRENT: 'Current',
    CHANGES: 'Changes',
    SUMMARY: 'Summary',
    USER_LOG: 'UserLog',
    ARCHIVE_PDF: 'ArchivePDF',
    PAGE_HISTORY: 'PageHistory',
    PAGE_SUMMARY: 'PageSummary',
    RUN_LOG: 'RunLog'
  },
  
  // NOTE: core/src/constants.tsからビルド時にコピー
  CONSTANTS: {
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
    SERVER_LIBRARY_VERSION: 'HEAD'
  },
  
  // 設定（クライアント固有）
  CLIENT_CONFIG: {
    BATCH_TIMEOUT_MS: 30000,
    REQUEST_TIMEOUT_MS: 180000  // 3分
  }
};

// 型定義（TypeScript用）
// NOTE: core/src/types/gas-types.tsからビルド時にコピー
interface ParsedRow {
  pageUrl: string;
  pageHash: string;
  pdfUrls: string[];
}

interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
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

interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  addedCount: number;
}

interface RunBatchOptions {
  pages: Page[];
  user: string;
  masterSpreadsheetId: string;
}

interface ServerLibrary {
  runBatch(options: RunBatchOptions): Promise<BatchResult>;
  configure(configType: string, masterSpreadsheetId: string): void;
}