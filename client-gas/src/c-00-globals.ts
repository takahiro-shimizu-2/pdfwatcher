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
  
  CONSTANTS: {
    MAX_ERROR_MESSAGE_LENGTH: 255
  },
  
  // 設定
  CLIENT_CONFIG: {
    MASTER_SPREADSHEET_ID: '1Sk2Z2eDbj-LRspGzIB4zg6X1ERNELdUz3TdWwEZEUa0',
    SERVER_LIBRARY_ID: 'AKfycbzjRwtPTCkHPy-D54w0ZDXgfctL89-FO82keskf5XFr81BUnETtDEFVTDEuXIwuuSRX',
    SERVER_LIBRARY_VERSION: 'HEAD',
    BATCH_SIZE: 50,
    MAX_CONCURRENT_BATCHES: 10,
    BATCH_TIMEOUT_MS: 30000,
  }
};

// 型定義（TypeScript用）
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
  errors: Array<{ message: string }>;
}

interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
}

interface ServerLibrary {
  runBatch(options: {
    pages: Page[];
    user: string;
    masterSpreadsheetId: string;
  }): Promise<BatchResult>;
}