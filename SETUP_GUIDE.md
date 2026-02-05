# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser

## Installation Steps

### 1. Install Dependencies

#### Extension
```bash
cd extension
npm install
```

#### Website
```bash
cd website
npm install
```

### 2. Build Extension

```bash
cd extension
npm run build
```

This creates a `dist/` folder with the compiled extension.

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist/` folder
5. Extension should now appear in your extensions list

### 4. Run Website

```bash
cd website
npm run dev
```

The website will start at `http://localhost:5173`

## Development

### Extension Development

```bash
cd extension
npm run dev
```

This watches for changes and rebuilds automatically.

### Website Development

```bash
cd website
npm run dev
```

Hot reload is enabled - changes reflect immediately.

## Building for Production

### Extension

```bash
cd extension
npm run build
```

The `dist/` folder contains the production-ready extension.

### Website

```bash
cd website
npm run build
```

The `dist/` folder contains the production-ready website.

## Extension Icons

You need to add icon files to `extension/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create simple icons or use placeholder images for now.

## Testing

1. **Test Extension**:
   - Load extension in Chrome
   - Visit any website
   - Click extension icon
   - Toggle extension ON
   - Page should reload with images/videos removed

2. **Test Website**:
   - Visit `http://localhost:5173`
   - Navigate to Dashboard
   - Enter a URL and click "Optimize"
   - View charts and metrics

3. **Test Integration**:
   - Enable extension on a website
   - Click "Get Full Info" in popup
   - Should redirect to dashboard with metrics

## Troubleshooting

### Extension Not Loading
- Check `chrome://extensions/` for errors
- Ensure manifest.json is valid
- Check browser console for errors

### Website Not Starting
- Ensure port 5173 is available
- Check Node.js version (v16+)
- Clear node_modules and reinstall

### Extension Not Working
- Check permissions in manifest.json
- Verify background script is running (chrome://extensions → Service Worker)
- Check content script injection (DevTools → Console)

### Metrics Not Showing
- Ensure extension is enabled
- Check Chrome Storage (DevTools → Application → Storage)
- Verify background script is storing metrics

## Next Steps

1. Add extension icons
2. Test on various websites
3. Customize colors/styling
4. Add more metrics
5. Deploy website to hosting
