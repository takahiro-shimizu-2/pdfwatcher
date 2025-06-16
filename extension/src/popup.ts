import { PageInfo, ExtractResult } from './types';
import { formatAsTsv } from './utils/formatter';

document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  
  extractBtn.addEventListener('click', async () => {
    try {
      statusDiv.textContent = 'Extracting...';
      statusDiv.className = 'status';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractPageInfo' }) as ExtractResult;
      
      if (!response.success || !response.pageInfo) {
        throw new Error(response.error || 'Failed to extract page info');
      }
      
      const tsv = formatAsTsv(response.pageInfo);
      
      await navigator.clipboard.writeText(tsv);
      
      statusDiv.textContent = 'Copied to clipboard!';
      statusDiv.className = 'status success';
      
      displayResult(response.pageInfo);
      
    } catch (error) {
      statusDiv.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      statusDiv.className = 'status error';
    }
  });
});

function displayResult(pageInfo: PageInfo): void {
  const resultDiv = document.getElementById('result') as HTMLDivElement;
  
  resultDiv.innerHTML = `
    <h3>Extracted Information:</h3>
    <p><strong>URL:</strong> ${escapeHtml(pageInfo.url)}</p>
    <p><strong>Hash:</strong> ${escapeHtml(pageInfo.hash)}</p>
    <p><strong>PDF URLs (${pageInfo.pdfUrls.length}):</strong></p>
    <ul>
      ${pageInfo.pdfUrls.map(url => `<li>${escapeHtml(url)}</li>`).join('')}
    </ul>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}