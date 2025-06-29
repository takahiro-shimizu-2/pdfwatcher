import { PageInfo, ExtractResult } from './types';
import { formatAsTsv } from './utils/formatter';

document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;
  
  extractBtn.addEventListener('click', async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('Extract button clicked');
      statusDiv.textContent = 'Extracting...';
      statusDiv.className = 'status';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // eslint-disable-next-line no-console
      console.log('Active tab:', tab);
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }
      
      // Try to inject content script first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['dist/content.js']
        });
        // eslint-disable-next-line no-console
        console.log('Content script injected');
      } catch (injectionError) {
        // eslint-disable-next-line no-console
        console.log('Content script might already be injected:', injectionError);
      }
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // eslint-disable-next-line no-console
      console.log('Sending message to tab:', tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractPageInfo' }) as ExtractResult;
      // eslint-disable-next-line no-console
      console.log('Received response:', response);
      
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
    <p><strong>PDF Links (${pageInfo.pdfLinks.length}):</strong></p>
    <ul>
      ${pageInfo.pdfLinks.map(pdfLink => 
        `<li>
          <strong>${escapeHtml(pdfLink.subject)}</strong><br>
          ${escapeHtml(pdfLink.url)}
        </li>`
      ).join('')}
    </ul>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}