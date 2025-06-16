import { ParsedRow } from './types';
import { Page } from '@pdf-watcher/core';

export function parseCurrentSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): ParsedRow[] {
  const data = sheet.getDataRange().getValues();
  const parsedRows: ParsedRow[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const pageUrl = String(row[0]).trim();
    const pageHash = String(row[1] || '').trim();
    const pdfUrls: string[] = [];
    
    for (let j = 2; j < row.length; j++) {
      const pdfUrl = String(row[j] || '').trim();
      if (pdfUrl) {
        pdfUrls.push(pdfUrl);
      }
    }
    
    parsedRows.push({ pageUrl, pageHash, pdfUrls });
  }
  
  return parsedRows;
}

export function convertToPages(parsedRows: ParsedRow[]): Page[] {
  return parsedRows.map(row => ({
    url: row.pageUrl,
    hash: row.pageHash,
    pdfUrls: row.pdfUrls,
  }));
}