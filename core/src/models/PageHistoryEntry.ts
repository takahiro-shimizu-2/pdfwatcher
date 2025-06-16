export interface PageHistoryEntry {
  runDate: Date;
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
  user: string;
}