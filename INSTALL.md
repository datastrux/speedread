# Installation Guide

This guide will walk you through installing SpeedRead Pro on your Chrome browser.

## Prerequisites

- Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser
- Basic familiarity with browser extensions

## Step-by-Step Installation

### Step 1: Download the Extension

If you received the source code:
1. Download or clone the repository
2. Extract the ZIP file to a folder on your computer
3. Note the location of the `speedread` folder

### Step 2: Prepare Icons (First-Time Setup)

The extension requires icon files. You have two options:

**Option A: Generate from SVG (Recommended)**
```bash
# Install dependencies
npm install

# Generate icons
npm run icons
```

**Option B: Use placeholders**
- Download any 4 PNG images
- Rename them to: icon16.png, icon32.png, icon48.png, icon128.png
- Place them in the `icons/` folder
- See `icons/ICONS.md` for detailed icon creation guide

### Step 3: Open Chrome Extensions Page

1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar
3. Press **Enter**

   *Alternative methods:*
   - Click the three-dot menu → More tools → Extensions
   - Use keyboard shortcut: `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)

### Step 4: Enable Developer Mode

1. Look for the **Developer mode** toggle in the top-right corner
2. Click the toggle to turn it **ON**
3. You should see new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 5: Load the Extension

1. Click the **Load unpacked** button
2. Navigate to the folder containing the extension files
3. Select the `speedread` folder (the one containing `manifest.json`)
4. Click **Select Folder** (or **Open**)

### Step 6: Verify Installation

You should see:
- ✅ SpeedRead Pro card appear in the extensions list
- ✅ Extension status shows as "Enabled"
- ✅ No error messages

If you see errors:
- Check that all required files are present
- Ensure `manifest.json` is in the root folder
- Verify icon files exist in the `icons/` folder

### Step 7: Pin the Extension (Optional but Recommended)

1. Click the **Extensions** icon (puzzle piece) in the Chrome toolbar
2. Find **SpeedRead Pro** in the list
3. Click the **pin icon** next to it
4. The SpeedRead Pro icon will now appear in your toolbar

## First Use

### Test the Extension

1. Navigate to any webpage with text (e.g., a news article)
2. **Optional:** Select some text (or leave blank to read the entire page)
3. Click the SpeedRead Pro icon in your toolbar
4. Click **Start Reading** button
5. You should see the speed reading interface appear!

**Tip:** The extension automatically detects the main content if no text is selected.

### Configure Settings

1. Click the SpeedRead Pro icon
2. Choose your preferred reading mode:
   - **RSVP**: Best for maximum speed
   - **Bionic Reading**: Best for comprehension
   - **Highlight**: Balanced approach
   - **Guided**: Best for focus
3. Adjust the speed slider (start with 250-300 WPM)
4. Click **Save Settings**

## Troubleshooting

### Extension Won't Load

**Error: "Manifest file is missing or unreadable"**
- Solution: Make sure you selected the correct folder containing `manifest.json`

**Error: "Cannot load extension with file or directory name"**
- Solution: Ensure folder name doesn't contain special characters

**Error: "Failed to load extension icons"**
- Solution: Add PNG icon files to the `icons/` folder (see icons/ICONS.md)

### Extension Icon Not Showing

1. Click the Extensions icon (puzzle piece) in toolbar
2. Verify SpeedRead Pro is in the list
3. Click the pin icon to make it visible
4. Refresh the extensions page

### Extension Not Working on Certain Sites

Some websites block extensions:
- Chrome Web Store pages
- Chrome internal pages (chrome://)
- Some banking/secure websites
- PDF files (requires additional permissions)

Solution: Try on a different website like Wikipedia or a news site.

### Reading Mode Won't Start

1. Make sure you're on a valid webpage (not chrome://, edge://, or extension pages)
2. Try refreshing the webpage
3. Check if the page has readable text content
4. Look for error messages in the browser console (F12)
5. Try selecting specific text instead of auto-detecting

## Updating the Extension

When you make changes to the code:

1. Go to `chrome://extensions/`
2. Find SpeedRead Pro
3. Click the **refresh icon** (circular arrow)
4. Test your changes

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find SpeedRead Pro
3. Click **Remove**
4. Confirm the removal

Your settings will be deleted from Chrome sync storage.

## Installing on Other Browsers

### Microsoft Edge

1. Navigate to `edge://extensions/`
2. Follow the same steps as Chrome
3. Enable Developer mode
4. Load unpacked extension

### Brave Browser

1. Navigate to `brave://extensions/`
2. Follow the same steps as Chrome
3. Enable Developer mode
4. Load unpacked extension

### Opera

1. Navigate to `opera://extensions/`
2. Follow the same steps as Chrome
3. Enable Developer mode
4. Load unpacked extension

## Next Steps

- Read the [User Guide](README.md) for detailed feature explanations
- Check out [keyboard shortcuts](README.md#keyboard-shortcuts)
- Experiment with different reading modes
- Adjust settings to find your optimal reading speed

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](README.md#troubleshooting) section
2. Review the browser console for error messages (F12 → Console)
3. Make sure all files are present and properly formatted
4. Try reloading the extension
5. Report bugs or ask questions in the project repository

---

**Enjoy faster reading with SpeedRead Pro! 🚀**