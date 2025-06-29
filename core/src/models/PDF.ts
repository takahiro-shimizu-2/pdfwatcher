export type PDFStatus = 'ページ内に存在' | 'ページから削除';

export interface PDF {
  pageUrl: string;
  pdfUrl: string;
  subject: string;
  firstSeen: Date;
  deletedAt: Date | null;  // 削除確認日時（削除されていない場合はnull）
  status: PDFStatus;
}