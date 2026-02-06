/**
 * Content Script
 * - DOM optimization: images (empty src + alt), videos, fonts
 * - When CSS removal is on: strip all CSS from the page live and cache
 * - HTML compression (target ~50KB) when storing in cache
 * - Performance measurement and metrics
 */

const TARGET_SNAPSHOT_KB = 50;
const TARGET_SNAPSHOT_BYTES = TARGET_SNAPSHOT_KB * 1024;

let isOptimized = false;
let originalHTML = null;
let performanceMetrics = { before: {}, after: {} };

// Don't optimize our own product dashboard/website (keeps it usable)
try {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    // allow local dev pages to work normally
    // (extension still works on other websites)
    // eslint-disable-next-line no-unused-vars
    var __compressorSkip = true;
  }
} catch {}

let cssStash = {
  links: [],
  styles: [],
  inlineCount: 0,
  stashed: false,
};

function byteSize(str) {
  try {
    return new Blob([str]).size;
  } catch {
    return (str || '').length;
  }
}

function measurePerformance() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const resources = performance.getEntriesByType('resource');

  let totalSize = 0;
  let imageCount = 0;
  let cssCount = 0;
  let videoCount = 0;
  let fontCount = 0;

  resources.forEach((resource) => {
    if (resource.transferSize) totalSize += resource.transferSize;
    const name = (resource.name || '').toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/.test(name)) imageCount++;
    if (name.includes('.css') || resource.initiatorType === 'link') cssCount++;
    if (/\.(mp4|webm|ogg|mov)(\?|$)/.test(name) || name.includes('youtube') || name.includes('vimeo')) videoCount++;
    if (/\.(woff2?|ttf|otf|eot)(\?|$)/.test(name)) fontCount++;
  });

  return {
    loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
    totalSize,
    imageCount,
    cssCount,
    videoCount,
    fontCount,
    resourceCount: resources.length,
  };
}

function disableAnimations() {
  if (document.getElementById('compressor-no-anim')) return;
  const style = document.createElement('style');
  style.id = 'compressor-no-anim';
  style.textContent = `*{animation:none!important;transition:none!important;scroll-behavior:auto!important}`;
  document.head.appendChild(style);
}

function whenLoaded(cb) {
  if (document.readyState === 'complete') {
    setTimeout(cb, 0);
    return;
  }
  window.addEventListener('load', () => setTimeout(cb, 0), { once: true });
}

/**
 * Remove all CSS from the page live:
 * - link[rel="stylesheet"]
 * - style elements
 * - inline style attributes
 * Then inject minimal reset so content is readable.
 */
function removeAllCSS() {
  if (!cssStash.stashed) {
    // stash before removing so we can restore without reload
    cssStash.links = Array.from(document.querySelectorAll('link[rel=\"stylesheet\"]')).map((n) => n.cloneNode(true));
    cssStash.styles = Array.from(document.querySelectorAll('style')).map((n) => n.cloneNode(true));
    cssStash.inlineCount = 0;
    document.querySelectorAll('[style]').forEach((el) => {
      el.dataset.compressorInlineStyle = el.getAttribute('style') || '';
      cssStash.inlineCount += 1;
    });
    cssStash.stashed = true;
  }

  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => link.remove());

  // Remove preloaded fonts/styles too
  document.querySelectorAll('link[rel="preload"][as="font"], link[rel="preload"][as="style"], link[href*=".woff"], link[href*=".woff2"], link[href*=".ttf"], link[href*=".otf"], link[href*=".eot"]').forEach((l) => l.remove());

  const styles = document.querySelectorAll('style');
  styles.forEach((style) => style.remove());

  const all = document.querySelectorAll('*');
  all.forEach((el) => {
    if (el.hasAttribute('style')) el.removeAttribute('style');
  });

  const reset = document.createElement('style');
  reset.id = 'compressor-reset';
  reset.textContent = [
    '*{font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif !important;box-sizing:border-box}',
    'body{background:#fff !important;color:#111 !important;margin:0;padding:8px;line-height:1.5}',
    'img{background:#f0f0f0;min-height:40px;display:flex;align-items:center;justify-content:center;color:#666;font-size:12px;border:1px dashed #ccc}',
    'a{color:#2563eb}',
  ].join('');
  document.head.appendChild(reset);
}

