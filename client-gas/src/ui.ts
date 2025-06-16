import { BatchResult, SHEET_NAMES, CONSTANTS } from '@pdf-watcher/core';
import { ChangeRow, UserLogEntry } from './types';
import { DiffResult } from '@pdf-watcher/core';

export function updateChangesSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  results: DiffResult[]
): void {
  sheet.clear();
  
  const headers = ['PageURL', 'AddedCnt', 'NewPDFs'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  
  const changes: ChangeRow[] = [];
  
  for (const result of results) {
    if (result.pdfUpdated && result.addedPdfUrls.length > 0) {
      changes.push({
        pageUrl: result.pageUrl,
        addedCount: result.addedCount,
        newPdfs: result.addedPdfUrls.join('\n'),
      });
    }
  }
  
  if (changes.length > 0) {
    const rows = changes.map(change => [
      change.pageUrl,
      change.addedCount,
      change.newPdfs,
    ]);
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

export function updateUserLog(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  batchResults: BatchResult[],
  totalDuration: number
): void {
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalPdfsAdded = 0;
  let hasError = false;
  let errorMessage = '';
  
  for (const result of batchResults) {
    totalProcessed += result.processedPages;
    totalUpdated += result.updatedPages;
    totalPdfsAdded += result.addedPdfs;
    
    if (result.errors.length > 0) {
      hasError = true;
      if (!errorMessage) {
        errorMessage = result.errors[0].message.substring(0, CONSTANTS.MAX_ERROR_MESSAGE_LENGTH);
      }
    }
  }
  
  const logEntry: UserLogEntry = {
    timestamp: new Date(),
    durationSeconds: totalDuration,
    pagesProcessed: totalProcessed,
    pagesUpdated: totalUpdated,
    pdfsAdded: totalPdfsAdded,
    result: hasError ? 'ERROR' : 'SUCCESS',
    errorMessage: errorMessage,
  };
  
  const row = [
    logEntry.timestamp,
    logEntry.durationSeconds,
    logEntry.pagesProcessed,
    logEntry.pagesUpdated,
    logEntry.pdfsAdded,
    logEntry.result,
    logEntry.errorMessage,
  ];
  
  sheet.appendRow(row);
}

export function clearCurrentSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  sheet.clear();
}

export function initializeSheets(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  const sheetNames = [
    SHEET_NAMES.CURRENT,
    SHEET_NAMES.CHANGES,
    SHEET_NAMES.SUMMARY,
    SHEET_NAMES.USER_LOG,
  ];
  
  for (const name of sheetNames) {
    if (!spreadsheet.getSheetByName(name)) {
      spreadsheet.insertSheet(name);
    }
  }
  
  const userLogSheet = spreadsheet.getSheetByName(SHEET_NAMES.USER_LOG);
  if (userLogSheet && userLogSheet.getLastRow() === 0) {
    const headers = ['Timestamp', 'Duration s', 'PagesProc', 'PagesUpd', 'PDFsAdd', 'Result', 'ErrorMsg'];
    userLogSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    userLogSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}