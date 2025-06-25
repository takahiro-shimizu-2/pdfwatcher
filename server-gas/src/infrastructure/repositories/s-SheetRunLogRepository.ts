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
    
    // 同じexecIdの既存レコードを検索
    const lastRow = sheet.getLastRow();
    let existingRow = -1;
    
    if (lastRow > 1) {
      const execIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < execIds.length; i++) {
        if (execIds[i][0] === log.execId) {
          existingRow = i + 2; // 1-indexed, ヘッダー行を考慮
          break;
        }
      }
    }
    
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
    
    if (existingRow > 0) {
      // 既存レコードを更新（累積値を加算）
      const existingData = sheet.getRange(existingRow, 1, 1, 10).getValues()[0];
      row[4] = (row[4] as number) + (existingData[4] as number); // pagesProcessed
      row[5] = (row[5] as number) + (existingData[5] as number); // pagesUpdated
      row[6] = (row[6] as number) + (existingData[6] as number); // pdfsAdded
      row[3] = (row[3] as number) + (existingData[3] as number); // durationSeconds
      
      sheet.getRange(existingRow, 1, 1, 10).setValues([row]);
    } else {
      // 新規レコードとして追加
      sheet.appendRow(row);
    }
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
    try {
      let sheet = this.spreadsheet.getSheetByName(SHEET_NAMES.RUN_LOG);
      
      if (!sheet) {
        // シートが存在しない場合は作成
        console.log(`シート "${SHEET_NAMES.RUN_LOG}" が見つからないため、新規作成します`);
        sheet = this.spreadsheet.insertSheet(SHEET_NAMES.RUN_LOG);
        const headers = [
          'ExecID', 'Timestamp', 'User', 'Dur s', 'PagesProc',
          'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg', 'ScriptVer'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      }
      
      return sheet;
    } catch (error) {
      // エラーの詳細情報を記録
      console.error(`RunLogシートの取得/作成でエラーが発生しました:`, error);
      console.error(`スプレッドシートID: ${this.spreadsheet.getId()}`);
      console.error(`期待するシート名: ${SHEET_NAMES.RUN_LOG}`);
      
      // 全シート名を列挙してデバッグ
      const sheets = this.spreadsheet.getSheets();
      console.error(`現在のシート一覧: ${sheets.map(s => s.getName()).join(', ')}`);
      
      throw error;
    }
  }
}