import { SHEET_NAMES, DiffResult } from '@pdf-watcher/core';
import { CLIENT_CONFIG } from './config';
import { parseCurrentSheet, convertToPages } from './parser';
import { splitIntoBatches, executeBatchesInParallel } from './batch';
import { updateChangesSheet, updateUserLog, clearCurrentSheet, initializeSheets } from './ui';
import { ServerLibrary } from './types';

declare const PDFWatcherServerLib: ServerLibrary;

export async function runJudge(): Promise<void> {
  const startTime = Date.now();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const user = Session.getActiveUser().getEmail();
  
  try {
    initializeSheets(spreadsheet);
    
    const currentSheet = spreadsheet.getSheetByName(SHEET_NAMES.CURRENT);
    if (!currentSheet) {
      throw new Error('Current sheet not found');
    }
    
    const parsedRows = parseCurrentSheet(currentSheet);
    if (parsedRows.length === 0) {
      SpreadsheetApp.getUi().alert('No data found in Current sheet');
      return;
    }
    
    const pages = convertToPages(parsedRows);
    const pageBatches = splitIntoBatches(pages, CLIENT_CONFIG.BATCH_SIZE);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Processing ${pages.length} pages in ${pageBatches.length} batches...`,
      'PDF Watcher',
      5
    );
    
    const serverLib = getServerLibrary();
    const batchResults = await executeBatchesInParallel(
      pageBatches,
      user,
      serverLib
    );
    
    const allDiffResults: DiffResult[] = [];
    
    const changesSheet = spreadsheet.getSheetByName(SHEET_NAMES.CHANGES);
    if (changesSheet) {
      updateChangesSheet(changesSheet, allDiffResults);
    }
    
    const userLogSheet = spreadsheet.getSheetByName(SHEET_NAMES.USER_LOG);
    if (userLogSheet) {
      const totalDuration = (Date.now() - startTime) / 1000;
      updateUserLog(userLogSheet, batchResults, totalDuration);
    }
    
    clearCurrentSheet(currentSheet);
    
    const totalUpdated = batchResults.reduce((sum, r) => sum + r.updatedPages, 0);
    const totalPdfsAdded = batchResults.reduce((sum, r) => sum + r.addedPdfs, 0);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Completed: ${totalUpdated} pages updated, ${totalPdfsAdded} PDFs added`,
      'PDF Watcher',
      5
    );
    
  } catch (error) {
    console.error('Error in runJudge:', error);
    SpreadsheetApp.getUi().alert(`Error: ${error}`);
    
    const userLogSheet = spreadsheet.getSheetByName(SHEET_NAMES.USER_LOG);
    if (userLogSheet) {
      const totalDuration = (Date.now() - startTime) / 1000;
      updateUserLog(userLogSheet, [], totalDuration);
    }
  }
}

function getServerLibrary(): ServerLibrary {
  try {
    return PDFWatcherServerLib;
  } catch (error) {
    throw new Error(
      'Server library not found. Please add the PDF Watcher Server Library to this project.'
    );
  }
}

// Export functions for Google Apps Script
(globalThis as Record<string, unknown>).onOpen = function(): void {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Watcher')
    .addItem('Run Judge', 'runJudge')
    .addToUi();
};

(globalThis as Record<string, unknown>).runJudge = runJudge;