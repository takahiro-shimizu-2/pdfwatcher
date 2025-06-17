/**
 * ページサマリをスプレッドシートで管理するリポジトリ
 * 各ページの直近3回分の実行結果を保持する
 */
class SheetSummaryRepository implements ISummaryRepository {
  constructor(
    private readonly spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {}

  async updatePageSummary(pageUrl: string, result: DiffResult): Promise<void> {
    const sheet = this.getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === pageUrl) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const newRun = {
      date: new Date(),
      pageUpdated: result.pageUpdated,
      pdfUpdated: result.pdfUpdated,
      addedCount: result.addedCount,
    };
    
    if (rowIndex === -1) {
      const newRow = [
        pageUrl,
        newRun.date, newRun.pageUpdated, newRun.pdfUpdated, newRun.addedCount,
        '', '', '', '',
        '', '', '', ''
      ];
      sheet.appendRow(newRow);
    } else {
      const existingRow = sheet.getRange(rowIndex, 1, 1, 13).getValues()[0];
      
      const updatedRow = [
        pageUrl,
        newRun.date, newRun.pageUpdated, newRun.pdfUpdated, newRun.addedCount,
        existingRow[1], existingRow[2], existingRow[3], existingRow[4],
        existingRow[5], existingRow[6], existingRow[7], existingRow[8]
      ];
      
      sheet.getRange(rowIndex, 1, 1, 13).setValues([updatedRow]);
    }
  }

  async getPageSummary(pageUrl: string): Promise<PageSummary | null> {
    const sheet = this.getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === pageUrl) {
        const row = data[i];
        const summary: PageSummary = {
          pageUrl: row[0] as string,
        };
        
        if (row[1]) {
          summary.run1 = {
            date: new Date(row[1] as string),
            pageUpdated: row[2] as boolean,
            pdfUpdated: row[3] as boolean,
            addedCount: row[4] as number,
          };
        }
        
        if (row[5]) {
          summary.run2 = {
            date: new Date(row[5] as string),
            pageUpdated: row[6] as boolean,
            pdfUpdated: row[7] as boolean,
            addedCount: row[8] as number,
          };
        }
        
        if (row[9]) {
          summary.run3 = {
            date: new Date(row[9] as string),
            pageUpdated: row[10] as boolean,
            pdfUpdated: row[11] as boolean,
            addedCount: row[12] as number,
          };
        }
        
        return summary;
      }
    }
    
    return null;
  }

  private getOrCreateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.PAGE_SUMMARY);
    
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(SHEET_NAMES.PAGE_SUMMARY);
      const headers = [
        'PageURL',
        'Run-1 Date', 'Run-1 PU', 'Run-1 PFU', 'Run-1 Cnt',
        'Run-2 Date', 'Run-2 PU', 'Run-2 PFU', 'Run-2 Cnt',
        'Run-3 Date', 'Run-3 PU', 'Run-3 PFU', 'Run-3 Cnt'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    return sheet;
  }
}