import { Page, BatchResult } from '@pdf-watcher/core';

export interface ParsedRow {
  pageUrl: string;
  pageHash: string;
  pdfUrls: string[];
}

export interface UserLogEntry {
  timestamp: Date;
  durationSeconds: number;
  pagesProcessed: number;
  pagesUpdated: number;
  pdfsAdded: number;
  result: 'SUCCESS' | 'ERROR';
  errorMessage: string;
}

export interface ChangeRow {
  pageUrl: string;
  addedCount: number;
  newPdfs: string;
}

export interface ServerLibrary {
  runBatch(options: {
    pages: Page[];
    user: string;
    masterSpreadsheetId: string;
  }): BatchResult;
}