/**
 * 差分検出サービス
 * ページとPDFの変更を検出する
 */
class DiffService {
  constructor(private readonly archiveRepo: IArchiveRepository) {}

  async calculateDiff(currentPage: Page): Promise<DiffResult> {
    const existingPdfs = await this.archiveRepo.getPdfsByPage(currentPage.url);
    const existingPdfUrls = new Set(existingPdfs.map(pdf => pdf.pdfUrl));
    const currentPdfUrls = new Set(currentPage.pdfUrls);
    
    const addedPdfUrls: string[] = [];
    const removedPdfUrls: string[] = [];
    
    for (const url of currentPdfUrls) {
      if (!existingPdfUrls.has(url)) {
        addedPdfUrls.push(url);
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
    // TODO: Implement actual page change detection logic
    return true;
  }
}