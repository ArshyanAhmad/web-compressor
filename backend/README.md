# Compressor Backend API

Backend server for fetching, optimizing, and serving websites.

## Features

- **Website Fetching**: Fetches HTML from any website
- **HTML Optimization**: Removes CSS, images, videos, fonts
- **Metrics Calculation**: Calculates performance improvements
- **Caching**: 10-minute cache for optimized content
- **API Endpoints**: RESTful API for optimization and metrics

## Installation

```bash
npm install
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### POST /api/optimize
Optimize a website and get metrics.

**Request:**
```json
{
  "url": "https://example.com",
  "removeCSS": true,
  "removeImages": true,
  "removeVideos": true,
  "removeFonts": true
}
```

**Response:**
```json
{
  "optimizedHTML": "<html>...</html>",
  "metrics": {
    "beforeLoadTime": 3500,
    "afterLoadTime": 450,
    "loadTimeReduction": 3050,
    "beforeSize": 2500000,
    "afterSize": 150000,
    "sizeReduction": 2350000,
    "imagesRemoved": 45,
    "cssRemoved": 12,
    "videosRemoved": 3,
    "fontsRemoved": 8
  },
  "cached": false,
  "url": "https://example.com"
}
```

### GET /optimize?url=...
Serve optimized HTML directly (opens in browser).

### POST /api/metrics
Store metrics for a URL.

### GET /api/metrics?url=...
Get metrics for a URL.

### GET /health
Health check endpoint.

## Environment Variables

- `PORT`: Server port (default: 3000)

## Security

- Rate limiting: 100 requests per 15 minutes per IP
- Helmet.js for security headers
- CORS enabled for frontend domains
- Input validation and sanitization
