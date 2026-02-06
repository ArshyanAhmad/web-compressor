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
  METRICS: 'performanceMetrics',
  BASELINES: 'performanceBaselines'
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

// --- Declarative Net Request (fast blocking, MV3-friendly) ---
const DNR_RULE_IDS = {
  IMAGES: 1001,
  MEDIA: 1002,
  FONTS: 1003,
  STYLES: 1004,
  SCRIPTS: 1005, // only when CSS removal is ON (text/ultra mode)
};

async function updateDnrRules({ extensionEnabled, cssRemovalEnabled }) {
  const removeRuleIds = Object.values(DNR_RULE_IDS);
  const addRules = [];

  if (extensionEnabled) {
    // Keep our own website working
    const excluded = ['localhost', '127.0.0.1'];

    addRules.push({
      id: DNR_RULE_IDS.IMAGES,
      priority: 1,
      action: { type: 'block' },
      condition: { resourceTypes: ['image'], excludedRequestDomains: excluded },
    });
    addRules.push({
      id: DNR_RULE_IDS.MEDIA,
      priority: 1,
      action: { type: 'block' },
      condition: { resourceTypes: ['media'], excludedRequestDomains: excluded },
    });
    addRules.push({
      id: DNR_RULE_IDS.FONTS,
      priority: 1,
      action: { type: 'block' },
      condition: { resourceTypes: ['font'], excludedRequestDomains: excluded },
    });

    if (cssRemovalEnabled !== false) {
      addRules.push({
        id: DNR_RULE_IDS.STYLES,
        priority: 1,
        action: { type: 'block' },
        condition: { resourceTypes: ['stylesheet'], excludedRequestDomains: excluded },
      });

      // To get closer to the “< 50KB” goal, block scripts in CSS-removed mode.
      // This makes many sites render as plain HTML/text (which is the intended “text mode”).
      addRules.push({
        id: DNR_RULE_IDS.SCRIPTS,
        priority: 1,
        action: { type: 'block' },
        condition: { resourceTypes: ['script'], excludedRequestDomains: excluded },
      });
    }
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  } catch (e) {
    // If DNR fails (older Chrome policy), we still do DOM stripping in content script.
    console.warn('DNR update failed:', e?.message || e);
  }
}

async function broadcastStateToActiveTab(state) {
  const tab = await getCurrentTab();
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'applyState', state });
  } catch {
    // tab may not have content script (chrome:// pages etc.)
  }
}

/**
 * Get current tab URL
 */
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Cache key: url + cssRemovalEnabled so we store separate versions
 */
function cacheKey(url, cssRemovalEnabled) {
  return url + '_css_' + (cssRemovalEnabled ? '1' : '0');
}

function baselineKey(url) {
  return url;
}

/**
 * Check if URL is cached and still valid
 */
async function getCachedData(url, cssRemovalEnabled) {
  const key = cacheKey(url, cssRemovalEnabled);
  const result = await chrome.storage.local.get([STORAGE_KEYS.CACHE]);
  const cache = result[STORAGE_KEYS.CACHE] || {};

  if (cache[key] && cache[key].timestamp) {
    const age = Date.now() - cache[key].timestamp;
    if (age < CACHE_TTL) {
      return cache[key].data;
    }
    delete cache[key];
    await chrome.storage.local.set({ [STORAGE_KEYS.CACHE]: cache });
  }
  return null;
}

/**
 * Store optimized data in cache (per URL + cssRemoval state)
 */
async function setCachedData(url, data, cssRemovalEnabled) {
  const key = cacheKey(url, cssRemovalEnabled !== false);
  const result = await chrome.storage.local.get([STORAGE_KEYS.CACHE]);
  const cache = result[STORAGE_KEYS.CACHE] || {};
  cache[key] = {
    data: data,
    timestamp: Date.now()
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.CACHE]: cache });
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
 * Store baseline metrics for a URL (when extension is OFF).
 */
async function storeBaseline(url, baseline) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.BASELINES]);
  const baselines = result[STORAGE_KEYS.BASELINES] || {};
  baselines[baselineKey(url)] = {
    ...baseline,
    timestamp: Date.now()
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.BASELINES]: baselines });
}

