export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: Error;
};

export type SheetData = (string | number | boolean | Date)[][];

export type ConfigType = 'sheet' | 'drive' | 'bq';