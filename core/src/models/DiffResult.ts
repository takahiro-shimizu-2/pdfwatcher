import { PDF } from './PDF';

export interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  removedPdfs?: PDF[]; // 削除されたPDFの詳細情報
  addedCount: number;
  pageHash?: string;
}