async function getBaseline(url) {
  const result = await chrome.storage.local.get([STORAGE_KEYS.BASELINES]);
  const baselines = result[STORAGE_KEYS.BASELINES] || {};
  return baselines[baselineKey(url)] || null;
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

  if (request.action === 'setState') {
    const next = {};
    if (typeof request.extensionEnabled === 'boolean') {
      next[STORAGE_KEYS.EXTENSION_ENABLED] = request.extensionEnabled;
    }
    if (typeof request.cssRemovalEnabled === 'boolean') {
      next[STORAGE_KEYS.CSS_REMOVAL_ENABLED] = request.cssRemovalEnabled;
    }
    chrome.storage.local.set(next).then(async () => {
      const merged = await chrome.storage.local.get([
        STORAGE_KEYS.EXTENSION_ENABLED,
        STORAGE_KEYS.CSS_REMOVAL_ENABLED,
      ]);
      await updateDnrRules({
        extensionEnabled: !!merged[STORAGE_KEYS.EXTENSION_ENABLED],
        cssRemovalEnabled: merged[STORAGE_KEYS.CSS_REMOVAL_ENABLED] !== false,
      });
      await broadcastStateToActiveTab({
        extensionEnabled: !!merged[STORAGE_KEYS.EXTENSION_ENABLED],
        cssRemovalEnabled: merged[STORAGE_KEYS.CSS_REMOVAL_ENABLED] !== false,
      });
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'toggleExtension') {
    chrome.storage.local.get([STORAGE_KEYS.EXTENSION_ENABLED], async (result) => {
      const enabled = !result[STORAGE_KEYS.EXTENSION_ENABLED];
      // Default behavior: when enabling extension, CSS removal is ON.
      if (enabled) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.EXTENSION_ENABLED]: true,
          [STORAGE_KEYS.CSS_REMOVAL_ENABLED]: true,
        });
      } else {
        await chrome.storage.local.set({ [STORAGE_KEYS.EXTENSION_ENABLED]: false });
      }

      const merged = await chrome.storage.local.get([
        STORAGE_KEYS.EXTENSION_ENABLED,
        STORAGE_KEYS.CSS_REMOVAL_ENABLED,
      ]);

      const state = {
        extensionEnabled: !!merged[STORAGE_KEYS.EXTENSION_ENABLED],
        cssRemovalEnabled: merged[STORAGE_KEYS.CSS_REMOVAL_ENABLED] !== false,
      };

      await updateDnrRules(state);
      await broadcastStateToActiveTab(state);
      sendResponse({ enabled: state.extensionEnabled });
    });
    return true;
  }
  
  if (request.action === 'toggleCSSRemoval') {
    chrome.storage.local.get([STORAGE_KEYS.CSS_REMOVAL_ENABLED, STORAGE_KEYS.EXTENSION_ENABLED], async (result) => {
      const newCss = !(result[STORAGE_KEYS.CSS_REMOVAL_ENABLED] !== false);
      await chrome.storage.local.set({ [STORAGE_KEYS.CSS_REMOVAL_ENABLED]: newCss });

      const state = {
        extensionEnabled: !!result[STORAGE_KEYS.EXTENSION_ENABLED],
        cssRemovalEnabled: newCss,
      };

      await updateDnrRules(state);
      await broadcastStateToActiveTab(state);
      sendResponse({ enabled: newCss });
    });
    return true;
  }
  
  if (request.action === 'getCachedData') {
    getCachedData(request.url, request.cssRemovalEnabled).then(data => {
      sendResponse({ data });
    });
    return true;
  }

  if (request.action === 'setCachedData') {
    setCachedData(request.url, request.data, request.cssRemovalEnabled).then(() => {
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

  if (request.action === 'storeBaseline') {
    storeBaseline(request.url, request.baseline).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getBaseline') {
    getBaseline(request.url).then((baseline) => {
      sendResponse({ baseline });
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

// NOTE: Removed MV3 webRequest blocking (async storage makes it ineffective).
// We now use declarativeNetRequest rules via updateDnrRules().
