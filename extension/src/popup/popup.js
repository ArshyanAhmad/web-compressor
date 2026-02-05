/**
 * Popup Script
 * 
 * This file handles:
 * - UI interactions (toggles, buttons)
 * - State synchronization with background script
 * - Displaying current website info
 * - Showing performance metrics
 * - Redirecting to website with analytics data
 */

// DOM Elements
const mainToggle = document.getElementById('mainToggle');
const cssToggle = document.getElementById('cssToggle');
const cssToggleContainer = document.getElementById('cssToggleContainer');
const currentUrlElement = document.getElementById('currentUrl');
const metricsSection = document.getElementById('metricsSection');
const getFullInfoBtn = document.getElementById('getFullInfoBtn');

// Metric elements
const loadTimeBefore = document.getElementById('loadTimeBefore');
const loadTimeAfter = document.getElementById('loadTimeAfter');
const sizeBefore = document.getElementById('sizeBefore');
const sizeAfter = document.getElementById('sizeAfter');
const imagesRemoved = document.getElementById('imagesRemoved');
const performanceGain = document.getElementById('performanceGain');

let currentUrl = '';
let currentMetrics = null;

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format milliseconds to readable time
 */
function formatTime(ms) {
  if (ms < 1000) return Math.round(ms) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

/**
 * Get current tab URL
 */
async function getCurrentUrl() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getCurrentUrl' }, (response) => {
      resolve(response?.url || '');
    });
  });
}

/**
 * Load extension state
 */
function loadState() {
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response) {
      mainToggle.checked = response.extensionEnabled || false;
      cssToggle.checked = response.cssRemovalEnabled !== false; // Default true
      
      // Show CSS toggle only if extension is enabled
      cssToggleContainer.style.display = mainToggle.checked ? 'flex' : 'none';
      getFullInfoBtn.style.display = mainToggle.checked ? 'block' : 'none';
    }
  });
}

/**
 * Load current website info and metrics
 */
async function loadWebsiteInfo() {
  currentUrl = await getCurrentUrl();
  
  if (currentUrl) {
    try {
      const urlObj = new URL(currentUrl);
      currentUrlElement.textContent = urlObj.hostname;
    } catch (e) {
      currentUrlElement.textContent = currentUrl.substring(0, 30) + '...';
    }
    
    // Load metrics
    chrome.runtime.sendMessage({
      action: 'getMetrics',
      url: currentUrl
    }, (response) => {
      if (response && response.metrics) {
        currentMetrics = response.metrics;
        displayMetrics(response.metrics);
      }
    });
  } else {
    currentUrlElement.textContent = 'No active tab';
  }
}

/**
 * Display performance metrics
 */
function displayMetrics(metrics) {
  if (!metrics || !mainToggle.checked) {
    metricsSection.style.display = 'none';
    return;
  }
  
  metricsSection.style.display = 'block';
  
  // Load time
  if (metrics.beforeLoadTime && metrics.afterLoadTime) {
    loadTimeBefore.textContent = formatTime(metrics.beforeLoadTime);
    loadTimeAfter.textContent = formatTime(metrics.afterLoadTime);
  } else {
    loadTimeBefore.textContent = '-';
    loadTimeAfter.textContent = '-';
  }
  
  // Size
  if (metrics.beforeSize && metrics.afterSize) {
    sizeBefore.textContent = formatBytes(metrics.beforeSize);
    sizeAfter.textContent = formatBytes(metrics.afterSize);
  } else {
    sizeBefore.textContent = '-';
    sizeAfter.textContent = '-';
  }
  
  // Images removed
  imagesRemoved.textContent = metrics.imagesRemoved || 0;
  
  // Performance gain
  if (metrics.beforeLoadTime && metrics.afterLoadTime) {
    const gain = ((metrics.beforeLoadTime - metrics.afterLoadTime) / metrics.beforeLoadTime * 100).toFixed(1);
    performanceGain.textContent = gain + '%';
  } else {
    performanceGain.textContent = '0%';
  }
}

/**
 * Toggle extension ON/OFF
 */
mainToggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggleExtension' }, (response) => {
    if (response) {
      cssToggleContainer.style.display = response.enabled ? 'flex' : 'none';
      getFullInfoBtn.style.display = response.enabled ? 'block' : 'none';
      
      if (!response.enabled) {
        metricsSection.style.display = 'none';
      } else {
        // Reload metrics after enabling
        setTimeout(() => {
          loadWebsiteInfo();
        }, 1000);
      }
    }
  });
});

/**
 * Toggle CSS removal
 */
cssToggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggleCSSRemoval' }, (response) => {
    // State updated, page will reload automatically
  });
});

/**
 * Get Full Info button - redirect to website with analytics
 */
getFullInfoBtn.addEventListener('click', () => {
  if (currentUrl && currentMetrics) {
    // Encode data for URL
    const data = {
      url: currentUrl,
      metrics: currentMetrics,
      timestamp: Date.now()
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const websiteUrl = `http://localhost:5173/dashboard?data=${encodedData}`;
    
    chrome.tabs.create({ url: websiteUrl });
  } else {
    // Just open dashboard without data
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
  }
});

// Initialize popup
loadState();
loadWebsiteInfo();

// Refresh metrics every 2 seconds when extension is enabled
setInterval(() => {
  if (mainToggle.checked) {
    loadWebsiteInfo();
  }
}, 2000);
