import { PageInfo, PdfLink } from '../types';

export function extractPageInfo(): PageInfo {
  const url = window.location.href;
  const hash = generatePageHash();
  const pdfUrls = extractPdfUrls();
  const pdfLinks = extractPdfLinks();
  
  return {
    url,
    hash,
    pdfUrls,
    pdfLinks,
  };
}

function generatePageHash(): string {
  const content = document.body.innerText || '';
  return simpleHash(content);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function extractPdfUrls(): string[] {
  const pdfLinks = extractPdfLinks();
  return pdfLinks.map(link => link.url);
}

function extractPdfLinks(): PdfLink[] {
  const pdfLinksMap = new Map<string, PdfLink>();
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = (link as HTMLAnchorElement).href;
    if (isPdfUrl(href)) {
      const absoluteUrl = new URL(href, window.location.href).href;
      if (!pdfLinksMap.has(absoluteUrl)) {
        const text = extractLinkText(link as HTMLAnchorElement);
        pdfLinksMap.set(absoluteUrl, { url: absoluteUrl, text });
      }
    }
  });
  
  const embeds = document.querySelectorAll('embed[src], object[data], iframe[src]');
  embeds.forEach(embed => {
    let src = '';
    if (embed instanceof HTMLEmbedElement) {
      src = embed.src;
    } else if (embed instanceof HTMLObjectElement) {
      src = embed.data;
    } else if (embed instanceof HTMLIFrameElement) {
      src = embed.src;
    }
    
    if (src && isPdfUrl(src)) {
      const absoluteUrl = new URL(src, window.location.href).href;
      if (!pdfLinksMap.has(absoluteUrl)) {
        const filename = getFilenameFromUrl(absoluteUrl);
        pdfLinksMap.set(absoluteUrl, { url: absoluteUrl, text: filename });
      }
    }
  });
  
  return Array.from(pdfLinksMap.values());
}

function extractLinkText(link: HTMLAnchorElement): string {
  // 直接のテキストノードのみを取得
  const textNodes: string[] = [];
  link.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const text = node.textContent.trim();
      if (text && !node.parentElement?.classList.contains('pdfsize')) {
        textNodes.push(text);
      }
    }
  });
  
  let text = textNodes.join(' ').trim();
  
  // テキストが空の場合はファイル名を使用
  if (!text) {
    text = getFilenameFromUrl(link.href);
  }
  
  // 特殊文字のエスケープ
  text = text.replace(/[\t\n\r]/g, ' ');
  
  // 文字数制限（100文字）
  if (text.length > 100) {
    text = text.substring(0, 97) + '...';
  }
  
  return text;
}

function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return decodeURIComponent(filename) || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}

function isPdfUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return pathname.endsWith('.pdf') || 
           urlObj.searchParams.toString().toLowerCase().includes('pdf');
  } catch {
    return false;
  }
}