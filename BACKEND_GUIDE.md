# Backend Guide

## Why Backend is Needed

The backend is **essential** for the website's "Optimize" feature because:

1. **CORS Restrictions**: Browsers cannot fetch external websites directly due to Cross-Origin Resource Sharing (CORS) policies
2. **Server-Side Fetching**: Backend can fetch any website without CORS limitations
3. **HTML Parsing**: Server-side HTML parsing is more reliable and secure
4. **Caching**: Centralized caching for optimized content
5. **Metrics Storage**: Store and retrieve performance metrics

## Architecture

```
User → React Website → Backend API → External Website
                      ↓
                   Parse HTML
                      ↓
                   Remove CSS/Images/Videos/Fonts
                      ↓
                   Calculate Metrics
                      ↓
                   Cache & Return
```

## Backend Structure

```
backend/
├── server.js              # Main Express server
├── services/
│   ├── fetcher.js        # Fetches websites
│   ├── optimizer.js      # Parses & optimizes HTML
│   └── metrics.js        # Calculates performance metrics
└── package.json
```

## How It Works

### 1. Website Fetching (`services/fetcher.js`)
- Uses Axios to fetch HTML from any URL
- Handles redirects and errors
- Measures fetch time
- Returns HTML and metadata

### 2. HTML Optimization (`services/optimizer.js`)
- Uses Cheerio to parse HTML (server-side jQuery)
- Removes CSS (stylesheets, inline styles, style tags)
- Removes images (empties src, keeps alt text)
- Removes videos and iframes
- Removes fonts
- Returns optimized HTML

### 3. Metrics Calculation (`services/metrics.js`)
- Calculates before/after metrics
- Load time reduction
- Size reduction
- Resource counts
- Performance gain percentage

### 4. Caching
- 10-minute TTL per URL
- Stores optimized HTML and metrics
- Reduces redundant processing

## API Endpoints

### POST /api/optimize
**Purpose**: Optimize a website and get metrics

**Request Body**:
```json
{
  "url": "https://example.com",
  "removeCSS": true,
  "removeImages": true,
  "removeVideos": true,
  "removeFonts": true
}
```

**Response**:
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
    "fontsRemoved": 8,
    "performanceGain": 87.14
  },
  "cached": false,
  "url": "https://example.com"
}
```

### GET /optimize?url=...
**Purpose**: Serve optimized HTML directly (opens in browser)

**Usage**: `http://localhost:3000/optimize?url=https://example.com`

Returns optimized HTML that can be opened in a new tab.

### POST /api/metrics
**Purpose**: Store metrics for a URL

### GET /api/metrics?url=...
**Purpose**: Retrieve metrics for a URL

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes per IP
2. **Helmet.js**: Security headers
3. **CORS**: Configured for frontend domains
4. **Input Validation**: URL validation and sanitization
5. **Error Handling**: Proper error responses

## Extension vs Backend

### Extension (Client-Side)
- Works on **current page** user is viewing
- Uses **network interception** (webRequest API)
- **No backend needed** - works standalone
- Optimizes pages **before they load**

### Backend (Server-Side)
- Needed for **website's "Optimize" feature**
- Fetches **any external website**
- Parses and optimizes HTML **server-side**
- Returns optimized HTML for **display in new tab**

## Running Backend

```bash
cd backend
npm install
npm run dev    # Development with auto-reload
npm start      # Production
```

Backend runs on `http://localhost:3000`

## Environment Variables

Create `.env` file:
```
PORT=3000
NODE_ENV=development
```

## Testing

1. **Test API**:
```bash
curl -X POST http://localhost:3000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

2. **Test Optimized Page**:
Open `http://localhost:3000/optimize?url=https://example.com` in browser

3. **Test from Website**:
- Start backend: `npm run dev` (in backend folder)
- Start website: `npm run dev` (in website folder)
- Enter URL in dashboard and click "Optimize"

## Troubleshooting

### CORS Errors
- Ensure backend CORS includes frontend URL
- Check `cors` configuration in `server.js`

### Fetch Errors
- Some websites block automated requests
- Check User-Agent header
- Verify URL is accessible

### Memory Issues
- Cache TTL is 10 minutes (adjustable)
- Large HTML files may cause memory issues
- Consider adding size limits

## Future Enhancements

- Database for persistent metrics storage
- User accounts and history
- Batch optimization
- PDF reports
- Email notifications
