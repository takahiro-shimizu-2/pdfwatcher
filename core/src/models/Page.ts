export interface SimplePDF {
  url: string;
  subject: string;
}

export interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
  pdfs: SimplePDF[];
}