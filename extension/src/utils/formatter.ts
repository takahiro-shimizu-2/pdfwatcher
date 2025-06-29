import { PageInfo } from '../types';

export function formatAsTsv(pageInfo: PageInfo): string {
  // PDFリンクがない場合は、URL、ハッシュ、空のテキスト、空のPDF URLの行を返す
  if (pageInfo.pdfLinks.length === 0) {
    return [pageInfo.url, pageInfo.hash, '', ''].join('\t');
  }
  
  // 複数行形式: 各PDFリンクごとに1行
  const lines: string[] = [];
  pageInfo.pdfLinks.forEach(pdfLink => {
    // 特殊文字のエスケープ
    const escapedText = pdfLink.text
      .replace(/\t/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ');
    
    const parts = [
      pageInfo.url,
      pageInfo.hash,
      escapedText,
      pdfLink.url
    ];
    
    lines.push(parts.join('\t'));
  });
  
  return lines.join('\n');
}

export function formatMultipleAsTsv(pageInfos: PageInfo[]): string {
  return pageInfos.map(info => formatAsTsv(info)).join('\n');
}