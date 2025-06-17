/**
 * ページ履歴をスプレッドシートで管理するリポジトリ
 * PDFの更新履歴を記録・取得する
 */
class SheetHistoryRepository implements IHistoryRepository {
  constructor(
    private readonly spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {}

  async addPageHistory(entries: PageHistoryEntry[]): Promise<void> {
    if (entries.length === 0) return;
    
    const sheet = this.getOrCreateSheet();
    const rows = entries.map(entry => [
      entry.runDate,
      entry.pageUrl,
      entry.pageUpdated,
      entry.pdfUpdated,
      entry.addedCount,
      entry.user,
    ]);
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 6).setValues(rows);
  }

  async getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]> {
    const sheet = this.getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const history: PageHistoryEntry[] = [];
    
    for (let i = data.length - 1; i >= 1 && history.length < limit; i--) {
      const row = data[i];
      if (row[1] === pageUrl) {
        history.push({
          runDate: new Date(row[0] as string),
          pageUrl: row[1] as string,
          pageUpdated: row[2] as boolean,
          pdfUpdated: row[3] as boolean,
          addedCount: row[4] as number,
          user: row[5] as string,
        });
      }
    }
    
    return history;
  }

  private getOrCreateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.PAGE_HISTORY);
    
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(SHEET_NAMES.PAGE_HISTORY);
      sheet.getRange(1, 1, 1, 6).setValues([
        ['RunDate', 'PageURL', 'PageUpd?', 'PDFUpd?', 'AddedCnt', 'User']
      ]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }
    
    return sheet;
  }
}