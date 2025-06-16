export interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  addedCount: number;
}