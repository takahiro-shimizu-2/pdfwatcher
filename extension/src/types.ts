export interface PageInfo {
  url: string;
  hash: string;
  pdfUrls: string[];
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