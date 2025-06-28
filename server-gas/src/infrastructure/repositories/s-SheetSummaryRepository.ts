/**
 * ページサマリをスプレッドシートで管理するリポジトリ
 * 各ページの直近7世代分の実行結果を保持する
 */
class SheetSummaryRepository implements ISummaryRepository {
  // 列インデックスの定義
  private static readonly COLUMN_INDICES = {
    PAGE_URL: 0,
    LAST_HASH: 1,
    RUN1_START: 2,   // C-F列: run1 (Date, PageUpdated, PDFUpdated, AddedCount)
    RUN2_START: 6,   // G-J列: run2
    RUN3_START: 10,  // K-N列: run3
    RUN4_START: 14,  // O-R列: run4
    RUN5_START: 18,  // S-V列: run5
    RUN6_START: 22,  // W-Z列: run6
    RUN7_START: 26,  // AA-AD列: run7
    TOTAL_COLUMNS: 30
  };
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
        pageUrl, result.pageHash || '',
        // run1 (C-F)
        newRun.date, newRun.pageUpdated, newRun.pdfUpdated, newRun.addedCount,
        // run2-run7 (G-AD) - 空データ
        '', '', '', '',  // run2
        '', '', '', '',  // run3
        '', '', '', '',  // run4
        '', '', '', '',  // run5
        '', '', '', '',  // run6
        '', '', '', ''   // run7
      ];
      sheet.appendRow(newRow);
    } else {
      const existingRow = sheet.getRange(rowIndex, 1, 1, SheetSummaryRepository.COLUMN_INDICES.TOTAL_COLUMNS).getValues()[0];
      
      const updatedRow = [
        pageUrl, result.pageHash || '',
        // run1 (新しい実行結果)
        newRun.date, newRun.pageUpdated, newRun.pdfUpdated, newRun.addedCount,
        // run2 (既存のrun1をシフト)
        existingRow[2], existingRow[3], existingRow[4], existingRow[5],
        // run3 (既存のrun2をシフト)
        existingRow[6], existingRow[7], existingRow[8], existingRow[9],
        // run4 (既存のrun3をシフト)
        existingRow[10], existingRow[11], existingRow[12], existingRow[13],
        // run5 (既存のrun4をシフト)
        existingRow[14], existingRow[15], existingRow[16], existingRow[17],
        // run6 (既存のrun5をシフト)
        existingRow[18], existingRow[19], existingRow[20], existingRow[21],
        // run7 (既存のrun6をシフト)
        existingRow[22], existingRow[23], existingRow[24], existingRow[25]
      ];
      
      sheet.getRange(rowIndex, 1, 1, SheetSummaryRepository.COLUMN_INDICES.TOTAL_COLUMNS).setValues([updatedRow]);
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
          lastHash: row[1] as string || undefined,
        };
        
        // run1からrun7までのデータを読み取る
        const runStarts = [
          SheetSummaryRepository.COLUMN_INDICES.RUN1_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN2_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN3_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN4_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN5_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN6_START,
          SheetSummaryRepository.COLUMN_INDICES.RUN7_START,
        ];
        
        const runProperties = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7'] as const;
        
        runStarts.forEach((startIdx, runIdx) => {
          if (row[startIdx]) {
            const runSummary: RunSummary = {
              date: new Date(row[startIdx] as string),
              pageUpdated: row[startIdx + 1] as boolean,
              pdfUpdated: row[startIdx + 2] as boolean,
              addedCount: row[startIdx + 3] as number,
            };
            
            // Type-safe assignment
            switch (runIdx) {
              case 0: summary.run1 = runSummary; break;
              case 1: summary.run2 = runSummary; break;
              case 2: summary.run3 = runSummary; break;
              case 3: summary.run4 = runSummary; break;
              case 4: summary.run5 = runSummary; break;
              case 5: summary.run6 = runSummary; break;
              case 6: summary.run7 = runSummary; break;
            }
          }
        });
        
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
        'ページURL', '最新ハッシュ',
        '実行1-日時', '実行1-ページ', '実行1-PDF', '実行1-追加数',
        '実行2-日時', '実行2-ページ', '実行2-PDF', '実行2-追加数',
        '実行3-日時', '実行3-ページ', '実行3-PDF', '実行3-追加数',
        '実行4-日時', '実行4-ページ', '実行4-PDF', '実行4-追加数',
        '実行5-日時', '実行5-ページ', '実行5-PDF', '実行5-追加数',
        '実行6-日時', '実行6-ページ', '実行6-PDF', '実行6-追加数',
        '実行7-日時', '実行7-ページ', '実行7-PDF', '実行7-追加数'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    } else {
      // 既存シートの移行チェック
      this.initializeSheet(sheet);
    }
    
    return sheet;
  }

  /**
   * 既存の3世代形式のデータを検出する
   * @param sheet スプレッドシート
   * @returns 3世代形式のデータが存在する場合true
   */
  private hasLegacyFormat(sheet: GoogleAppsScript.Spreadsheet.Sheet): boolean {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    // 旧形式は14列、新形式は30列
    return sheet.getLastColumn() === 14 && (headers[0] === 'PageURL' || headers[0] === 'ページURL');
  }

  /**
   * 3世代形式から7世代形式へのデータ移行
   * @param sheet スプレッドシート
   */
  private migrateToSevenGenerations(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    console.log('PageSummaryシートのデータ移行を開始します: 3世代 → 7世代');
    
    try {
      const dataRange = sheet.getDataRange();
      const data = dataRange.getValues();
      
      if (data.length <= 1) {
        console.log('移行するデータがありません');
        return;
      }
      
      // 新しいヘッダーを設定
      const newHeaders = [
        'ページURL', '最新ハッシュ',
        '実行1-日時', '実行1-ページ', '実行1-PDF', '実行1-追加数',
        '実行2-日時', '実行2-ページ', '実行2-PDF', '実行2-追加数',
        '実行3-日時', '実行3-ページ', '実行3-PDF', '実行3-追加数',
        '実行4-日時', '実行4-ページ', '実行4-PDF', '実行4-追加数',
        '実行5-日時', '実行5-ページ', '実行5-PDF', '実行5-追加数',
        '実行6-日時', '実行6-ページ', '実行6-PDF', '実行6-追加数',
        '実行7-日時', '実行7-ページ', '実行7-PDF', '実行7-追加数'
      ];
      
      // 新しいデータ配列を作成
      const newData = [newHeaders];
      
      // 既存データを新形式に変換
      for (let i = 1; i < data.length; i++) {
        const oldRow = data[i];
        const newRow = new Array(30).fill('');
        
        // PageURLとLastHash
        newRow[0] = oldRow[0];  // PageURL
        newRow[1] = oldRow[1];  // LastHash
        
        // run1-3のデータをコピー
        for (let j = 2; j < 14 && j < oldRow.length; j++) {
          newRow[j] = oldRow[j];
        }
        
        // run4-7は空のまま
        
        newData.push(newRow);
      }
      
      // シートをクリアして新しいデータを書き込む
      sheet.clear();
      sheet.getRange(1, 1, newData.length, 30).setValues(newData);
      sheet.getRange(1, 1, 1, 30).setFontWeight('bold');
      
      console.log(`${data.length - 1}件のデータを7世代形式に移行しました`);
      
    } catch (error) {
      console.error('データ移行中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * シートの初期化と移行チェック
   */
  private initializeSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // 既存データの移行チェック
    if (this.hasLegacyFormat(sheet)) {
      this.migrateToSevenGenerations(sheet);
    }
  }
}