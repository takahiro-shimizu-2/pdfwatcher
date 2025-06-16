import { CONSTANTS } from '@pdf-watcher/core';

export class DocumentLock {
  private lock: GoogleAppsScript.Lock.Lock | null = null;

  constructor(_spreadsheetId: string) {
    // spreadsheetId is kept for future use
  }

  async acquire(): Promise<void> {
    const documentProperties = PropertiesService.getDocumentProperties();
    if (!documentProperties) {
      throw new Error('Document properties not available');
    }

    this.lock = LockService.getDocumentLock();
    
    let retries = 0;
    while (retries < CONSTANTS.LOCK_RETRY_COUNT) {
      try {
        this.lock.waitLock(CONSTANTS.LOCK_TIMEOUT_MS);
        return;
      } catch (error) {
        retries++;
        if (retries >= CONSTANTS.LOCK_RETRY_COUNT) {
          throw new Error(`Failed to acquire lock after ${retries} retries: ${error}`);
        }
        Utilities.sleep(1000 * retries);
      }
    }
  }

  release(): void {
    if (this.lock) {
      try {
        this.lock.releaseLock();
      } catch (error) {
        console.error('Error releasing lock:', error);
      }
      this.lock = null;
    }
  }

  async executeWithLock<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }
}