export interface PdfLink {
  url: string;
  text: string;
}

export interface PageInfo {
  url: string;
  hash: string;
  pdfUrls: string[];
  pdfLinks: PdfLink[];
}

export interface Message {
  action: 'extractPageInfo' | 'copyToClipboard';
  data?: string;
}

export interface ExtractResult {
  success: boolean;
  pageInfo?: PageInfo;
  error?: string;
}