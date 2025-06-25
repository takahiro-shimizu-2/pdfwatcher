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
          deletedAt: row[3] ? new Date(row[3] as string) : null,
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
    const existingMap = new Map<string, { row: number; data: unknown[] }>();
    
    for (let i = 1; i < existingData.length; i++) {
      const key = `${existingData[i][0]}|${existingData[i][1]}`;
      existingMap.set(key, { row: i + 1, data: existingData[i] });
    }
    
    const updates: { row: number; values: unknown[] }[] = [];
    const appends: unknown[][] = [];
    
    for (const pdf of pdfs) {
      const key = `${pdf.pageUrl}|${pdf.pdfUrl}`;
      const existing = existingMap.get(key);
      
      if (existing) {
        // 既存レコードの場合
        const existingFirstSeen = existing.data[2]; // 既存のfirstSeenを保持
        const existingDeletedAt = existing.data[3]; // 既存のdeletedAt
        const existingStatus = existing.data[4];    // 既存のstatus
        
        // deletedAtは「ページから削除」への変更時のみ更新
        let newDeletedAt = existingDeletedAt;
        if (existingStatus !== 'ページから削除' && pdf.status === 'ページから削除') {
          // 削除された時点で現在時刻を記録
          newDeletedAt = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
        } else if (pdf.status === 'ページ内に存在') {
          // 再追加された場合はnullに戻す
          newDeletedAt = '';
        }
        
        updates.push({
          row: existing.row,
          values: [
            pdf.pageUrl, 
            pdf.pdfUrl, 
            existingFirstSeen, // 既存のfirstSeenを保持
            newDeletedAt,      // 削除確認日
            pdf.status
          ],
        });
      } else {
        // 新規追加時はdeletedAtは空
        appends.push([pdf.pageUrl, pdf.pdfUrl, pdf.firstSeen, '', pdf.status]);
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
        deletedAt: row[3] ? new Date(row[3] as string) : null,
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
        ['ページURL', 'PDF URL', '初回発見日時', '削除確認日時', 'ステータス']
      ]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    return sheet;
  }
}