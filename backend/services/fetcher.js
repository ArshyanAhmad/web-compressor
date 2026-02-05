/**
 * Website Fetcher Service
 * 
 * Fetches HTML content from websites
 * Handles redirects, errors, and measures load time
 */

import axios from 'axios';

/**
 * Fetch website HTML content
 * @param {string} url - Website URL to fetch
 * @returns {Promise<{html: string, originalSize: number, loadTime: number}>}
 */
export async function fetchWebsite(url) {
  const startTime = Date.now();

  try {
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      validateStatus: (status) => status < 500, // Accept all status codes < 500
      responseType: 'text'
    });

    const loadTime = Date.now() - startTime;
    const html = response.data || '';
    const originalSize = Buffer.byteLength(html, 'utf8');

    return {
      html,
      originalSize,
      loadTime,
      statusCode: response.status
    };

  } catch (error) {
    const loadTime = Date.now() - startTime;
    
    if (error.response) {
      // Server responded with error status
      const html = error.response.data || '';
      const originalSize = Buffer.byteLength(html, 'utf8');
      
      return {
        html,
        originalSize,
        loadTime,
        statusCode: error.response.status,
        error: error.message
      };
    } else if (error.request) {
      // Request made but no response
      throw new Error(`No response from server: ${error.message}`);
    } else {
      // Error setting up request
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}
