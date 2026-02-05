/**
 * Configuration
 * 
 * API endpoint configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  optimize: `${API_BASE_URL}/api/optimize`,
  metrics: `${API_BASE_URL}/api/metrics`,
  optimizePage: `${API_BASE_URL}/optimize`
};
