// Default settings
const DEFAULT_SETTINGS = {
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

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
  // Mode selection
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', updateSettings);
  });

  // Speed controls
  const speedSlider = document.getElementById('speed');
  const speedValue = document.getElementById('speedValue');
  speedSlider.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
  });
  speedSlider.addEventListener('change', updateSettings);

  // Font size
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeValue = document.getElementById('fontSizeValue');
  fontSizeSlider.addEventListener('input', (e) => {
    fontSizeValue.textContent = e.target.value;
  });
  fontSizeSlider.addEventListener('change', updateSettings);

  // Word chunk
  const wordChunkSlider = document.getElementById('wordChunk');
  const wordChunkValue = document.getElementById('wordChunkValue');
  wordChunkSlider.addEventListener('input', (e) => {
    wordChunkValue.textContent = e.target.value;
  });
  wordChunkSlider.addEventListener('change', updateSettings);

  // Checkboxes
  document.getElementById('showProgress').addEventListener('change', updateSettings);
  document.getElementById('darkMode').addEventListener('change', updateSettings);
  document.getElementById('focusPoint').addEventListener('change', updateSettings);

  // Color pickers
  document.getElementById('bgColor').addEventListener('change', updateSettings);
  document.getElementById('textColor').addEventListener('change', updateSettings);
  document.getElementById('highlightColor').addEventListener('change', updateSettings);

  // Action buttons
  document.getElementById('startBtn').addEventListener('click', startReading);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('speedReadSettings');
    const settings = result.speedReadSettings || DEFAULT_SETTINGS;
    
    // Apply settings to UI
    document.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
    document.getElementById('speed').value = settings.speed;
    document.getElementById('speedValue').textContent = settings.speed;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('fontSizeValue').textContent = settings.fontSize;
    document.getElementById('wordChunk').value = settings.wordChunk;
    document.getElementById('wordChunkValue').textContent = settings.wordChunk;
    document.getElementById('showProgress').checked = settings.showProgress;
    document.getElementById('darkMode').checked = settings.darkMode;
    document.getElementById('focusPoint').checked = settings.focusPoint;
    document.getElementById('bgColor').value = settings.bgColor;
    document.getElementById('textColor').value = settings.textColor;
    document.getElementById('highlightColor').value = settings.highlightColor;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Get current settings from UI
function getCurrentSettings() {
  return {
    mode: document.querySelector('input[name="mode"]:checked').value,
    speed: parseInt(document.getElementById('speed').value),
    fontSize: parseInt(document.getElementById('fontSize').value),
    wordChunk: parseInt(document.getElementById('wordChunk').value),
    showProgress: document.getElementById('showProgress').checked,
    darkMode: document.getElementById('darkMode').checked,
    focusPoint: document.getElementById('focusPoint').checked,
    bgColor: document.getElementById('bgColor').value,
    textColor: document.getElementById('textColor').value,
    highlightColor: document.getElementById('highlightColor').value
  };
}

// Update settings in storage
async function updateSettings() {
  const settings = getCurrentSettings();
  try {
    await chrome.storage.sync.set({ speedReadSettings: settings });
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

// Save settings with confirmation
async function saveSettings() {
  await updateSettings();
  
  const btn = document.getElementById('saveSettings');
  const originalText = btn.textContent;
  btn.textContent = '✓ Saved!';
  btn.style.background = '#4caf50';
  btn.style.color = 'white';
  btn.style.borderColor = '#4caf50';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  }, 2000);
}

// Reset to default settings
async function resetSettings() {
  try {
    await chrome.storage.sync.set({ speedReadSettings: DEFAULT_SETTINGS });
    await loadSettings();
    
    const btn = document.getElementById('resetSettings');
    const originalText = btn.textContent;
    btn.textContent = '✓ Reset!';
    
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}

// Start reading with current settings
async function startReading() {
  const settings = getCurrentSettings();
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    console.log('Sending start reading message to tab:', tab.id);
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'startReading',
      settings: settings
    });
    
    console.log('Response from content script:', response);
    
    if (response && !response.success) {
      throw new Error(response.error || 'Failed to start reading');
    }
    
    // Close popup
    window.close();
  } catch (error) {
    console.error('Error starting reading:', error);
    
    // More helpful error messages
    let errorMessage = 'Error starting speed reader.\n\n';
    
    if (error.message && error.message.includes('Could not establish connection')) {
      errorMessage += '⚠️ Please REFRESH the page (F5) and try again.\n\nThe extension needs to reload on the page after being installed or updated.';
    } else if (error.message && error.message.includes('Receiving end does not exist')) {
      errorMessage += '⚠️ Please REFRESH the page (F5) and try again.\n\nThe extension needs to reload on the page after being installed or updated.';
    } else if (error.message && error.message.includes('Cannot access')) {
      errorMessage += 'This extension cannot run on browser pages like chrome://, edge://, or extension pages.';
    } else {
      errorMessage += error.message || 'Please make sure you\'re on a valid webpage.';
    }
    
    alert(errorMessage);
  }
}
