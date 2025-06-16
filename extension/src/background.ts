import { Message } from './types';

chrome.runtime.onMessage.addListener((
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  if (message.action === 'copyToClipboard' && message.data) {
    copyToClipboard(message.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
  return false;
});

async function copyToClipboard(text: string): Promise<void> {
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD' as chrome.offscreen.Reason],
      justification: 'Copy TSV data to clipboard',
    });
    
    await chrome.runtime.sendMessage({
      action: 'copyText',
      text: text,
    });
    
    await chrome.offscreen.closeDocument();
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw error;
  }
}