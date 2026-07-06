// SpeedRead Content Script
class SpeedReader {
  constructor() {
    this.isActive = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.words = [];
    this.settings = null;
    this.intervalId = null;
    this.container = null;
    this.selectedText = '';
    this.pageUrl = window.location.href;
    this.progressFillElement = null; // Cache progress bar elements
    this.progressTextElement = null;
    this.isDragging = false; // Track drag state
    this.draggedElement = null; // Track dragged element
    this.dropTarget = null; // Track potential drop target
    this.autoScrollInterval = null; // Auto-scroll during drag
    this.lastDragY = 0; // Last Y position during drag
    this.userScrolling = false; // Track if user is manually scrolling
    this.lastScrollTime = 0; // Last time user scrolled
    this.scrollTimeout = null; // Timeout for scroll detection
    this.wheelHandler = null; // Wheel event handler
    this.dragMoveHandler = null; // Drag move handler
  }

  // Initialize reader with settings
  async init(settings) {
    this.settings = settings;
    
    // Highlight mode works differently - it modifies the page directly
    if (this.settings.mode === 'highlight') {
      return this.initHighlightMode();
    }
    
    // Get selected text or page text
    this.selectedText = window.getSelection().toString().trim();
    
    if (!this.selectedText) {
      // If no selection, automatically start from the beginning of the page
      this.selectedText = this.extractPageText();
    }
    
    if (!this.selectedText || this.selectedText.length === 0) {
      alert('No text found on this page to read!');
      return;
    }
    
    // Parse text into words
    this.words = this.parseText(this.selectedText);
    
    // Try to restore last reading position for this page
    await this.restorePosition();
    
    this.isPaused = false;
    
    // Create UI based on mode
    this.createUI();
    this.start();
  }

