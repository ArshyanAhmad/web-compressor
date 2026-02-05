# Project Structure & File Explanations

This document explains every file in the Compressor project and how it works.

## 📁 Root Directory

### `package.json`
**Purpose**: Root workspace configuration for managing both extension and website as separate packages.

**What it does**: 
- Defines workspace structure
- Provides scripts to build extension and website together
- Manages project metadata

---

## 🔌 Extension Directory (`extension/`)

### `manifest.json`
**Purpose**: Chrome Extension configuration file (Manifest V3).

**What it does**:
- Defines extension permissions (storage, tabs, webRequest, scripting)
- Configures background service worker
- Sets up content scripts to run on all websites
- Defines popup UI location
- Specifies icons and metadata

**Key Features**:
- `webRequest` permission: Allows blocking network requests (images, CSS, videos, fonts)
- `content_scripts`: Injects optimization code into every webpage
- `background.service_worker`: Handles state management and caching

---

### `webpack.config.js`
**Purpose**: Webpack configuration for building the extension.

**What it does**:
- Bundles popup, background, and content scripts
- Copies static files (HTML, CSS, manifest, icons) to dist folder
- Handles CSS loading with style-loader and css-loader

---

### `src/background/background.js`
**Purpose**: Background Service Worker - the brain of the extension.

**What it does**:

1. **State Management**:
   - Stores extension ON/OFF state
   - Manages CSS removal toggle state
   - Syncs state across all tabs

2. **Network Interception**:
   - Uses `webRequest.onBeforeRequest` to block requests
   - When extension is ON, blocks:
     - Images (type: 'image')
     - Videos (type: 'media')
     - Fonts (.woff, .woff2, .ttf, .otf, .eot)
     - CSS (if CSS removal is enabled)

3. **Caching System**:
   - Stores optimized HTML per URL
   - 10-minute TTL (Time To Live)
   - Auto-clears old cache when new site is visited
   - Enables instant toggle switching

4. **Performance Metrics**:
   - Stores before/after metrics per URL
   - Tracks load time, page size, resource counts
   - Provides metrics to popup and dashboard

5. **Message Handling**:
   - Listens for messages from popup and content scripts
   - Handles toggle actions, cache requests, metrics storage

**How it works**:
- Runs in background (service worker)
- Intercepts network requests BEFORE page loads
- Stores data in Chrome Storage API
- Communicates with popup and content scripts via messages

---

### `src/content/content.js`
**Purpose**: Content Script - manipulates the DOM of webpages.

**What it does**:

1. **DOM Manipulation**:
   - Removes images (empties `src`, keeps alt text)
   - Removes videos and iframes
   - Ensures system fonts are used
   - Modifies background images

2. **Performance Measurement**:
   - Uses Performance API to measure load time
   - Counts resources (images, CSS, videos, fonts)
   - Calculates total page size
   - Compares before/after metrics

3. **Optimization Logic**:
   - Checks if extension is enabled
   - Uses cached data if available (for fast toggle)
   - Otherwise, optimizes fresh and caches result
   - Stores metrics in background script

4. **Image Handling**:
   - Keeps `<img>` elements but empties `src`
   - Shows alt text as placeholder
   - Styles images to show "[Image: alt text]" or "[Image removed]"

**How it works**:
- Runs on every webpage (injected via manifest)
- Executes at `document_start` for early interception
- Communicates with background script for state and caching
- Measures performance using browser Performance API

---

### `src/popup/popup.html`
**Purpose**: Extension popup UI structure.

**What it contains**:
- Header with extension name
- Main toggle switch (Extension ON/OFF)
- CSS removal toggle (shown when extension is ON)
- Current website info display
- Performance metrics section
- "Get Full Info" button (redirects to dashboard)
- Footer with website link

---

### `src/popup/popup.css`
**Purpose**: Styling for extension popup.

**Design**:
- Clean, modern UI
- Light grey/black theme
- Professional toggle switches
- Card-based metrics display
- Gradient buttons
- Responsive layout (350px width)

**Key Styles**:
- Toggle switches with smooth animations
- Metric cards with before/after comparisons
- Professional color scheme

---

### `src/popup/popup.js`
**Purpose**: Popup logic and interactions.

**What it does**:

1. **State Management**:
   - Loads extension state on open
   - Updates UI based on state
   - Handles toggle changes

2. **UI Updates**:
   - Shows/hides CSS toggle based on extension state
   - Displays current website URL
   - Updates performance metrics in real-time
   - Formats data (bytes, time) for display

3. **User Interactions**:
   - Main toggle: Enables/disables extension (reloads page)
   - CSS toggle: Enables/disables CSS removal (reloads page)
   - Get Full Info: Opens dashboard with analytics data

4. **Metrics Display**:
   - Load time before/after
   - Page size before/after
   - Images removed count
   - Performance gain percentage

**How it works**:
- Communicates with background script via `chrome.runtime.sendMessage`
- Listens for state changes
- Refreshes metrics every 2 seconds when extension is enabled
- Formats and displays data in user-friendly way

---

