import { PageHistoryEntry } from '../models/PageHistoryEntry';

export interface IHistoryRepository {
  addPageHistory(entries: PageHistoryEntry[]): Promise<void>;
  getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]>;
}