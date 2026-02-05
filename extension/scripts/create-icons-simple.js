/**
 * Create Simple PNG Icons
 * 
 * Creates minimal valid PNG icon files using base64 data
 * No external dependencies required
 */

const fs = require('fs');
const path = require('path');

// Minimal valid PNG files (1x1 pixel, then we'll create proper ones)
// Actually, let's create proper PNG files using base64 encoded data

// Simple gradient icon with "C" - Base64 encoded minimal PNGs
// We'll create actual small PNG files

const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple script that uses canvas if available, otherwise creates placeholder
// For now, let's create a solution that works immediately

console.log('Creating icon files...');

// Create a simple HTML file that can be used to generate icons manually
const createIconHTML = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #f0f0f0;
      font-family: Arial, sans-serif;
    }
    .icon-container {
      display: inline-block;
      margin: 10px;
      text-align: center;
    }
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
      margin: 0 auto 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .instructions {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    canvas {
      border: 1px solid #ddd;
      margin: 10px;
    }
  </style>
</head>
<body>
  <div class="instructions">
    <h2>Icon Generator</h2>
    <p>Right-click each icon below and "Save image as" to save as PNG:</p>
    <div id="icons"></div>
    <p><strong>Instructions:</strong></p>
    <ol>
      <li>Right-click each icon above</li>
      <li>Save as: icon16.png, icon48.png, icon128.png</li>
      <li>Place them in the extension/icons/ folder</li>
    </ol>
  </div>

  <script>
    function createIcon(size) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      
      // Draw rounded rectangle
      const radius = size * 0.15;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      
      // Draw "C"
      ctx.fillStyle = 'white';
      ctx.font = \`bold \${size * 0.6}px Arial\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C', size / 2, size / 2);
      
      return canvas;
    }
    
    const sizes = [16, 48, 128];
    const container = document.getElementById('icons');
    
    sizes.forEach(size => {
      const div = document.createElement('div');
      div.className = 'icon-container';
      const canvas = createIcon(size);
      div.appendChild(canvas);
      div.innerHTML += \`<br><small>icon\${size}.png (\${size}x\${size})</small>\`;
      container.appendChild(div);
    });
  </script>
</body>
</html>`;
};

// Write HTML file
fs.writeFileSync(path.join(iconsDir, 'generate-icons.html'), createIconHTML());

// Try to use sharp if available
try {
  const sharp = require('sharp');
  
  const createPNGIcon = async (size) => {
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, `icon${size}.png`));
    
    console.log(`✅ Created icon${size}.png`);
  };
  
  (async () => {
    await Promise.all([16, 48, 128].map(createPNGIcon));
    console.log('\n✅ All PNG icons created successfully!');
    console.log('Icons are ready in the icons/ folder.');
  })();
  
} catch (e) {
  console.log('\n⚠️  Sharp not available. Using alternative method...');
  console.log('\n✅ Created generate-icons.html');
  console.log('\nTo create PNG icons:');
  console.log('1. Open icons/generate-icons.html in your browser');
  console.log('2. Right-click each icon and save as PNG');
  console.log('3. Name them: icon16.png, icon48.png, icon128.png');
  console.log('\nOR install sharp and run this script again:');
  console.log('   npm install sharp --save-dev');
  console.log('   node scripts/create-icons-simple.js');
}
