/**
 * PageSpeed Insights service (Google PSI).
 *
 * Note: Works without an API key but is rate-limited.
 * If you set PAGESPEED_API_KEY in env, it will use it.
 */

import axios from 'axios';

export async function runPageSpeed(url, strategy = 'mobile') {
  const key = process.env.PAGESPEED_API_KEY;
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  const params = {
    url,
    strategy,
  };
  if (key) params.key = key;

  const res = await axios.get(endpoint, { params, timeout: 30000 });
  const data = res.data;

  const lighthouse = data?.lighthouseResult;
  const categories = lighthouse?.categories;
  const audits = lighthouse?.audits;

  const perfScore = categories?.performance?.score;

  const pick = (id) => audits?.[id]?.displayValue ?? null;
  const pickNum = (id) => audits?.[id]?.numericValue ?? null;

  return {
    url,
    strategy,
    performanceScore: perfScore != null ? Math.round(perfScore * 100) : null,
    metrics: {
      fcpMs: pickNum('first-contentful-paint'),
      lcpMs: pickNum('largest-contentful-paint'),
      tbtMs: pickNum('total-blocking-time'),
      cls: pickNum('cumulative-layout-shift'),
      siMs: pickNum('speed-index'),
    },
    display: {
      fcp: pick('first-contentful-paint'),
      lcp: pick('largest-contentful-paint'),
      tbt: pick('total-blocking-time'),
      cls: pick('cumulative-layout-shift'),
      si: pick('speed-index'),
    },
  };
}