function restoreAllCSS() {
  // Remove our reset
  document.getElementById('compressor-reset')?.remove();

  // Restore stylesheet links + style tags
  const head = document.head || document.documentElement;
  if (cssStash.links?.length) {
    cssStash.links.forEach((n) => head.appendChild(n.cloneNode(true)));
  }
  if (cssStash.styles?.length) {
    cssStash.styles.forEach((n) => head.appendChild(n.cloneNode(true)));
  }

  // Restore inline styles
  document.querySelectorAll('[data-compressor-inline-style]').forEach((el) => {
    const v = el.dataset.compressorInlineStyle;
    if (v != null) el.setAttribute('style', v);
    delete el.dataset.compressorInlineStyle;
  });
}

function removeImages() {
  document.querySelectorAll('img').forEach((img) => {
    if (img.src) {
      img.dataset.originalSrc = img.src;
      img.removeAttribute('src');
      img.style.cssText = 'background:#f0f0f0;min-height:50px;display:flex;align-items:center;justify-content:center;color:#666;font-size:12px;border:1px dashed #ccc';
      img.textContent = img.alt ? `[Image: ${img.alt}]` : '[Image removed]';
    }
  });

  document.querySelectorAll('*').forEach((el) => {
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = '#f0f0f0';
    }
  });
}

function removeVideos() {
  document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], [src*=".mp4"], [src*=".webm"]').forEach((el) => {
    el.remove();
  });
}

function removeHeavyElements() {
  // Replace media-heavy/interactive elements with lightweight placeholders
  document.querySelectorAll('picture, source, svg, canvas, audio, object, embed, iframe').forEach((el) => {
    // Keep iframe if it contains important text? default: remove
    el.remove();
  });
}

function ensureSystemFonts() {
  if (document.getElementById('compressor-fonts')) return;
  const style = document.createElement('style');
  style.id = 'compressor-fonts';
  style.textContent = '*{font-family:system-ui,-apple-system,sans-serif !important}';
  document.head.appendChild(style);
}

/**
 * Build a lightweight snapshot (~50KB target) for caching/reporting.
 * IMPORTANT: We do NOT truncate the live page anymore (fixes missing content + scroll).
 */
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildLightSnapshot() {
  const title = (document.title || 'Optimized').replace(/[<>]/g, '');
  const minimalCss = `body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;margin:0;padding:14px;color:#111}a{color:#2563eb}pre{white-space:pre-wrap;word-break:break-word}`;

  let text = (document.body?.innerText || '').replace(/\u0000/g, '').trim();
  if (!text) text = '(no text content)';

  let safeText = text;
  let html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>${title}</title><style>${minimalCss}</style></head><body><pre>${escapeHtml(safeText)}</pre></body></html>`;
  let bytes = byteSize(html);
  if (bytes > TARGET_SNAPSHOT_BYTES) {
    const ratio = TARGET_SNAPSHOT_BYTES / bytes;
    const nextLen = Math.max(500, Math.floor(safeText.length * ratio * 0.9));
    safeText = safeText.slice(0, nextLen);
    html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>${title}</title><style>${minimalCss}</style></head><body><pre>${escapeHtml(safeText)}</pre></body></html>`;
  }
  return { html, bytes: byteSize(html) };
}

function applyOptimizations({ removeCSS }) {
  if (removeCSS) removeAllCSS();
  else restoreAllCSS();
  disableAnimations();
  removeImages();
  removeVideos();
  removeHeavyElements();
  ensureSystemFonts();
}

function observeDynamicHeavyContent({ removeCSS }) {
  if (window.__compressorObserver) return;
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('img') || node.querySelector?.('img')) removeImages();
        if (node.matches?.('video,iframe') || node.querySelector?.('video,iframe')) removeVideos();
        if (removeCSS && (node.matches?.('style,link[rel=\"stylesheet\"]') || node.querySelector?.('style,link[rel=\"stylesheet\"]'))) {
          removeAllCSS();
        }
      }
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  window.__compressorObserver = obs;
}

