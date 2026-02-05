# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install All Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install extension dependencies
cd ../extension
npm install

# Install website dependencies
cd ../website
npm install
```

### Step 2: Start Backend (Required for Website)

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`

### Step 3: Build Extension

```bash
cd extension
npm run build
```

### Step 4: Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist/` folder

### Step 5: Run Website

```bash
cd website
npm run dev
```

Visit `http://localhost:5173`

**Important**: Backend must be running for website's "Optimize" feature!

## ✅ Test It Out

1. **Test Extension**:
   - Visit any website (e.g., `https://example.com`)
   - Click the extension icon
   - Toggle extension ON
   - Page reloads with images/videos removed!

2. **Test Dashboard**:
   - Click "Get Full Info" in extension popup
   - Or visit `http://localhost:5173/dashboard`
   - Enter a URL and click "Optimize"

## 📋 What You Get

✅ Chrome Extension with VPN-like optimization  
✅ React Website with Tailwind CSS  
✅ Analytics Dashboard with Charts  
✅ Performance Metrics Tracking  
✅ Smart Caching System  
✅ Professional UI Design  

## 🎯 Key Features

- **Network Interception**: Blocks heavy content before page loads
- **Live DOM Manipulation**: Optimizes pages in real-time
- **Smart Caching**: 10-minute cache for instant toggle
- **Real-time Metrics**: See performance improvements instantly
- **Beautiful Charts**: Visualize optimization data

## 📚 Documentation

- `PROJECT_STRUCTURE.md` - Detailed file explanations
- `SETUP_GUIDE.md` - Complete setup instructions
- `README.md` - Project overview

## 🐛 Need Help?

Check `SETUP_GUIDE.md` for troubleshooting tips!
