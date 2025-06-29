/**
 * パーサー関数（グローバル関数として定義）
 */

function parseCurrentSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): ParsedRow[] {
  const data = sheet.getDataRange().getValues();
  const parsedRowsMap = new Map<string, ParsedRow>();
  
  // 新形式: 4列固定（ページURL、ハッシュ、テキスト、PDF URL）
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const pageUrl = String(row[0]).trim();
    const pageHash = String(row[1] || '').trim();
    const text = String(row[2] || '').trim();
    const pdfUrl = String(row[3] || '').trim();
    
    const key = `${pageUrl}\t${pageHash}`;
    
    if (!parsedRowsMap.has(key)) {
      parsedRowsMap.set(key, {
        pageUrl,
        pageHash,
        pdfUrls: [],
        pdfs: []
      });
    }
    
    const parsedRow = parsedRowsMap.get(key)!;
    
    if (pdfUrl) {
      parsedRow.pdfUrls.push(pdfUrl);
      parsedRow.pdfs.push({ url: pdfUrl, text });
    }
  }
  
  return Array.from(parsedRowsMap.values());
}

function convertToPages(parsedRows: ParsedRow[]): Page[] {
  return parsedRows.map(row => ({
    url: row.pageUrl,
    hash: row.pageHash,
    pdfUrls: row.pdfUrls,
    pdfs: row.pdfs,
  }));
}