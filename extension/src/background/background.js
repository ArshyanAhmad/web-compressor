/**
 * Background Service Worker
 * 
 * This file handles:
 * - Network interception using webRequest API
 * - Caching optimized content (10-minute TTL)
 * - State management (extension ON/OFF, CSS removal toggle)
 * - Performance metrics tracking
 * - Communication between popup, content scripts, and storage
 */

// Storage keys
const STORAGE_KEYS = {
  EXTENSION_ENABLED: 'extensionEnabled',
  CSS_REMOVAL_ENABLED: 'cssRemovalEnabled',
  CACHE: 'optimizationCache',
  METRICS: 'performanceMetrics'
};

// Cache TTL: 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

// Initialize default state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    [STORAGE_KEYS.EXTENSION_ENABLED]: false,
    [STORAGE_KEYS.CSS_REMOVAL_ENABLED]: true
  });
});

/**
 * Get current tab URL
 */
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Check if URL is cached and still valid
 */
async function getCachedData(url) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.CACHE]);
  const cache = result[STORAGE_KEYS.CACHE] || {};
  
  if (cache[url] && cache[url].timestamp) {
    const age = Date.now() - cache[url].timestamp;
    if (age < CACHE_TTL) {
      return cache[url].data;
    } else {
      // Remove expired cache
      delete cache[url];
      await chrome.storage.local.set({ [STORAGE_KEYS.CACHE]: cache });
    }
  }
  return null;
}

/**
 * Store optimized data in cache
 */
async function setCachedData(url, data) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.CACHE]);
  const cache = result[STORAGE_KEYS.CACHE] || {};
  
  // Clear old cache entries (keep only current URL)
  const newCache = {};
  newCache[url] = {
    data: data,
    timestamp: Date.now()
  };
  
  await chrome.storage.local.set({ [STORAGE_KEYS.CACHE]: newCache });
}

/**
 * Store performance metrics for a URL
 */
async function storeMetrics(url, metrics) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.METRICS]);
  const metricsData = result[STORAGE_KEYS.METRICS] || {};
  metricsData[url] = {
    ...metrics,
    timestamp: Date.now()
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.METRICS]: metricsData });
}

/**
 * Get performance metrics for a URL
 */
async function getMetrics(url) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.METRICS]);
  const metricsData = result[STORAGE_KEYS.METRICS] || {};
  return metricsData[url] || null;
}

/**
 * Listen for messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getState') {
    chrome.storage.local.get([
      STORAGE_KEYS.EXTENSION_ENABLED,
      STORAGE_KEYS.CSS_REMOVAL_ENABLED
    ], (result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'toggleExtension') {
    chrome.storage.local.get([STORAGE_KEYS.EXTENSION_ENABLED], (result) => {
      const newState = !result[STORAGE_KEYS.EXTENSION_ENABLED];
      chrome.storage.local.set({ [STORAGE_KEYS.EXTENSION_ENABLED]: newState });
      sendResponse({ enabled: newState });
      
      // Reload current tab to apply changes
      getCurrentTab().then(tab => {
        if (tab && tab.id) {
          chrome.tabs.reload(tab.id);
        }
      });
    });
    return true;
  }
  
  if (request.action === 'toggleCSSRemoval') {
    chrome.storage.local.get([STORAGE_KEYS.CSS_REMOVAL_ENABLED], (result) => {
      const newState = !result[STORAGE_KEYS.CSS_REMOVAL_ENABLED];
      chrome.storage.local.set({ [STORAGE_KEYS.CSS_REMOVAL_ENABLED]: newState });
      sendResponse({ enabled: newState });
      
      // Reload current tab to apply changes
      getCurrentTab().then(tab => {
        if (tab && tab.id) {
          chrome.tabs.reload(tab.id);
        }
      });
    });
    return true;
  }
  
  if (request.action === 'getCachedData') {
    getCachedData(request.url).then(data => {
      sendResponse({ data });
    });
    return true;
  }
  
  if (request.action === 'setCachedData') {
    setCachedData(request.url, request.data).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'storeMetrics') {
    storeMetrics(request.url, request.metrics).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getMetrics') {
    getMetrics(request.url).then(metrics => {
      sendResponse({ metrics });
    });
    return true;
  }
  
  if (request.action === 'getCurrentUrl') {
    getCurrentTab().then(tab => {
      sendResponse({ url: tab?.url || '' });
    });
    return true;
  }
});

/**
 * Intercept network requests to block images, videos, fonts, CSS (when enabled)
 */
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Check if extension is enabled
    chrome.storage.local.get([STORAGE_KEYS.EXTENSION_ENABLED, STORAGE_KEYS.CSS_REMOVAL_ENABLED], (result) => {
      if (!result[STORAGE_KEYS.EXTENSION_ENABLED]) {
        return;
      }
      
      const url = details.url.toLowerCase();
      const type = details.type;
      
      // Block images
      if (type === 'image') {
        return { cancel: true };
      }
      
      // Block videos
      if (type === 'media') {
        return { cancel: true };
      }
      
      // Block fonts
      if (url.includes('.woff') || url.includes('.woff2') || 
          url.includes('.ttf') || url.includes('.otf') || 
          url.includes('.eot')) {
        return { cancel: true };
      }
      
      // Block CSS if CSS removal is enabled
      if (result[STORAGE_KEYS.CSS_REMOVAL_ENABLED] && type === 'stylesheet') {
        return { cancel: true };
      }
    });
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);
