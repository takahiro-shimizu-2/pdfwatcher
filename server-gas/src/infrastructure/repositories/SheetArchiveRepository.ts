import { IArchiveRepository, PDF, SHEET_NAMES } from '@pdf-watcher/core';

export class SheetArchiveRepository implements IArchiveRepository {
  constructor(
    private readonly spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {}

  async getPdfsByPage(pageUrl: string): Promise<PDF[]> {
    const sheet = this.getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const pdfs: PDF[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === pageUrl) {
        pdfs.push({
          pageUrl: row[0] as string,
          pdfUrl: row[1] as string,
          firstSeen: new Date(row[2] as string),
          lastSeen: new Date(row[3] as string),
        });
      }
    }
    
    return pdfs;
  }

  async upsertPdfs(pdfs: PDF[]): Promise<void> {
    if (pdfs.length === 0) return;
    
    const sheet = this.getOrCreateSheet();
    const existingData = sheet.getDataRange().getValues();
    const existingMap = new Map<string, number>();
    
    for (let i = 1; i < existingData.length; i++) {
      const key = `${existingData[i][0]}|${existingData[i][1]}`;
      existingMap.set(key, i + 1);
    }
    
    const updates: { row: number; values: any[] }[] = [];
    const appends: any[][] = [];
    
    for (const pdf of pdfs) {
      const key = `${pdf.pageUrl}|${pdf.pdfUrl}`;
      const existingRow = existingMap.get(key);
      
      if (existingRow) {
        updates.push({
          row: existingRow,
          values: [pdf.pageUrl, pdf.pdfUrl, pdf.firstSeen, pdf.lastSeen],
        });
      } else {
        appends.push([pdf.pageUrl, pdf.pdfUrl, pdf.firstSeen, pdf.lastSeen]);
      }
    }
    
    for (const update of updates) {
      sheet.getRange(update.row, 1, 1, 4).setValues([update.values]);
    }
    
    if (appends.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, appends.length, 4).setValues(appends);
    }
  }

  async getAllPdfs(): Promise<PDF[]> {
    const sheet = this.getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const pdfs: PDF[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      pdfs.push({
        pageUrl: row[0] as string,
        pdfUrl: row[1] as string,
        firstSeen: new Date(row[2] as string),
        lastSeen: new Date(row[3] as string),
      });
    }
    
    return pdfs;
  }

  private getOrCreateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.ARCHIVE_PDF);
    
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(SHEET_NAMES.ARCHIVE_PDF);
      sheet.getRange(1, 1, 1, 4).setValues([
        ['PageURL', 'PDFURL', 'FirstSeen', 'LastSeen']
      ]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    return sheet;
  }
}