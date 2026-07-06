const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, '../speedread-pro.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('✓ Extension packaged successfully!');
  console.log(`✓ Total size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
  console.log('✓ File: speedread-pro.zip');
  console.log('\nReady to upload to Chrome Web Store!');
});

// Handle warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
console.log('Packaging SpeedRead Pro extension...\n');

// Core files
archive.file('manifest.json', { name: 'manifest.json' });
archive.file('popup.html', { name: 'popup.html' });
archive.file('popup.css', { name: 'popup.css' });
archive.file('popup.js', { name: 'popup.js' });
archive.file('content.js', { name: 'content.js' });
archive.file('content.css', { name: 'content.css' });
archive.file('background.js', { name: 'background.js' });
archive.file('README.md', { name: 'README.md' });

// Add icons directory if it exists and has PNG files
if (fs.existsSync(path.join(__dirname, '../icons'))) {
  const iconFiles = fs.readdirSync(path.join(__dirname, '../icons'))
    .filter(file => file.endsWith('.png'));
  
  if (iconFiles.length > 0) {
    archive.directory('icons/', 'icons');
    console.log(`✓ Added ${iconFiles.length} icon files`);
  } else {
    console.warn('⚠ Warning: No PNG icons found in icons/ folder');
    console.warn('  Please add icon16.png, icon32.png, icon48.png, and icon128.png');
  }
} else {
  console.warn('⚠ Warning: icons/ folder not found');
}

// Finalize the archive
archive.finalize();