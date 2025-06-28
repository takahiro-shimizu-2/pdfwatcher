import { PageSummary } from '../models/PageSummary';
import { DiffResult } from '../models/DiffResult';

/**
 * Summary情報のリポジトリインターフェース
 * PageSummaryの永続化を担当する
 */
export interface ISummaryRepository {
  /**
   * ページの実行結果を更新する
   * 7世代の履歴管理を行い、最新の結果をrun1に、既存のデータを順次シフトする
   * @param pageUrl 対象ページのURL
   * @param result 実行結果
   */
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  
  /**
   * 指定されたページのSummary情報を取得する
   * @param pageUrl 対象ページのURL
   * @returns PageSummary情報、存在しない場合はnull
   */
  getPageSummary(pageUrl: string): Promise<PageSummary | null>;
}