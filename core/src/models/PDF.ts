export type PDFStatus = 'ページ内に存在' | 'ページから削除';

export interface PDF {
  pageUrl: string;
  pdfUrl: string;
  firstSeen: Date;
  lastSeen: Date;
  status: PDFStatus;
}