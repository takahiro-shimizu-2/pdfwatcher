import { PageSummary } from '../models/PageSummary';
import { DiffResult } from '../models/DiffResult';

export interface ISummaryRepository {
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  getPageSummary(pageUrl: string): Promise<PageSummary | null>;
}