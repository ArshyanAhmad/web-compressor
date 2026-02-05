/**
 * Metrics Calculator Service
 * 
 * Calculates performance metrics from optimization results
 */

/**
 * Calculate performance metrics
 * @param {Object} data - Optimization data
 * @returns {Object} Metrics object
 */
export function calculateMetrics(data) {
  const {
    originalHTML,
    optimizedHTML,
    originalSize,
    loadTime,
    imagesRemoved = 0,
    cssRemoved = 0,
    videosRemoved = 0,
    fontsRemoved = 0
  } = data;

  const optimizedSize = Buffer.byteLength(optimizedHTML, 'utf8');
  const sizeReduction = originalSize - optimizedSize;
  const sizeReductionPercent = originalSize > 0 
    ? ((sizeReduction / originalSize) * 100).toFixed(2)
    : 0;

  // Estimate load time reduction (simplified calculation)
  // Assuming 1KB = ~1ms load time on average connection
  const estimatedLoadTimeReduction = sizeReduction / 1024; // Rough estimate
  const afterLoadTime = Math.max(loadTime - estimatedLoadTimeReduction, loadTime * 0.1); // At least 10% of original
  const loadTimeReduction = loadTime - afterLoadTime;
  const loadTimeReductionPercent = loadTime > 0
    ? ((loadTimeReduction / loadTime) * 100).toFixed(2)
    : 0;

  return {
    beforeLoadTime: loadTime,
    afterLoadTime: Math.round(afterLoadTime),
    loadTimeReduction: Math.round(loadTimeReduction),
    loadTimeReductionPercent: parseFloat(loadTimeReductionPercent),
    
    beforeSize: originalSize,
    afterSize: optimizedSize,
    sizeReduction: sizeReduction,
    sizeReductionPercent: parseFloat(sizeReductionPercent),
    
    imagesRemoved,
    cssRemoved,
    videosRemoved,
    fontsRemoved,
    
    totalResourcesRemoved: imagesRemoved + cssRemoved + videosRemoved + fontsRemoved,
    
    performanceGain: parseFloat(loadTimeReductionPercent),
    
    timestamp: new Date().toISOString()
  };
}
