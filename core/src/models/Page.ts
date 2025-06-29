export interface SimplePDF {
  url: string;
  text: string;
}

export interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
  pdfs: SimplePDF[];
}