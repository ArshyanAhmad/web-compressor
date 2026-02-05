/**
 * Content Script
 * 
 * This file runs on every webpage and handles:
 * - DOM manipulation to remove/optimize elements
 * - Image src removal (keeping alt text)
 * - Performance measurement (before/after)
 * - Communication with background script for caching
 * - Real-time optimization when extension is toggled
 */

let isOptimized = false;
let originalHTML = null;
let performanceMetrics = {
  before: {},
  after: {}
};

/**
 * Measure page performance
 */
function measurePerformance() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const resources = performance.getEntriesByType('resource');
  
  let totalSize = 0;
  let imageCount = 0;
  let cssCount = 0;
  let videoCount = 0;
  let fontCount = 0;
  
  resources.forEach(resource => {
    if (resource.transferSize) {
      totalSize += resource.transferSize;
    }
    
    if (resource.name.includes('.jpg') || resource.name.includes('.png') || 
        resource.name.includes('.gif') || resource.name.includes('.webp') ||
        resource.name.includes('.svg')) {
      imageCount++;
    }
    if (resource.name.includes('.css')) {
      cssCount++;
    }
    if (resource.name.includes('.mp4') || resource.name.includes('.webm')) {
      videoCount++;
    }
    if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
      fontCount++;
    }
  });
  
  return {
    loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
    totalSize: totalSize,
    imageCount: imageCount,
    cssCount: cssCount,
    videoCount: videoCount,
    fontCount: fontCount,
    resourceCount: resources.length
  };
}

/**
 * Remove images (empty src, keep alt text)
 */
function removeImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.src) {
      img.dataset.originalSrc = img.src;
      img.src = '';
      img.style.backgroundColor = '#f0f0f0';
      img.style.minHeight = '50px';
      img.style.display = 'flex';
      img.style.alignItems = 'center';
      img.style.justifyContent = 'center';
      img.style.color = '#666';
      img.style.fontSize = '12px';
      
      // Show alt text or placeholder
      if (img.alt) {
        img.textContent = `[Image: ${img.alt}]`;
      } else {
        img.textContent = '[Image removed]';
      }
    }
  });
  
  // Also handle background images
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = '#f0f0f0';
    }
  });
}

/**
 * Remove videos
 */
function removeVideos() {
  const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
  videos.forEach(video => {
    video.style.display = 'none';
  });
}

/**
 * Remove fonts (already blocked at network level, but ensure fallback)
 */
function ensureSystemFonts() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      font-family: system-ui, -apple-system, sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Optimize the page
 */
async function optimizePage() {
  if (isOptimized) return;
  
  // Store original HTML if not cached
  if (!originalHTML) {
    originalHTML = document.documentElement.innerHTML;
  }
  
  // Measure before metrics
  performanceMetrics.before = measurePerformance();
  
  // Remove images
  removeImages();
  
  // Remove videos
  removeVideos();
  
  // Ensure system fonts
  ensureSystemFonts();
  
  // Measure after metrics
  setTimeout(() => {
    performanceMetrics.after = measurePerformance();
    
    // Calculate improvements
    const improvement = {
      loadTimeReduction: performanceMetrics.before.loadTime - performanceMetrics.after.loadTime,
      sizeReduction: performanceMetrics.before.totalSize - performanceMetrics.after.totalSize,
      imagesRemoved: performanceMetrics.before.imageCount,
      cssRemoved: performanceMetrics.before.cssCount,
      videosRemoved: performanceMetrics.before.videoCount,
      fontsRemoved: performanceMetrics.before.fontCount,
      beforeLoadTime: performanceMetrics.before.loadTime,
      afterLoadTime: performanceMetrics.after.loadTime,
      beforeSize: performanceMetrics.before.totalSize,
      afterSize: performanceMetrics.after.totalSize
    };
    
    // Store metrics
    chrome.runtime.sendMessage({
      action: 'storeMetrics',
      url: window.location.href,
      metrics: improvement
    });
    
    // Cache optimized HTML
    chrome.runtime.sendMessage({
      action: 'setCachedData',
      url: window.location.href,
      data: {
        html: document.documentElement.innerHTML,
        metrics: improvement
      }
    });
  }, 1000);
  
  isOptimized = true;
}

/**
 * Restore original page
 */
function restorePage() {
  if (!isOptimized || !originalHTML) return;
  
  document.documentElement.innerHTML = originalHTML;
  isOptimized = false;
}

/**
 * Check extension state and apply optimization
 */
async function checkAndApplyOptimization() {
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response && response.extensionEnabled) {
      // Check if we have cached data
      chrome.runtime.sendMessage({
        action: 'getCachedData',
        url: window.location.href
      }, (cacheResponse) => {
        if (cacheResponse && cacheResponse.data) {
          // Use cached optimized version
          document.documentElement.innerHTML = cacheResponse.data.html;
          isOptimized = true;
          originalHTML = cacheResponse.data.html;
        } else {
          // Optimize fresh
          optimizePage();
        }
      });
    }
  });
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

// Apply optimization when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndApplyOptimization);
} else {
  checkAndApplyOptimization();
}

// Also check when extension state changes
setInterval(checkAndApplyOptimization, 1000);
