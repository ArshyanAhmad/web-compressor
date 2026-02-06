/**
 * Backend Server
 * 
 * This Express server provides:
 * - API to fetch and optimize websites
 * - HTML parsing and CSS/image removal
 * - Metrics storage and retrieval
 * - Optimized HTML serving
 * - CORS support for frontend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { optimizeHTML } from './services/optimizer.js';
import { fetchWebsite } from './services/fetcher.js';
import { calculateMetrics } from './services/metrics.js';
import { runPageSpeed } from './services/pagespeed.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Cache for optimized HTML (10 minutes TTL)
const htmlCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const metricsCache = new NodeCache({ stdTTL: 3600 }); // 1 hour for metrics

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for optimized pages
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/pagespeed?url=...&strategy=mobile|desktop
 * Fetches Google PageSpeed Insights metrics for a URL.
 */
app.get('/api/pagespeed', async (req, res) => {
  try {
    const { url, strategy = 'mobile' } = req.query;
    if (!url) return res.status(400).json({ error: 'url is required' });

    // Validate URL
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const result = await runPageSpeed(targetUrl.href, strategy);
    res.json(result);
  } catch (error) {
    console.error('PageSpeed error:', error?.message || error);
    res.status(500).json({ error: 'Failed to run PageSpeed', message: error.message });
  }
});

/**
 * POST /api/optimize
 * Fetches a website, optimizes it, and returns optimized HTML
 */
app.post('/api/optimize', async (req, res) => {
  try {
    const { url, removeCSS = true, removeImages = true, removeVideos = true, removeFonts = true } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check cache first
    const cacheKey = `${targetUrl.href}_${removeCSS}_${removeImages}_${removeVideos}_${removeFonts}`;
    const cached = htmlCache.get(cacheKey);
    if (cached) {
      return res.json({
        optimizedHTML: cached.html,
        metrics: cached.metrics,
        cached: true,
        url: targetUrl.href
      });
    }

    // Fetch website
    const { html, originalSize, loadTime } = await fetchWebsite(targetUrl.href);

    // Optimize HTML
    const optimizedResult = await optimizeHTML(html, {
      removeCSS,
      removeImages,
      removeVideos,
      removeFonts
    });

    // Calculate metrics
    const metrics = calculateMetrics({
      originalHTML: html,
      optimizedHTML: optimizedResult.html,
      originalSize,
      loadTime,
      imagesRemoved: optimizedResult.imagesRemoved,
      cssRemoved: optimizedResult.cssRemoved,
      videosRemoved: optimizedResult.videosRemoved,
      fontsRemoved: optimizedResult.fontsRemoved
    });

    // Cache result
    htmlCache.set(cacheKey, {
      html: optimizedResult.html,
      metrics
    });

    // Store metrics separately
    metricsCache.set(targetUrl.href, metrics);

    res.json({
      optimizedHTML: optimizedResult.html,
      metrics,
      cached: false,
      url: targetUrl.href
    });

  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({
      error: 'Failed to optimize website',
      message: error.message
    });
  }
});

/**
 * GET /api/optimize/:id
 * Get optimized HTML by ID (for serving in browser)
 */
app.get('/api/optimize/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cached = htmlCache.get(id);
    
    if (!cached) {
      return res.status(404).json({ error: 'Optimized content not found' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(cached.html);
  } catch (error) {
    console.error('Error serving optimized HTML:', error);
    res.status(500).json({ error: 'Failed to serve optimized content' });
  }
});

/**
 * POST /api/metrics
 * Store performance metrics
 */
app.post('/api/metrics', (req, res) => {
  try {
    const { url, metrics } = req.body;

    if (!url || !metrics) {
      return res.status(400).json({ error: 'URL and metrics are required' });
    }

    metricsCache.set(url, {
      ...metrics,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, url });
  } catch (error) {
    console.error('Error storing metrics:', error);
    res.status(500).json({ error: 'Failed to store metrics' });
  }
});

/**
 * GET /api/metrics/:url
 * Get metrics for a specific URL
 */
app.get('/api/metrics', (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const metrics = metricsCache.get(url);
    
    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found for this URL' });
    }

    res.json({ url, metrics });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

/**
 * GET /optimize
 * Serve optimized page directly (for opening in new tab)
 */
app.get('/optimize', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>URL parameter is required</h1>
            <p>Usage: /optimize?url=https://example.com</p>
          </body>
        </html>
      `);
    }

    // Validate URL
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      return res.status(400).send(`
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Invalid URL format</h1>
            <p>Please provide a valid URL</p>
          </body>
        </html>
      `);
    }

    // Check cache
    const cacheKey = `${targetUrl.href}_true_true_true_true`;
    const cached = htmlCache.get(cacheKey);
    
    if (cached) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(cached.html);
    }

    // Fetch and optimize
    const { html } = await fetchWebsite(targetUrl.href);
    const optimizedResult = await optimizeHTML(html, {
      removeCSS: true,
      removeImages: true,
      removeVideos: true,
      removeFonts: true
    });

    // Cache
    htmlCache.set(cacheKey, {
      html: optimizedResult.html,
      metrics: {}
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(optimizedResult.html);

  } catch (error) {
    console.error('Error optimizing page:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Failed to optimize website</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Compressor Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
