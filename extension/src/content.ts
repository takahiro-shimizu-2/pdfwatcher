import { Message, ExtractResult } from './types';
import { extractPageInfo } from './utils/extractor';

console.log('PDF Watcher content script loaded');

chrome.runtime.onMessage.addListener((
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ExtractResult) => void
) => {
  console.log('Received message:', message);
  if (message.action === 'extractPageInfo') {
    try {
      const pageInfo = extractPageInfo();
      console.log('Extracted page info:', pageInfo);
      sendResponse({
        success: true,
        pageInfo,
      });
    } catch (error) {
      console.error('Error extracting page info:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return true;
});