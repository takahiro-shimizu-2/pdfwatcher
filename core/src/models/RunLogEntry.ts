export interface RunLogEntry {
  execId: string;
  timestamp: Date;
  user: string;
  durationSeconds: number;
  pagesProcessed: number;
  pagesUpdated: number;
  pdfsAdded: number;
  result: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  scriptVersion: string;
}