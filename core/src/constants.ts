export const CONSTANTS = {
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
  STATE_EXPIRY_MS: 24 * 60 * 60 * 1000,     // 状態の有効期限（24時間）
} as const;

export const SHEET_NAMES = {
  ARCHIVE_PDF: 'ArchivePDF',
  PAGE_HISTORY: 'PageHistory',
  PAGE_SUMMARY: 'PageSummary',
  RUN_LOG: 'RunLog',
  CURRENT: 'Current',
  CHANGES: 'Changes',
  SUMMARY: 'Summary',
  USER_LOG: 'UserLog',
} as const;