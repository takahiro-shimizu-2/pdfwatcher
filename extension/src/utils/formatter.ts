import { PageInfo } from '../types';

export function formatAsTsv(pageInfo: PageInfo): string {
  const parts = [
    pageInfo.url,
    pageInfo.hash,
    ...pageInfo.pdfUrls
  ];
  
  return parts.join('\t');
}

export function formatMultipleAsTsv(pageInfos: PageInfo[]): string {
  return pageInfos.map(info => formatAsTsv(info)).join('\n');
}