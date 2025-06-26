export interface RunSummary {
  date: Date;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
}

/**
 * PageSummaryインターフェース
 * 各ページURLの実行履歴を7世代まで保持する
 */
export interface PageSummary {
  pageUrl: string;
  lastHash?: string;
  run1?: RunSummary;  // 最新の実行結果
  run2?: RunSummary;  // 1つ前の実行結果
  run3?: RunSummary;  // 2つ前の実行結果
  run4?: RunSummary;  // 3つ前の実行結果
  run5?: RunSummary;  // 4つ前の実行結果
  run6?: RunSummary;  // 5つ前の実行結果
  run7?: RunSummary;  // 6つ前の実行結果（最古）
}