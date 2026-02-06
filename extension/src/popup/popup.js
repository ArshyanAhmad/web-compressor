/**
 * Popup – state, metrics display, and actions
 */

const mainToggle = document.getElementById('mainToggle');
const cssToggle = document.getElementById('cssToggle');
const cssToggleContainer = document.getElementById('cssToggleContainer');
const currentUrlElement = document.getElementById('currentUrl');
const metricsSection = document.getElementById('metricsSection');
const emptyState = document.getElementById('emptyState');
const getFullInfoBtn = document.getElementById('getFullInfoBtn');

const loadTimeBefore = document.getElementById('loadTimeBefore');
const loadTimeAfter = document.getElementById('loadTimeAfter');
const sizeBefore = document.getElementById('sizeBefore');
const sizeAfter = document.getElementById('sizeAfter');
const imagesRemoved = document.getElementById('imagesRemoved');
const cssRemoved = document.getElementById('cssRemoved');
const videosRemoved = document.getElementById('videosRemoved');
const fontsRemoved = document.getElementById('fontsRemoved');
const performanceGain = document.getElementById('performanceGain');
const sizeReduction = document.getElementById('sizeReduction');
const timeSaved = document.getElementById('timeSaved');

let currentUrl = '';
let currentMetrics = null;

function formatBytes(bytes) {
  if (bytes == null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function formatTime(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return Math.round(ms) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

function getCurrentUrl() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getCurrentUrl' }, (response) => {
      resolve(response?.url || '');
    });
  });
}

function loadState() {
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response) {
      mainToggle.checked = !!response.extensionEnabled;
      cssToggle.checked = response.cssRemovalEnabled !== false;
      cssToggleContainer.style.display = mainToggle.checked ? 'flex' : 'none';
      getFullInfoBtn.style.display = mainToggle.checked ? 'block' : 'none';
    }
  });
}

function setPlaceholder(el, value, fallback) {
  const v = value ?? fallback;
  el.textContent = v === '' || v == null ? '—' : String(v);
}

function displayMetrics(metrics) {
  if (!mainToggle.checked) {
    metricsSection.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  if (!metrics || (metrics.beforeLoadTime == null && metrics.beforeSize == null && !metrics.imagesRemoved && !metrics.cssRemoved)) {
    metricsSection.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  metricsSection.style.display = 'block';
  emptyState.style.display = 'none';

  const beforeLoad = metrics.beforeLoadTime;
  const afterLoad = metrics.afterLoadTime;
  const beforeSize = metrics.beforeSize;
  const afterSize = metrics.afterSize;
  const loadReduction = metrics.loadTimeReduction;
  const sizeReduc = metrics.sizeReduction;

  setPlaceholder(loadTimeBefore, beforeLoad != null ? formatTime(beforeLoad) : null, '—');
  setPlaceholder(loadTimeAfter, afterLoad != null ? formatTime(afterLoad) : null, '—');
  setPlaceholder(sizeBefore, beforeSize != null ? formatBytes(beforeSize) : null, '—');
  setPlaceholder(sizeAfter, afterSize != null ? formatBytes(afterSize) : null, '—');

  setPlaceholder(imagesRemoved, metrics.imagesRemoved, '0');
  setPlaceholder(cssRemoved, metrics.cssRemoved, '0');
  setPlaceholder(videosRemoved, metrics.videosRemoved, '0');
  setPlaceholder(fontsRemoved, metrics.fontsRemoved, '0');

  if (beforeLoad != null && afterLoad != null && beforeLoad > 0) {
    const raw = ((beforeLoad - afterLoad) / beforeLoad * 100);
    const gain = Math.max(0, raw);
    performanceGain.textContent = gain.toFixed(1) + '%';
  } else {
    performanceGain.textContent = '0%';
  }

  if (sizeReduc != null) {
    sizeReduction.textContent = formatBytes(Math.max(0, sizeReduc));
  } else {
    sizeReduction.textContent = '—';
  }

  if (loadReduction != null) {
    timeSaved.textContent = formatTime(Math.max(0, loadReduction));
  } else {
    timeSaved.textContent = '—';
  }
}

async function loadWebsiteInfo() {
  currentUrl = await getCurrentUrl();

  if (currentUrl) {
    try {
      const urlObj = new URL(currentUrl);
      currentUrlElement.textContent = urlObj.hostname;
    } catch (e) {
      currentUrlElement.textContent = currentUrl.length > 35 ? currentUrl.substring(0, 35) + '…' : currentUrl;
    }

    chrome.runtime.sendMessage({ action: 'getMetrics', url: currentUrl }, (response) => {
      if (response && response.metrics) {
        currentMetrics = response.metrics;
        displayMetrics(response.metrics);
      } else {
        displayMetrics(null);
      }
    });
  } else {
    currentUrlElement.textContent = '—';
    displayMetrics(null);
  }
}

mainToggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggleExtension' }, (response) => {
    if (response) {
      cssToggleContainer.style.display = response.enabled ? 'flex' : 'none';
      getFullInfoBtn.style.display = response.enabled ? 'block' : 'none';
      if (!response.enabled) {
        metricsSection.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        setTimeout(loadWebsiteInfo, 1200);
      }
    }
  });
});

cssToggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggleCSSRemoval' });
});

getFullInfoBtn.addEventListener('click', () => {
  const base = 'http://localhost:5173/dashboard';
  if (currentUrl && currentMetrics) {
    const data = { url: currentUrl, metrics: currentMetrics, timestamp: Date.now() };
    const q = encodeURIComponent(JSON.stringify(data));
    chrome.tabs.create({ url: base + '?data=' + q });
  } else {
    chrome.tabs.create({ url: base });
  }
});

loadState();
loadWebsiteInfo();

setInterval(() => {
  if (mainToggle.checked) loadWebsiteInfo();
}, 2500);
