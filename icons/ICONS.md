# Extension Icons

This folder should contain the extension icons in the following sizes:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows computers)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

### Option 1: Use an Icon Generator

1. Visit a service like [Icon Kitchen](https://icon.kitchen/) or [Favicon Generator](https://realfavicongenerator.net/)
2. Upload your base icon (ideally 512x512 PNG)
3. Generate all required sizes
4. Download and place in this `icons/` folder

### Option 2: Create Using Design Tools

1. Use tools like:
   - Figma (free, web-based)
   - Adobe Illustrator
   - Canva
   - GIMP (free)
   
2. Design your icon at 512x512 pixels
3. Export at the required sizes (16, 32, 48, 128)
4. Save as PNG with transparency

### Option 3: Use Free Icon Sets

1. Download from:
   - [Flaticon](https://www.flaticon.com/)
   - [Icons8](https://icons8.com/)
   - [Font Awesome](https://fontawesome.com/)
   
2. Resize to required dimensions
3. Ensure you have proper licensing

## Design Tips

### Recommended Design
- **Theme**: Lightning bolt or speed-related symbol
- **Colors**: Purple gradient (#667eea to #764ba2) matching the extension UI
- **Style**: Modern, minimal, clear at small sizes
- **Background**: Transparent or solid color

### Things to Avoid
- Too much detail (won't be visible at 16x16)
- Very thin lines (will disappear at small sizes)
- Text (usually too small to read)
- Similar colors to Chrome's UI (may blend in)

## Temporary Solution

Until you create custom icons, you can use a simple placeholder. Here's what the icons should represent:

**Concept**: A book with a lightning bolt or a stylized "SR" (SpeedRead) with motion lines

**Color scheme**: 
- Primary: #667eea (purple-blue)
- Secondary: #764ba2 (purple)
- Accent: #ffeb3b (yellow - for speed/lightning)

## Quick SVG Template

You can convert this SVG to PNG at different sizes:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="64" cy="64" r="60" fill="url(#grad)"/>
  
  <!-- Lightning Bolt -->
  <path d="M 50 30 L 70 30 L 55 64 L 75 64 L 45 98 L 58 70 L 40 70 Z" 
        fill="#ffeb3b" 
        stroke="#fff" 
        stroke-width="2"/>
</svg>
```

## Tools to Convert SVG to PNG

1. **Online Tools**:
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [SVG to PNG Converter](https://svgtopng.com/)

2. **Command Line** (if you have ImageMagick):
   ```bash
   convert -background none icon.svg -resize 16x16 icon16.png
   convert -background none icon.svg -resize 32x32 icon32.png
   convert -background none icon.svg -resize 48x48 icon48.png
   convert -background none icon.svg -resize 128x128 icon128.png
   ```

3. **Browser** (Chrome/Firefox):
   - Open SVG in browser
   - Take screenshot
   - Crop to size
   - Or use browser dev tools to export canvas

## Testing Your Icons

After adding icons:

1. Reload the extension in `chrome://extensions/`
2. Check the icon in:
   - Extension toolbar
   - Extension popup
   - Extension management page
   - Chrome Web Store (if publishing)

The icons should be clear and recognizable at all sizes!