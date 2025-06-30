/**
 * GASプロジェクトで使用される共通型定義
 */

import { Page } from '../models/Page';
import { BatchResult } from '../models/BatchResult';

// server-gasで使用される型
export interface RunBatchOptions {
  pages: Page[];
  user: string;
  masterSpreadsheetId: string;
  execId?: string;  // 再実行時は前回と同じIDを使用
  isRetry?: boolean;  // 再実行フラグ
}

// client-gasで使用される型
export interface ParsedRow {
  pageUrl: string;
  pageHash: string;
  pdfUrls: string[];
  pdfs: Array<{url: string; subject: string}>;
}

export interface ServerLibrary {
  runBatch(options: RunBatchOptions): Promise<BatchResult>;
  configure(configType: string, masterSpreadsheetId: string): void;
}

// GAS固有の型定義の再エクスポート
export { Page, BatchResult, DiffResult } from '../models';
export type { ConfigType } from '../types';