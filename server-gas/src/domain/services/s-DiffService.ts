/**
 * 差分検出サービス
 * ページとPDFの変更を検出する
 */
class DiffService {
  private isRetry: boolean = false;
  
  constructor(
    private readonly archiveRepo: IArchiveRepository,
    private readonly summaryRepo: ISummaryRepository
  ) {}
  
  setRetryMode(isRetry: boolean): void {
    this.isRetry = isRetry;
  }

  async calculateDiff(currentPage: Page): Promise<DiffResult> {
    // 前回実行時のハッシュ値を取得
    const pageSummary = await this.summaryRepo.getPageSummary(currentPage.url);
    const lastPageHash = pageSummary?.lastHash;
    
    // 再実行モードでない場合のみ、ハッシュ値が同じなら変更なしとして早期リターン
    if (!this.isRetry && currentPage.hash && lastPageHash && currentPage.hash === lastPageHash) {
      return {
        pageUrl: currentPage.url,
        pageUpdated: false,
        pdfUpdated: false,
        addedPdfUrls: [],
        removedPdfUrls: [],
        addedCount: 0,
        pageHash: currentPage.hash,
      };
    }
    
    const existingPdfs = await this.archiveRepo.getPdfsByPage(currentPage.url);
    const existingPdfUrls = new Set(existingPdfs.map(pdf => pdf.pdfUrl));
    // pdfsから現在のPDF URLを取得
    const currentPdfUrls = new Set(currentPage.pdfs.map(pdf => pdf.url));
    
    const addedPdfUrls: string[] = [];
    const removedPdfUrls: string[] = [];
    
    for (const pdf of currentPage.pdfs) {
      if (!existingPdfUrls.has(pdf.url)) {
        addedPdfUrls.push(pdf.url);
      }
    }
    
    for (const url of existingPdfUrls) {
      if (!currentPdfUrls.has(url)) {
        removedPdfUrls.push(url);
      }
    }
    
    const pageUpdated = currentPage.hash !== '' && this.hasPageChanged(currentPage, existingPdfs);
    const pdfUpdated = addedPdfUrls.length > 0 || removedPdfUrls.length > 0;
    
    return {
      pageUrl: currentPage.url,
      pageUpdated,
      pdfUpdated,
      addedPdfUrls,
      removedPdfUrls,
      addedCount: addedPdfUrls.length,
      pageHash: currentPage.hash,
    };
  }

  async mergeDiffResults(results: DiffResult[]): Promise<{
    totalProcessed: number;
    totalUpdated: number;
    totalPdfsAdded: number;
  }> {
    let totalUpdated = 0;
    let totalPdfsAdded = 0;
    
    for (const result of results) {
      if (result.pageUpdated || result.pdfUpdated) {
        totalUpdated++;
      }
      totalPdfsAdded += result.addedCount;
    }
    
    return {
      totalProcessed: results.length,
      totalUpdated,
      totalPdfsAdded,
    };
  }

  private hasPageChanged(_currentPage: Page, _existingPdfs: PDF[]): boolean {
    // ハッシュ値による変更検知は既にcalculateDiffで行っているため、
    // ここでは常にtrueを返す（ハッシュが異なる場合のみここに到達する）
    return true;
  }
}