/**
 * HTML Optimizer Service
 * 
 * Parses HTML and removes:
 * - CSS (stylesheets and inline styles)
 * - Images (empties src, keeps alt text)
 * - Videos and iframes
 * - Fonts
 * - Keeps HTML structure and text content
 */

import * as cheerio from 'cheerio';

/**
 * Optimize HTML by removing specified content
 * @param {string} html - Original HTML
 * @param {Object} options - Optimization options
 * @returns {Promise<{html: string, imagesRemoved: number, cssRemoved: number, videosRemoved: number, fontsRemoved: number}>}
 */
export async function optimizeHTML(html, options = {}) {
  const {
    removeCSS = true,
    removeImages = true,
    removeVideos = true,
    removeFonts = true
  } = options;

  let $ = cheerio.load(html);
  
  let imagesRemoved = 0;
  let cssRemoved = 0;
  let videosRemoved = 0;
  let fontsRemoved = 0;

  // Remove CSS
  if (removeCSS) {
    // Remove <link> stylesheets
    $('link[rel="stylesheet"]').each((i, el) => {
      cssRemoved++;
      $(el).remove();
    });

    // Remove <style> tags
    $('style').each((i, el) => {
      cssRemoved++;
      $(el).remove();
    });

    // Remove inline styles
    $('*').each((i, el) => {
      if ($(el).attr('style')) {
        $(el).removeAttr('style');
      }
    });

    // Add system font CSS
    $('head').append(`
      <style>
        * {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      </style>
    `);
  }

  // Remove/optimize images
  if (removeImages) {
    $('img').each((i, el) => {
      imagesRemoved++;
      const $img = $(el);
      const alt = $img.attr('alt') || 'Image';
      const originalSrc = $img.attr('src');
      
      // Store original src in data attribute
      if (originalSrc) {
        $img.attr('data-original-src', originalSrc);
      }
      
      // Empty src
      $img.attr('src', '');
      
      // Add placeholder styling
      $img.attr('style', `
        background-color: #f0f0f0;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 12px;
        border: 1px dashed #ccc;
      `);
      
      // Show alt text or placeholder
      $img.text(`[Image: ${alt}]`);
    });

    // Remove background images
    $('*').each((i, el) => {
      const style = $(el).attr('style') || '';
      if (style.includes('background-image') || style.includes('backgroundImage')) {
        $(el).css('background-image', 'none');
        $(el).css('background-color', '#f0f0f0');
      }
    });
  }

  // Remove videos
  if (removeVideos) {
    $('video').each((i, el) => {
      videosRemoved++;
      $(el).remove();
    });

    // Remove video iframes (YouTube, Vimeo, etc.)
    $('iframe').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('youtube') || src.includes('vimeo') || src.includes('video')) {
        videosRemoved++;
        $(el).remove();
      }
    });
  }

  // Remove fonts
  if (removeFonts) {
    // Remove font link tags
    $('link[href*=".woff"], link[href*=".woff2"], link[href*=".ttf"], link[href*=".otf"], link[href*=".eot"]').each((i, el) => {
      fontsRemoved++;
      $(el).remove();
    });

    // Remove @font-face from style tags (already removed if CSS removal is on)
    $('style').each((i, el) => {
      let content = $(el).html() || '';
      if (content.includes('@font-face')) {
        content = content.replace(/@font-face\s*\{[^}]*\}/g, '');
        $(el).html(content);
      }
    });
  }

  // Clean up empty elements (optional)
  $('script').remove(); // Remove scripts for security and performance
  $('noscript').remove();

  // Ensure proper HTML structure
  if (!$('html').length) {
    html = `<html><head><meta charset="UTF-8"><title>Optimized Page</title></head><body>${html}</body></html>`;
    $ = cheerio.load(html);
  }

  return {
    html: $.html(),
    imagesRemoved,
    cssRemoved,
    videosRemoved,
    fontsRemoved
  };
}
