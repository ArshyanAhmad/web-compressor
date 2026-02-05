# Compressor - Web Performance Optimizer

A Chrome extension and web application that optimizes web pages by removing images, CSS, videos, and fonts to dramatically improve loading speed and performance.

## Features

- **VPN-like Optimization**: Intercepts page loads and removes heavy content before rendering
- **Real-time Metrics**: Shows before/after performance improvements
- **Smart Caching**: 10-minute cache per URL for instant toggle switching
- **Analytics Dashboard**: Beautiful charts showing optimization statistics
- **Live Page Manipulation**: All optimizations happen on the current page (no new tabs)

## Project Structure

```
compressor/
├── extension/          # Chrome Extension (Manifest V3)
├── website/           # React Website with Tailwind CSS
├── backend/           # Node.js/Express Backend API
└── shared/            # Shared utilities and types
```

## Getting Started

### Backend (Required for Website)
1. Navigate to `backend/` directory
2. Run `npm install`
3. Run `npm run dev` (starts on http://localhost:3000)

### Extension
1. Navigate to `extension/` directory
2. Run `npm install`
3. Run `npm run build`
4. Load unpacked extension in Chrome (chrome://extensions) - select `extension/dist/` folder

### Website
1. Navigate to `website/` directory
2. Run `npm install`
3. Run `npm run dev` (starts on http://localhost:5173)

**Note**: Backend must be running for website's "Optimize" feature to work.

## License

MIT
