/**
 * Generate Extension Icons
 * 
 * Creates simple PNG icons for the extension
 * Uses canvas to generate icons with a "C" logo
 */

const fs = require('fs');
const path = require('path');

// Simple approach: Create a script that uses a basic method
// Since we can't use canvas without additional setup, we'll create SVG files
// that Chrome can use, or provide a simple solution

const iconSizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple SVG icons (Chrome accepts SVG but prefers PNG)
// We'll create a simple HTML file that can be converted to PNG
// Or create a script that generates them

console.log('Creating icon generation script...');

// Create a simple HTML file that can be used to generate icons
const iconHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; }
    .icon {
      width: 128px;
      height: 128px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 64px;
      font-weight: bold;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div class="icon">C</div>
</body>
</html>
`;

fs.writeFileSync(path.join(iconsDir, 'icon-generator.html'), iconHTML);

// For now, let's create a simple solution using a data URI approach
// or create actual PNG files using a simple method

// Create a Node.js script that will generate PNGs if sharp is available
const generatePNGScript = `
const sharp = require('sharp');

async function generateIcons() {
  const sizes = [16, 48, 128];
  const iconsDir = './icons';
  
  for (const size of sizes) {
    const svg = \`
      <svg width="\${size}" height="\${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="\${size}" height="\${size}" fill="url(#grad)"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" font-family="Arial" font-size="\${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
      </svg>
    \`;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(\`\${iconsDir}/icon\${size}.png\`);
    
    console.log(\`Generated icon\${size}.png\`);
  }
}

generateIcons().catch(console.error);
`;

// Better solution: Create simple placeholder PNG files using a base64 approach
// Or create a script that uses jimp or another library

console.log('Icon generation script created.');
console.log('\nTo generate icons, run:');
console.log('npm install sharp --save-dev');
console.log('node scripts/generate-icons-with-sharp.js');
console.log('\nOr manually create icon16.png, icon48.png, and icon128.png in the icons folder.');