## 🌐 Website Directory (`website/`)

### `package.json`
**Purpose**: React website dependencies and scripts.

**Dependencies**:
- React & React DOM
- React Router (for navigation)
- Recharts (for beautiful charts)
- Vite (build tool)
- Tailwind CSS (styling)

---

### `vite.config.js`
**Purpose**: Vite configuration for React app.

**What it does**:
- Configures React plugin
- Sets dev server port to 5173
- Auto-opens browser on dev start

---

### `tailwind.config.js`
**Purpose**: Tailwind CSS configuration.

**What it does**:
- Configures content paths for purging
- Extends theme with custom colors (light-grey, dark-grey, blackish)
- Sets up custom color palette

---

### `index.html`
**Purpose**: HTML entry point for React app.

**What it does**:
- Root div for React
- Loads main.jsx script
- Sets page title

---

### `src/main.jsx`
**Purpose**: React app entry point.

**What it does**:
- Renders App component
- Sets up React Router
- Imports global CSS

---

### `src/index.css`
**Purpose**: Global styles and Tailwind imports.

**What it does**:
- Imports Tailwind directives
- Sets base body styles
- Defines reusable component classes (btn-primary, card, etc.)
- Applies light grey/black theme

---

### `src/App.jsx`
**Purpose**: Main router component.

**What it does**:
- Sets up React Router routes
- Routes:
  - `/` → Home page
  - `/dashboard` → Analytics dashboard

---

### `src/pages/Home.jsx`
**Purpose**: Marketing/landing page.

**What it contains**:

1. **Hero Section**:
   - Main headline
   - Value proposition
   - Download and Dashboard buttons

2. **Features Section**:
   - Lightning Fast
   - VPN-Like Behavior
   - Real-Time Metrics

3. **How It Works**:
   - Step-by-step guide (4 steps)
   - Visual numbered list

4. **Benefits Section**:
   - Target audiences:
     - Students & Researchers
     - Slow Connection Users
     - Content-Focused Users
     - Developers & Testers

5. **CTA Section**:
   - Call-to-action with download button
   - Gradient background

6. **Footer**:
   - Links and copyright

**Design**: Clean, professional, impactful with gradient accents

---

### `src/pages/Dashboard.jsx`
**Purpose**: Analytics dashboard with charts.

**What it does**:

1. **URL Input**:
   - Input field for website URL
   - "Optimize" button
   - Opens optimized version in new tab

2. **Data Parsing**:
   - Parses data from URL query params (when coming from extension)
   - Extracts metrics and URL

3. **Metrics Display**:
   - Overview cards (Performance Gain, Time Saved, Size Reduced, Images Removed)
   - Load Time Comparison Chart (Bar Chart)
   - Page Size Comparison Chart (Bar Chart)
   - Optimization Breakdown (Pie Chart)
   - Detailed Metrics Table

4. **Charts**:
   - Uses Recharts library
   - Responsive containers
   - Professional color scheme
   - Tooltips and legends

5. **Empty State**:
   - Shows when no data available
   - Prompts user to enter URL or use extension

**Features**:
- Real-time metrics visualization
- Before/after comparisons
- Beautiful, modern charts
- Responsive design
- Clean, professional UI

---

## 🔄 How Everything Works Together

### Extension Flow:

1. **User Toggles Extension ON**:
   - Popup sends message to background script
   - Background script updates state in storage
   - Current tab reloads

2. **Page Loads**:
   - Background script intercepts network requests
   - Blocks images, videos, fonts, CSS (if enabled)
   - Content script injects into page

3. **Content Script Optimizes**:
   - Checks if cached data exists
   - If cached: Uses cached HTML (instant)
   - If not: Optimizes DOM, measures performance, caches result

4. **Metrics Display**:
   - Content script sends metrics to background
   - Background stores metrics
   - Popup requests and displays metrics

5. **User Clicks "Get Full Info"**:
   - Popup collects current URL and metrics
   - Opens dashboard with data in URL params
   - Dashboard parses and displays charts

### Website Flow:

1. **User Visits Home**:
   - Sees marketing page
   - Can download extension or visit dashboard

2. **User Enters URL in Dashboard**:
   - Clicks "Optimize"
   - Opens optimized version (in production, would use extension API)
   - Displays metrics and charts

3. **User Comes from Extension**:
   - Extension redirects with data in URL
   - Dashboard parses data
   - Shows analytics for that website

---

## 🎯 Key Technologies

- **Chrome Extension**: Manifest V3, Chrome APIs
- **Network Interception**: webRequest API
- **Storage**: Chrome Storage API (local)
- **DOM Manipulation**: Content Scripts
- **React**: UI framework
- **Tailwind CSS**: Utility-first CSS
- **Recharts**: Chart library
- **Vite**: Build tool

---

## 📝 Notes

- Extension uses Manifest V3 (latest Chrome extension standard)
- Caching is per-URL with 10-minute TTL
- Metrics are stored per-URL in Chrome Storage
- All optimizations happen live on the page (no new tabs)
- Extension works like VPN - affects all websites when ON
