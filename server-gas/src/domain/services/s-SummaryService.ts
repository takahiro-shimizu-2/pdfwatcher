/**
 * サマリーサービス
 * ページサマリーと履歴の更新を管理する
 */
class SummaryService {
  constructor(
    private readonly summaryRepo: ISummaryRepository,
    private readonly historyRepo: IHistoryRepository
  ) {}

  async updateSummary(
    result: DiffResult,
    user: string
  ): Promise<void> {
    await this.summaryRepo.updatePageSummary(result.pageUrl, result);
    
    const historyEntry: PageHistoryEntry = {
      runDate: new Date(),
      pageUrl: result.pageUrl,
      pageUpdated: result.pageUpdated,
      pdfUpdated: result.pdfUpdated,
      addedCount: result.addedCount,
      user,
    };
    
    await this.historyRepo.addPageHistory([historyEntry]);
  }

  async updateBatchSummaries(
    results: DiffResult[],
    user: string
  ): Promise<void> {
    const historyEntries: PageHistoryEntry[] = [];
    const runDate = new Date();
    
    for (const result of results) {
      await this.summaryRepo.updatePageSummary(result.pageUrl, result);
      
      historyEntries.push({
        runDate,
        pageUrl: result.pageUrl,
        pageUpdated: result.pageUpdated,
        pdfUpdated: result.pdfUpdated,
        addedCount: result.addedCount,
        user,
      });
    }
    
    if (historyEntries.length > 0) {
      await this.historyRepo.addPageHistory(historyEntries);
    }
  }
}