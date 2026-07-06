# ⚡ SpeedRead Pro

A powerful Chrome extension for speed reading with customizable reading modes, inspired by tools like Swiftread.

## 🌟 Features

### Reading Modes

1. **RSVP (Rapid Serial Visual Presentation)**
   - Words displayed one at a time in the center of the screen
   - Optional focus point highlighting for optimal fixation
   - Adjustable words per chunk (1-5 words)

2. **Highlight Mode**
   - **In-page highlighting** - words are highlighted directly on the article (no overlay)
   - Progressive word-by-word highlighting with yellow background and border
   - Natural reading experience with the actual page layout
   - Automatic scrolling keeps the highlighted word in view (pauses when you scroll manually)
   - Floating control panel for speed adjustment and navigation
   - **Drag & Drop Repositioning** - drag the highlighted word to jump to any position
     - Hover over the highlighted word until cursor changes to "grab"
     - Drag to any other word on the page
     - Green highlight shows where reading will resume
     - Drop to instantly jump to that position
     - **Edge Scrolling** - drag near the top or bottom of the screen to auto-scroll
   - **Manual Scrolling** - use mouse wheel to scroll and explore the page while reading
     - Auto-scroll pauses for 2 seconds when you manually scroll
     - Find and click any word to jump to that position

### Customization Options

- **Speed Control**: 100-1000 words per minute
- **Font Size**: 16-72 pixels
- **Word Chunks**: Display 1-5 words at a time (RSVP mode)
- **Dark Mode**: Easy on the eyes for night reading
- **Interactive Progress Bar**: Track and control your reading position
  - Click anywhere on the progress bar to jump to that position
  - Hover effect shows the bar is interactive
- **Color Themes**: Customize background, text, and highlight colors
- **Focus Point**: Toggle fixation point in RSVP mode

### Controls

**Keyboard Shortcuts:**
- **Space**: Pause/Play
- **Esc**: Exit reading mode
- **Left Arrow**: Decrease speed (-50 WPM)
- **Right Arrow**: Increase speed (+50 WPM)

**Mouse Controls:**
- **Click Progress Bar**: Jump to any position in the reading
- **Drag Highlighted Word** (Highlight Mode): Drag and drop the active word to reposition your reading location
  - Drag near top/bottom edge to auto-scroll the page
- **Mouse Wheel** (Highlight Mode): Scroll the page manually to explore and find new positions
  - Auto-scroll pauses for 2 seconds when you use the mouse wheel

## 📦 Installation

### Method 1: Load Unpacked Extension (Development)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `speedread` folder
6. The SpeedRead Pro icon should appear in your extensions bar

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon!

## 🚀 Usage

### Quick Start

1. Navigate to any webpage with text
2. **Optional:** Select specific text you want to read (or leave unselected to read from the beginning)
3. Click the SpeedRead Pro icon in your toolbar
4. Choose your preferred reading mode
5. Adjust speed and settings as desired
6. Click **Start Reading**

**Note:** If no text is selected, the extension automatically detects and reads the main content of the page from the beginning.

### Alternative Methods

- **Right-click menu**: Select text → Right-click → "Speed Read Selected Text"
- **Whole page**: Right-click anywhere → "Speed Read This Page"
- **Auto-detect**: Click extension icon without selecting text to automatically read page content

## ⚙️ Settings Guide

### Reading Modes Explained

**RSVP (Best for Maximum Speed)**
- Ideal for: Articles, emails, documentation
- Pros: Fastest reading speed, eliminates eye movement
- Cons: Can be tiring for very long sessions

**Highlight Mode (Best for Balanced Reading)**
- Ideal for: General content, news articles, blog posts
- Pros: Maintains page layout and context, natural reading feel, in-page highlighting with no overlay
- Cons: Requires some eye movement (but less than normal reading)
- Features: Floating control panel, automatic scrolling, adjustable speed

### Recommended Settings

**Beginner**
- Mode: Highlight
- Speed: 200-300 WPM
- Font Size: 24-28px

**Intermediate**
- Mode: RSVP or Highlight
- Speed: 300-500 WPM
- Font Size: 22-26px

**Advanced**
- Mode: RSVP
- Speed: 500-800 WPM
- Font Size: 20-24px
- Word Chunk: 2-3 words

## 🎨 Creating Custom Themes

You can save different color schemes for different reading scenarios:

**Light Theme (Default)**
- Background: #ffffff
- Text: #000000
- Highlight: #ffeb3b

**Dark Theme**
- Background: #1a1a1a
- Text: #ffffff
- Highlight: #ffa726

**Sepia Theme**
- Background: #f4ecd8
- Text: #5f4b32
- Highlight: #d4a574

**Night Mode**
- Background: #0d1117
- Text: #c9d1d9
- Highlight: #58a6ff

## 📁 Project Structure

```
speedread/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── content.js            # Content script (main reading logic)
├── content.css           # Reading interface styles
├── background.js         # Background service worker
├── icons/                # Extension icons (16, 32, 48, 128px)
└── README.md            # This file
```

## 🛠️ Development

### Prerequisites

- Google Chrome (or Chromium-based browser)
- Basic knowledge of HTML, CSS, and JavaScript

### Making Changes

1. Edit the files in the project directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the SpeedRead Pro card
4. Test your changes

### Adding New Features

The codebase is modular and easy to extend:

- **New reading modes**: Add to `content.js` `SpeedReader` class
- **UI improvements**: Modify `popup.html` and `popup.css`
- **Settings**: Update `DEFAULT_SETTINGS` in `popup.js`

## 🐛 Troubleshooting

### Extension doesn't start
- Make sure you have selected text or are on a valid webpage
- Try refreshing the page and the extension
- Check browser console for errors (F12)

### Reading mode not working
- Ensure you've granted necessary permissions
- Some websites may block content scripts
- Try on a different website

### Settings not saving
- Check if Chrome sync is enabled
- Clear extension data and reinstall
- Check browser console for storage errors

## 🔒 Privacy

SpeedRead Pro:
- Does NOT collect any personal data
- Does NOT track your browsing history
- Does NOT send data to external servers
- All settings are stored locally in your browser using Chrome's sync storage

## 📝 License

MIT License - feel free to use, modify, and distribute!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🙏 Acknowledgments

- Inspired by Swiftread, Spritz, and other speed reading tools
- Built with vanilla JavaScript (no frameworks needed!)
- Uses Chrome Extension Manifest V3

## 📮 Support

For issues, questions, or feature requests, please open an issue on the project repository.

---

**Happy Speed Reading! 📚⚡**

Average reading speed: 200-300 WPM
SpeedRead Pro target: 400-800 WPM
Potential time saved: 50-70%!