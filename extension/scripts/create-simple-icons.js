/**
 * Create Simple Icons
 * 
 * Creates basic PNG icons using canvas (if available) or provides instructions
 */

// Simple solution: Create a script that generates icons
// We'll use a library-free approach by creating SVG and converting instructions

const fs = require('fs');
const path = require('path');

// Create SVG icons that can be manually converted or used directly
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad${size})"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;
};

const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG files (temporary solution - Chrome prefers PNG but will accept SVG in manifest)
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
});

console.log('✅ Created SVG icons (temporary solution)');
console.log('⚠️  Chrome prefers PNG files. Converting...');

// Try to use sharp if available, otherwise provide instructions
try {
  const sharp = require('sharp');
  
  sizes.forEach(async (size) => {
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    const pngPath = path.join(iconsDir, `icon${size}.png`);
    
    await sharp(svgPath)
      .png()
      .toFile(pngPath);
    
    console.log(`✅ Created icon${size}.png`);
  });
  
  console.log('\n✅ All PNG icons created successfully!');
} catch (e) {
  console.log('\n⚠️  Sharp not installed. Creating PNG files manually...');
  console.log('\nTo create PNG icons:');
  console.log('1. Install sharp: npm install sharp --save-dev');
  console.log('2. Run this script again');
  console.log('\nOR manually convert SVG to PNG using an online tool:');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('   - Upload icon16.svg, icon48.svg, icon128.svg');
  console.log('   - Download as PNG files');
  console.log('\nOR use the temporary SVG files (Chrome will accept them)');
}
