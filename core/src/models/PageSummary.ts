export interface RunSummary {
  date: Date;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedCount: number;
}

export interface PageSummary {
  pageUrl: string;
  lastHash?: string;
  run1?: RunSummary;
  run2?: RunSummary;
  run3?: RunSummary;
}