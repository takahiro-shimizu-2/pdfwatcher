import { PageInfo } from '../types';

export function extractPageInfo(): PageInfo {
  const url = window.location.href;
  const hash = generatePageHash();
  const pdfUrls = extractPdfUrls();
  
  return {
    url,
    hash,
    pdfUrls,
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
  const pdfUrls: string[] = [];
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = (link as HTMLAnchorElement).href;
    if (isPdfUrl(href)) {
      const absoluteUrl = new URL(href, window.location.href).href;
      if (!pdfUrls.includes(absoluteUrl)) {
        pdfUrls.push(absoluteUrl);
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
      if (!pdfUrls.includes(absoluteUrl)) {
        pdfUrls.push(absoluteUrl);
      }
    }
  });
  
  return pdfUrls;
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