function optimizePage() {
  if (isOptimized) return;

  chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
    if (!state || !state.extensionEnabled) return;

    const removeCSS = state.cssRemovalEnabled !== false;

    if (!originalHTML) {
      originalHTML = document.documentElement.outerHTML;
    }

    // Use baseline (captured when extension was OFF) for accurate before/after.
    chrome.runtime.sendMessage({ action: 'getBaseline', url: window.location.href }, (resp) => {
      const baselinePerf = resp?.baseline?.perf;
      performanceMetrics.before = baselinePerf || measurePerformance();

      applyOptimizations({ removeCSS });
      observeDynamicHeavyContent({ removeCSS });

      whenLoaded(() => {
        performanceMetrics.after = measurePerformance();
        const before = performanceMetrics.before;
        const after = performanceMetrics.after;

        const improvement = {
          loadTimeReduction: before.loadTime - after.loadTime,
          sizeReduction: before.totalSize - after.totalSize,
          imagesRemoved: before.imageCount,
          cssRemoved: removeCSS ? before.cssCount : 0,
          videosRemoved: before.videoCount,
          fontsRemoved: before.fontCount,
          beforeLoadTime: before.loadTime,
          afterLoadTime: after.loadTime,
          beforeSize: before.totalSize,
          afterSize: after.totalSize,
        };

        chrome.runtime.sendMessage({
          action: 'storeMetrics',
          url: window.location.href,
          metrics: improvement,
        });

        const snap = buildLightSnapshot();

        chrome.runtime.sendMessage({
          action: 'setCachedData',
          url: window.location.href,
          cssRemovalEnabled: removeCSS,
          data: {
            html: snap.html,
            htmlBytes: snap.bytes,
            metrics: improvement,
          },
        });
      });
    });

    isOptimized = true;
  });
}

function restorePage() {
  if (!isOptimized || !originalHTML) return;
  location.reload();
  isOptimized = false;
}

function checkAndApplyOptimization() {
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (typeof __compressorSkip !== 'undefined' && __compressorSkip) return;
    const enabled = !!response?.extensionEnabled;

    // When OFF, store baseline metrics for accurate before/after later.
    if (!enabled) {
      whenLoaded(() => {
        const perf = measurePerformance();
        chrome.runtime.sendMessage({
          action: 'storeBaseline',
          url: window.location.href,
          baseline: { perf },
        });
      });
      return;
    }

    if (document.documentElement.dataset.compressorOptimized === '1') return;
    document.documentElement.dataset.compressorOptimized = '1';
    optimizePage();
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'applyState' && request.state) {
    const st = request.state;
    if (!st.extensionEnabled) {
      // restore by reload (fast + safe) because heavy DOM changes may be present
      location.reload();
      sendResponse({ success: true });
      return;
    }
    // apply CSS toggle instantly without reload
    applyOptimizations({ removeCSS: st.cssRemovalEnabled !== false });
    sendResponse({ success: true });
    return;
  }
  if (request.action === 'optimize') {
    optimizePage();
    sendResponse({ success: true });
  } else if (request.action === 'restore') {
    restorePage();
    sendResponse({ success: true });
  } else if (request.action === 'getMetrics') {
    sendResponse({ metrics: performanceMetrics });
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndApplyOptimization);
} else {
  checkAndApplyOptimization();
}

// IMPORTANT: stop polling (polling breaks typing/scroll on many sites).

// If website dashboard opened this page with ?compressor=1, auto-enable extension settings.
try {
  const params = new URLSearchParams(location.search);
  if (params.get('compressor') === '1') {
    const css = params.get('css');
    chrome.runtime.sendMessage({
      action: 'setState',
      extensionEnabled: true,
      cssRemovalEnabled: css == null ? true : css === '1',
    }, () => setTimeout(checkAndApplyOptimization, 50));
  }
} catch {}
