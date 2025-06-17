/**
 * 実行ログをスプレッドシートで管理するリポジトリ
 * バッチ処理の実行ログを記録・取得する
 */
class SheetRunLogRepository implements IRunLogRepository {
  constructor(
    private readonly spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {}

  async addRunLog(log: RunLogEntry): Promise<void> {
    const sheet = this.getOrCreateSheet();
    const row = [
      log.execId,
      log.timestamp,
      log.user,
      log.durationSeconds,
      log.pagesProcessed,
      log.pagesUpdated,
      log.pdfsAdded,
      log.result,
      log.errorMessage || '',
      log.scriptVersion,
    ];
    
    sheet.appendRow(row);
  }

  async getRunLogs(limit: number): Promise<RunLogEntry[]> {
    const sheet = this.getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) return [];
    
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const data = sheet.getRange(startRow, 1, numRows, 10).getValues();
    const logs: RunLogEntry[] = [];
    
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      logs.push({
        execId: row[0] as string,
        timestamp: new Date(row[1] as string),
        user: row[2] as string,
        durationSeconds: row[3] as number,
        pagesProcessed: row[4] as number,
        pagesUpdated: row[5] as number,
        pdfsAdded: row[6] as number,
        result: row[7] as 'SUCCESS' | 'ERROR',
        errorMessage: row[8] as string || undefined,
        scriptVersion: row[9] as string,
      });
    }
    
    return logs;
  }

  private getOrCreateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.RUN_LOG);
    
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(SHEET_NAMES.RUN_LOG);
      const headers = [
        'ExecID', 'Timestamp', 'User', 'Dur s', 'PagesProc',
        'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg', 'ScriptVer'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    return sheet;
  }
}