export interface PageInfo {
  url: string;
  hash: string;
  pdfUrls: string[];
}

export interface Message {
  action: 'extractPageInfo' | 'copyToClipboard';
  data?: any;
}

export interface ExtractResult {
  success: boolean;
  pageInfo?: PageInfo;
  error?: string;
}