  // Initialize highlight mode (works on page directly)
  async initHighlightMode() {
    // Store original content for restoration
    this.originalContent = null;
    this.contentElement = null;
    
    // Find the content element to work with
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      '#content'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.innerText.trim().length > 100) {
        this.contentElement = element;
        break;
      }
    }
    
    if (!this.contentElement) {
      // Fallback: try to find main content area
      const allP = document.querySelectorAll('p');
      if (allP.length > 0) {
        // Find the parent that contains most paragraphs
        let bestParent = allP[0].parentElement;
        this.contentElement = bestParent;
      }
    }
    
    if (!this.contentElement) {
      alert('Could not find main content on this page!');
      return;
    }
    
    // Store original HTML for restoration
    this.originalContent = this.contentElement.innerHTML;
    
    // Wrap all words in spans
    this.wrapWordsInPage();
    
    // Create floating control panel
    this.createHighlightControls();
    
    // Try to restore position
    await this.restorePosition();
    
    this.isPaused = false;
    this.isActive = true;
    
    // Enable manual scrolling with mouse wheel
    this.setupManualScrolling();
    
    // Start highlighting
    this.startHighlight();
  }

  // Wrap all text words in the content element with spans
  wrapWordsInPage() {
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script, style, and other non-content elements
          if (node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          // Only accept text nodes with actual content
          if (node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    this.words = [];
    let wordIndex = 0;
    
    // Process each text node
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const words = text.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length === 0) return;
      
      // Create a document fragment with wrapped words
      const fragment = document.createDocumentFragment();
      
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'speedread-highlight-word';
        span.dataset.index = wordIndex;
        span.textContent = word;
        
        // Add drag and drop event listeners
        this.setupWordDragAndDrop(span);
        
        fragment.appendChild(span);
        
        this.words.push(word);
        wordIndex++;
        
        // Add space between words (except last)
        if (i < words.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
      
      // Replace text node with wrapped words
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  // Setup drag and drop for highlight mode words
  setupWordDragAndDrop(wordSpan) {
    // Make word draggable when it becomes active
    wordSpan.addEventListener('mouseenter', (e) => {
      if (wordSpan.classList.contains('active')) {
        wordSpan.setAttribute('draggable', 'true');
      }
    });
    
    wordSpan.addEventListener('mouseleave', (e) => {
      if (!this.isDragging) {
        wordSpan.removeAttribute('draggable');
      }
    });
    
    // Drag start
    wordSpan.addEventListener('dragstart', (e) => {
      if (!wordSpan.classList.contains('active')) {
        e.preventDefault();
        return;
      }
      
      this.isDragging = true;
      this.draggedElement = wordSpan;
      this.lastDragY = e.clientY;
      
      // Pause reading during drag
      this.isPaused = true;
      const btn = document.getElementById('speedread-play-pause');
      if (btn) {
        btn.textContent = '▶ Play';
      }
      
      // Add dragging class for visual feedback
      wordSpan.classList.add('dragging');
      
      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', wordSpan.dataset.index);
      
      // Create custom drag image
      const dragImage = wordSpan.cloneNode(true);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.classList.add('drag-preview');
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
      setTimeout(() => dragImage.remove(), 0);
      
      // Start monitoring for edge scrolling
      this.startEdgeScrollMonitoring();
    });
    
    // Drag over - highlight potential drop target
    wordSpan.addEventListener('dragover', (e) => {
      if (this.isDragging && wordSpan !== this.draggedElement) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Remove previous drop target highlight
        if (this.dropTarget && this.dropTarget !== wordSpan) {
          this.dropTarget.classList.remove('drop-target');
        }
        
        // Highlight current drop target
        wordSpan.classList.add('drop-target');
        this.dropTarget = wordSpan;
      }
    });
    
    // Drag leave
    wordSpan.addEventListener('dragleave', (e) => {
      if (this.isDragging && wordSpan === this.dropTarget) {
        wordSpan.classList.remove('drop-target');
      }
    });
    
    // Drop
    wordSpan.addEventListener('drop', (e) => {
      e.preventDefault();
      
      if (!this.isDragging || wordSpan === this.draggedElement) {
        return;
      }
      
      // Get the new index from the dropped word
      const newIndex = parseInt(wordSpan.dataset.index);
      
      // Show transition feedback
      this.showDropTransition(wordSpan);
      
      // Update current index to dropped position
      this.currentIndex = newIndex;
      
      // Remove old highlight
      if (this.draggedElement) {
        this.draggedElement.classList.remove('active');
      }
      
      // Add highlight to new position
      wordSpan.classList.add('active');
      
      // Scroll to new position
      wordSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Update progress
      this.updateProgress();
    });
    
    // Drag end
    wordSpan.addEventListener('dragend', (e) => {
      this.isDragging = false;
      
      // Stop auto-scrolling
      this.stopEdgeScrollMonitoring();
      
      // Clean up visual states
      if (this.draggedElement) {
        this.draggedElement.classList.remove('dragging');
        this.draggedElement.removeAttribute('draggable');
      }
      
      if (this.dropTarget) {
        this.dropTarget.classList.remove('drop-target');
        this.dropTarget = null;
      }
      
      this.draggedElement = null;
    });
  }

  // Start auto-scroll when dragging near screen edges
  startEdgeScrollMonitoring() {
    // Clear any existing interval
    this.stopEdgeScrollMonitoring();
    
    // Add document-level drag listener
    this.dragMoveHandler = (e) => {
      this.lastDragY = e.clientY;
    };
    document.addEventListener('drag', this.dragMoveHandler);
    
    // Check edge proximity every 50ms
    this.autoScrollInterval = setInterval(() => {
      if (!this.isDragging) return;
      
      const edgeThreshold = 100; // pixels from edge
      const scrollSpeed = 10; // pixels per interval
      const windowHeight = window.innerHeight;
      
      // Scroll down if dragging near bottom
      if (this.lastDragY > windowHeight - edgeThreshold) {
        window.scrollBy(0, scrollSpeed);
      }
      // Scroll up if dragging near top
      else if (this.lastDragY < edgeThreshold) {
        window.scrollBy(0, -scrollSpeed);
      }
    }, 50);
  }
  
  // Stop auto-scroll monitoring
  stopEdgeScrollMonitoring() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
    if (this.dragMoveHandler) {
      document.removeEventListener('drag', this.dragMoveHandler);
      this.dragMoveHandler = null;
    }
  }

  // Show visual feedback for successful drop
  showDropTransition(targetWord) {
    // Create transition indicator
    const indicator = document.createElement('div');
    indicator.className = 'speedread-drop-indicator';
    indicator.textContent = '📍 Reading will resume from here';
    indicator.style.position = 'fixed';
    indicator.style.left = '50%';
    indicator.style.top = '20px';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.zIndex = '9999999';
    document.body.appendChild(indicator);
    
    // Pulse the target word
    targetWord.classList.add('dropped');
    
    // Remove feedback after animation
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }, 1500);
    
    setTimeout(() => {
      targetWord.classList.remove('dropped');
    }, 1000);
  }

  // Extract readable text from page
  extractPageText() {
    try {
      // Try to find article content first (most reliable sources)
      const selectors = [
        'article',
        '[role="main"]',
        'main',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        '#content',
        '.post-body',
        '.article-body',
        '.prose' // Common for markdown/article content
      ];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            // Clone element to avoid modifying the page
            const clone = element.cloneNode(true);
            
            // Remove script tags, style tags, and other non-content elements
            clone.querySelectorAll('script, style, nav, header, footer, .navigation, .menu').forEach(el => el.remove());
            
            const text = clone.innerText.trim();
            if (text.length > 100) {
              console.log('SpeedRead: Found content in', selector, '- length:', text.length);
              return text;
            }
          }
        } catch (e) {
          console.warn('SpeedRead: Error checking selector', selector, e);
        }
      }
      
      // Fallback: get all paragraph text
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(p => {
          try {
            return p.innerText.trim();
          } catch (e) {
            return '';
          }
        })
        .filter(text => text.length > 0)
        .join(' ');
      
      if (paragraphs.length > 100) {
        console.log('SpeedRead: Using paragraph content - length:', paragraphs.length);
        return paragraphs;
      }
      
      // Last resort: body text (limited to prevent too much content)
      if (document.body && document.body.innerText) {
        const bodyText = document.body.innerText.trim();
        console.log('SpeedRead: Using body content - length:', bodyText.length);
        return bodyText.substring(0, 50000); // Limit to ~10000 words
      }
      
      return '';
    } catch (error) {
      console.error('SpeedRead: Error extracting page text:', error);
      return '';
    }
  }

  // Parse text into words
  parseText(text) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0);
  }

  // Create reading UI
  createUI() {
    // Remove existing container
    if (this.container) {
      this.container.remove();
    }

    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'speedread-container';
    this.container.className = `speedread-mode-${this.settings.mode}`;
    
    if (this.settings.darkMode) {
      this.container.classList.add('dark-mode');
    }

    // Create UI based on mode
    switch (this.settings.mode) {
      case 'rsvp':
        this.createRSVPUI();
        break;
      case 'highlight':
        this.createHighlightUI();
        break;
    }

    // Add controls
    this.addControls();

    // Apply styles
    this.applyStyles();

    document.body.appendChild(this.container);
    
    // Setup control listeners AFTER container is added to DOM
    this.setupControlListeners();
    
    // Show resume indicator if continuing from previous position
    if (this.currentIndex > 0) {
      this.showResumeIndicator();
    }
    
    this.isActive = true;
  }

  // Create RSVP (Rapid Serial Visual Presentation) UI
  createRSVPUI() {
    const content = document.createElement('div');
    content.className = 'speedread-content';
    
    const wordDisplay = document.createElement('div');
    wordDisplay.className = 'speedread-word-display';
    wordDisplay.id = 'speedread-word';
    
    if (this.settings.focusPoint) {
      const focusPoint = document.createElement('span');
      focusPoint.className = 'focus-point';
      wordDisplay.appendChild(focusPoint);
    }
    
    content.appendChild(wordDisplay);
    this.container.appendChild(content);
  }

  // Create floating control panel for in-page highlight mode
  createHighlightControls() {
    const controls = document.createElement('div');
    controls.id = 'speedread-highlight-controls';
    controls.className = 'speedread-highlight-controls';
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'speedread-progress-bar';
    progressBar.innerHTML = `
      <div class="progress-fill" id="speedread-progress"></div>
      <div class="progress-text" id="speedread-progress-text">0%</div>
    `;
    controls.appendChild(progressBar);
    
    // Control buttons
    const buttons = document.createElement('div');
    buttons.className = 'speedread-buttons';
    buttons.innerHTML = `
      <button id="speedread-play-pause" class="control-btn">⏸ Pause</button>
      <button id="speedread-slower" class="control-btn">🐢 Slower</button>
      <button id="speedread-faster" class="control-btn">🐰 Faster</button>
      <button id="speedread-close" class="control-btn close-btn">✕ Close</button>
    `;
    controls.appendChild(buttons);
    
    // Speed display
    const speedDisplay = document.createElement('div');
    speedDisplay.className = 'speed-display';
    speedDisplay.id = 'speedread-speed';
    speedDisplay.textContent = `${this.settings.speed} WPM`;
    controls.appendChild(speedDisplay);
    
    document.body.appendChild(controls);
    
    // Setup listeners for the controls
    this.setupHighlightControlListeners();
  }

  // Setup event listeners for highlight mode controls
  setupHighlightControlListeners() {
    const playPauseBtn = document.getElementById('speedread-play-pause');
    const slowerBtn = document.getElementById('speedread-slower');
    const fasterBtn = document.getElementById('speedread-faster');
    const closeBtn = document.getElementById('speedread-close');
    const progressBar = document.querySelector('#speedread-highlight-controls .speedread-progress-bar');
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePause());
    }
    
    if (slowerBtn) {
      slowerBtn.addEventListener('click', () => this.adjustSpeed(-50));
    }
    
    if (fasterBtn) {
      fasterBtn.addEventListener('click', () => this.adjustSpeed(50));
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.stop());
    }
    
    if (progressBar) {
      progressBar.addEventListener('click', (e) => this.handleProgressBarClick(e));
    }
    
    // Keyboard shortcuts
    this.keyboardHandler = (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        this.togglePause();
      } else if (e.key === 'Escape') {
        this.stop();
      } else if (e.key === 'ArrowLeft') {
        this.adjustSpeed(-50);
      } else if (e.key === 'ArrowRight') {
        this.adjustSpeed(50);
      }
    };
    document.addEventListener('keydown', this.keyboardHandler);
  }

  // Setup manual scrolling for highlight mode
  setupManualScrolling() {
    // Track user scrolling with mouse wheel
    this.wheelHandler = (e) => {
      // Mark that user is manually scrolling
      this.userScrolling = true;
      this.lastScrollTime = Date.now();
      
      // Reset the flag after a delay
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.userScrolling = false;
      }, 100);
    };
    
    // Add wheel event listener
    document.addEventListener('wheel', this.wheelHandler, { passive: true });
  }

  // Create Highlight Mode UI (overlay version - not used for in-page mode)
  createHighlightUI() {
    const content = document.createElement('div');
    content.className = 'speedread-content highlight-content';
    content.id = 'speedread-highlight';
    
    // Create spans for each word
    this.words.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.className = 'highlight-word';
      span.dataset.index = index;
      content.appendChild(span);
    });
    
    this.container.appendChild(content);
  }

  // Add playback controls
  addControls() {
    const controls = document.createElement('div');
    controls.className = 'speedread-controls';
    
    // Progress bar
    if (this.settings.showProgress) {
      const progressBar = document.createElement('div');
      progressBar.className = 'speedread-progress-bar';
      progressBar.innerHTML = `
        <div class="progress-fill" id="speedread-progress"></div>
        <div class="progress-text" id="speedread-progress-text">0%</div>
      `;
      controls.appendChild(progressBar);
      
      // Cache progress elements for performance
      setTimeout(() => {
        this.progressFillElement = document.getElementById('speedread-progress');
        this.progressTextElement = document.getElementById('speedread-progress-text');
      }, 0);
    }
    
    // Control buttons (show for all modes now)
    const buttons = document.createElement('div');
    buttons.className = 'speedread-buttons';
    
    buttons.innerHTML = `
      <button id="speedread-play-pause" class="control-btn">⏸ Pause</button>
      <button id="speedread-slower" class="control-btn">🐢 Slower</button>
      <button id="speedread-faster" class="control-btn">🐰 Faster</button>
      <button id="speedread-close" class="control-btn close-btn">✕ Close</button>
    `;
    controls.appendChild(buttons);
    
    // Speed display
    const speedDisplay = document.createElement('div');
    speedDisplay.className = 'speed-display';
    speedDisplay.id = 'speedread-speed';
    speedDisplay.textContent = `${this.settings.speed} WPM`;
    controls.appendChild(speedDisplay);
    
    this.container.appendChild(controls);
  }

  // Setup control event listeners
  setupControlListeners() {
    document.getElementById('speedread-play-pause')?.addEventListener('click', () => this.togglePause());
    document.getElementById('speedread-slower')?.addEventListener('click', () => this.adjustSpeed(-50));
    document.getElementById('speedread-faster')?.addEventListener('click', () => this.adjustSpeed(50));
    document.getElementById('speedread-close')?.addEventListener('click', () => this.stop());
    
    // Progress bar click to jump
    const progressBar = document.querySelector('.speedread-progress-bar');
    if (progressBar) {
      progressBar.addEventListener('click', (e) => this.handleProgressBarClick(e));
      progressBar.style.cursor = 'pointer';
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  // Handle keyboard shortcuts
  handleKeyPress(e) {
    if (!this.isActive) return;
    
    switch(e.key) {
      case ' ':
        e.preventDefault();
        this.togglePause();
        break;
      case 'Escape':
        this.stop();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.adjustSpeed(-50);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.adjustSpeed(50);
        break;
    }
  }

  // Apply custom styles
  applyStyles() {
    this.container.style.setProperty('--bg-color', this.settings.bgColor);
    this.container.style.setProperty('--text-color', this.settings.textColor);
    this.container.style.setProperty('--highlight-color', this.settings.highlightColor);
    this.container.style.setProperty('--font-size', `${this.settings.fontSize}px`);
  }

  // Show resume indicator
  showResumeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'speedread-resume-indicator';
    indicator.textContent = `Resuming from ${Math.round((this.currentIndex / this.words.length) * 100)}%`;
    this.container.appendChild(indicator);
    
    // Remove after 2 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }

  // Start reading
  start() {
    this.isActive = true;
    this.isPaused = false;
    
    switch (this.settings.mode) {
      case 'rsvp':
        this.startRSVP();
        break;
      case 'highlight':
        this.startHighlight();
        break;
    }
  }

  // Start RSVP mode
  startRSVP() {
    const wordsPerMinute = this.settings.speed;
    const msPerWord = (60 / wordsPerMinute) * 1000 / this.settings.wordChunk;
    
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.displayNextRSVPWord();
      }
    }, msPerWord);
  }

  // Display next word in RSVP
  displayNextRSVPWord() {
    if (this.currentIndex >= this.words.length) {
      this.stop();
      return;
    }
    
    const wordDisplay = document.getElementById('speedread-word');
    const words = this.words.slice(this.currentIndex, this.currentIndex + this.settings.wordChunk);
    const displayText = words.join(' ');
    
    // Find optimal fixation point
    const fixationIndex = Math.floor(displayText.length / 2);
    
    if (this.settings.focusPoint && wordDisplay) {
      const before = displayText.substring(0, fixationIndex);
      const focus = displayText[fixationIndex] || '';
      const after = displayText.substring(fixationIndex + 1);
      
      wordDisplay.innerHTML = `${before}<span class="focus-letter">${focus}</span>${after}`;
    } else if (wordDisplay) {
      wordDisplay.textContent = displayText;
    }
    
    this.currentIndex += this.settings.wordChunk;
    this.updateProgress();
  }

  // Start Highlight mode
  startHighlight() {
    const wordsPerMinute = this.settings.speed;
    const msPerWord = (60 / wordsPerMinute) * 1000;
    
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.highlightNextWord();
      }
    }, msPerWord);
  }

  // Highlight next word
  highlightNextWord() {
    if (this.currentIndex >= this.words.length) {
      this.stop();
      return;
    }
    
    // Remove previous highlight (for both overlay and in-page modes)
    const previousOverlay = document.querySelector('.highlight-word.active');
    if (previousOverlay) {
      previousOverlay.classList.remove('active');
      previousOverlay.removeAttribute('draggable');
    }
    
    const previousInPage = document.querySelector('.speedread-highlight-word.active');
    if (previousInPage) {
      previousInPage.classList.remove('active');
      previousInPage.removeAttribute('draggable');
    }
    
    // Highlight current word (try both class names)
    let current = document.querySelector(`.highlight-word[data-index="${this.currentIndex}"]`);
    if (!current) {
      current = document.querySelector(`.speedread-highlight-word[data-index="${this.currentIndex}"]`);
    }
    
    if (current) {
      current.classList.add('active');
      
      // Only auto-scroll if user hasn't manually scrolled in the last 2 seconds
      const timeSinceManualScroll = Date.now() - this.lastScrollTime;
      if (timeSinceManualScroll > 2000) {
        current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Make active word draggable in highlight mode
      if (this.settings.mode === 'highlight' && !this.container) {
        current.setAttribute('draggable', 'true');
      }
    }
    
    this.currentIndex++;
    this.updateProgress();
  }

  // Update progress bar
  updateProgress() {
    const progress = (this.currentIndex / this.words.length) * 100;
    
    // Use cached elements if available, otherwise fall back to getElementById
    const progressFill = this.progressFillElement || document.getElementById('speedread-progress');
    const progressText = this.progressTextElement || document.getElementById('speedread-progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
  }

  // Handle progress bar click to jump to position
  handleProgressBarClick(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    this.jumpToPosition(percentage);
  }

  // Jump to a specific position in the reading
  jumpToPosition(percentage) {
    // Calculate new index based on percentage
    const newIndex = Math.floor((percentage / 100) * this.words.length);
    
    // Clamp to valid range
    this.currentIndex = Math.max(0, Math.min(newIndex, this.words.length - 1));
    
    // Update display based on current mode
    switch (this.settings.mode) {
      case 'rsvp':
        // RSVP will show the word on next interval
        this.displayNextRSVPWord();
        break;
        
      case 'highlight':
        // Update highlight position (for both overlay and in-page modes)
        document.querySelectorAll('.highlight-word').forEach(word => {
          word.classList.remove('active');
        });
        document.querySelectorAll('.speedread-highlight-word').forEach(word => {
          word.classList.remove('active');
        });
        
        let highlightWord = document.querySelector(`.highlight-word[data-index="${this.currentIndex}"]`);
        if (!highlightWord) {
          highlightWord = document.querySelector(`.speedread-highlight-word[data-index="${this.currentIndex}"]`);
        }
        
        if (highlightWord) {
          highlightWord.classList.add('active');
          highlightWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        this.updateProgress();
        break;
    }
  }

  // Toggle pause
  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('speedread-play-pause');
    if (btn) {
      btn.textContent = this.isPaused ? '▶ Play' : '⏸ Pause';
    }
  }

  // Adjust reading speed
  adjustSpeed(delta) {
    this.settings.speed = Math.max(100, Math.min(1000, this.settings.speed + delta));
    
    const speedDisplay = document.getElementById('speedread-speed');
    if (speedDisplay) {
      speedDisplay.textContent = `${this.settings.speed} WPM`;
    }
    
    // Restart with new speed if active
    if (this.intervalId && !this.isPaused) {
      clearInterval(this.intervalId);
      
      if (this.settings.mode === 'rsvp') {
        this.startRSVP();
      } else if (this.settings.mode === 'highlight') {
        this.startHighlight();
      }
    }
  }

  // Stop reading
  stop() {
    this.isActive = false;
    
    // Save current position before stopping
    this.savePosition();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clean up auto-scroll monitoring
    this.stopEdgeScrollMonitoring();
    
    // Clean up scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    
    // For highlight mode, restore original content
    if (this.settings.mode === 'highlight' && this.contentElement && this.originalContent) {
      this.contentElement.innerHTML = this.originalContent;
      
      // Remove floating controls
      const controls = document.getElementById('speedread-highlight-controls');
      if (controls) {
        controls.remove();
      }
      
      // Remove keyboard listener
      if (this.keyboardHandler) {
        document.removeEventListener('keydown', this.keyboardHandler);
        this.keyboardHandler = null;
      }
      
      // Remove wheel listener
      if (this.wheelHandler) {
        document.removeEventListener('wheel', this.wheelHandler);
        this.wheelHandler = null;
      }
    } else if (this.container) {
      // For other modes, remove overlay container
      this.container.remove();
      this.container = null;
    }
    
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  // Save reading position to storage
  savePosition() {
    if (!this.pageUrl || this.words.length === 0) {
      return;
    }
    
    const positionData = {
      url: this.pageUrl,
      index: this.currentIndex,
      totalWords: this.words.length,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({
      [`speedread_position_${this.pageUrl}`]: positionData
    });
  }

  // Restore reading position from storage
  async restorePosition() {
    if (!this.pageUrl || this.words.length === 0) {
      this.currentIndex = 0;
      return;
    }
    
    return new Promise((resolve) => {
      chrome.storage.local.get([`speedread_position_${this.pageUrl}`], (result) => {
        const positionData = result[`speedread_position_${this.pageUrl}`];
        
        if (positionData && positionData.totalWords === this.words.length) {
          // Only restore if it's the same content (same word count)
          // and not too old (within 24 hours)
          const hoursSinceLastRead = (Date.now() - positionData.timestamp) / (1000 * 60 * 60);
          
          if (hoursSinceLastRead < 24 && positionData.index < this.words.length) {
            this.currentIndex = positionData.index;
            console.log(`SpeedRead: Resuming from position ${this.currentIndex} of ${this.words.length}`);
          } else {
            this.currentIndex = 0;
          }
        } else {
          this.currentIndex = 0;
        }
        
        resolve();
      });
    });
  }
}

// Global reader instance
let reader = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startReading') {
    try {
      console.log('SpeedRead: Starting reading mode...');
      
      // Stop existing reader if any
      if (reader) {
        reader.stop();
      }
      
      // Create new reader
      reader = new SpeedReader();
      reader.init(request.settings);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('SpeedRead: Error in message handler:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      });
    }
  }
  
  return true;
});

// Log when content script loads
console.log('SpeedRead: Content script loaded');
