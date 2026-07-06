// SpeedRead Background Service Worker

// Initialize default settings and context menus on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('SpeedRead Pro installed!');
  
  // Set default settings if not already set
  chrome.storage.sync.get('speedReadSettings', (result) => {
    if (!result.speedReadSettings) {
      const defaultSettings = {
        mode: 'rsvp',
        speed: 300,
        fontSize: 24,
        wordChunk: 1,
        showProgress: true,
        darkMode: false,
        focusPoint: true,
        bgColor: '#ffffff',
        textColor: '#000000',
        highlightColor: '#ffeb3b'
      };
      
      chrome.storage.sync.set({ speedReadSettings: defaultSettings });
    }
  });
  
  // Create context menu items
  try {
    chrome.contextMenus.create({
      id: 'speedread-selection',
      title: 'Speed Read Selected Text',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'speedread-page',
      title: 'Speed Read This Page',
      contexts: ['page']
    });
  } catch (error) {
    console.log('Context menus not available:', error);
  }
});

// Handle keyboard shortcuts (optional - can be added to manifest)
if (chrome.commands) {
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'start-reading') {
      // Get active tab and send start message
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
          const settings = await chrome.storage.sync.get('speedReadSettings');
          
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'startReading',
            settings: settings.speedReadSettings
          });
        }
      });
    }
  });
}

// Handle context menu clicks
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'speedread-selection' || info.menuItemId === 'speedread-page') {
      const result = await chrome.storage.sync.get('speedReadSettings');
      
      chrome.tabs.sendMessage(tab.id, {
        action: 'startReading',
        settings: result.speedReadSettings
      });
    }
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get('speedReadSettings', (result) => {
      sendResponse({ settings: result.speedReadSettings });
    });
    return true; // Required for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ speedReadSettings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Analytics/tracking (optional - can track usage)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackEvent') {
    console.log('Event tracked:', request.event, request.data);
    // Could implement analytics here
  }
});
