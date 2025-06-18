import { DiffResult } from './DiffResult';

export interface BatchResult {
  execId: string;
  processedPages: number;
  updatedPages: number;
  addedPdfs: number;
  duration: number;
  errors: Error[];
  diffResults?: DiffResult[];
}