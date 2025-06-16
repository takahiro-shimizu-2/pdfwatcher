import { Message, ExtractResult } from './types';
import { extractPageInfo } from './utils/extractor';

chrome.runtime.onMessage.addListener((
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ExtractResult) => void
) => {
  if (message.action === 'extractPageInfo') {
    try {
      const pageInfo = extractPageInfo();
      sendResponse({
        success: true,
        pageInfo,
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return true;
});