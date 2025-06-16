import { PDF } from '../models/PDF';

export interface IArchiveRepository {
  getPdfsByPage(pageUrl: string): Promise<PDF[]>;
  upsertPdfs(pdfs: PDF[]): Promise<void>;
  getAllPdfs(): Promise<PDF[]>;
}