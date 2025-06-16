import { RunLogEntry } from '../models/RunLogEntry';

export interface IRunLogRepository {
  addRunLog(log: RunLogEntry): Promise<void>;
  getRunLogs(limit: number): Promise<RunLogEntry[]>;
}