const fs = require('fs');
const path = require('path');

// This script requires the 'sharp' package
// Install with: npm install sharp

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp package not found');
  console.error('Please install it with: npm install sharp');
  process.exit(1);
}

const sizes = [16, 32, 48, 128];
const svgPath = path.join(__dirname, '../icons/icon.svg');
const iconsDir = path.join(__dirname, '../icons');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('Error: icon.svg not found in icons/ folder');
  console.error('Please create an SVG icon first, or use the template in icons/ICONS.md');
  process.exit(1);
}

console.log('Generating PNG icons from SVG...\n');

// Generate icons for each size
async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon${size}.png`);
    }
    
    console.log('\n✓ All icons generated successfully!');
    console.log('\nYour extension now has all required icon sizes:');
    sizes.forEach(size => {
      console.log(`  - icon${size}.png (${size}x${size})`);
    });
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();