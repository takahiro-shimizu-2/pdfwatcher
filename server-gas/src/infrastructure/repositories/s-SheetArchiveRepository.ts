/**
 * PDFアーカイブのSheetリポジトリ実装
 */
class SheetArchiveRepository implements IArchiveRepository {
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
          status: (row[4] as string) === 'ページから削除' ? 'ページから削除' : 'ページ内に存在',
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
    
    const updates: { row: number; values: unknown[] }[] = [];
    const appends: unknown[][] = [];
    
    for (const pdf of pdfs) {
      const key = `${pdf.pageUrl}|${pdf.pdfUrl}`;
      const existingRow = existingMap.get(key);
      
      if (existingRow) {
        updates.push({
          row: existingRow,
          values: [pdf.pageUrl, pdf.pdfUrl, pdf.firstSeen, pdf.lastSeen, pdf.status],
        });
      } else {
        appends.push([pdf.pageUrl, pdf.pdfUrl, pdf.firstSeen, pdf.lastSeen, pdf.status]);
      }
    }
    
    for (const update of updates) {
      sheet.getRange(update.row, 1, 1, 5).setValues([update.values]);
    }
    
    if (appends.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, appends.length, 5).setValues(appends);
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
        status: (row[4] as string) === 'ページから削除' ? 'ページから削除' : 'ページ内に存在',
      });
    }
    
    return pdfs;
  }

  private getOrCreateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.ARCHIVE_PDF);
    
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(SHEET_NAMES.ARCHIVE_PDF);
      sheet.getRange(1, 1, 1, 5).setValues([
        ['ページURL', 'PDF URL', '初回発見日時', '最終確認日時', 'ステータス']
      ]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    return sheet;
  }
}