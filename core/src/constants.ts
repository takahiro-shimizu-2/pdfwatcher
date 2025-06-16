export const CONSTANTS = {
  BATCH_SIZE: 50,
  MAX_PARALLEL_BATCHES: 10,
  LOCK_TIMEOUT_MS: 10000,
  LOCK_RETRY_COUNT: 3,
  LOCK_TIME_PER_URL_MS: 80,
  MAX_ERROR_MESSAGE_LENGTH: 30,
  SCRIPT_VERSION: 'v1.0',
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