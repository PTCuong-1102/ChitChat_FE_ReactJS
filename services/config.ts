// Configuration for API endpoints
const isDevelopment = process.env.NODE_ENV === 'development';

// Backend URLs for different environments
const BACKEND_URLS = {
  development: 'http://localhost:8080',
  production: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-backend-url.railway.app', // Will be updated when deployed
};

export const API_CONFIG = {
  BASE_URL: isDevelopment ? BACKEND_URLS.development : BACKEND_URLS.production,
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'ws://localhost:8080' 
    : (process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://your-backend-url.railway.app'),
  ENDPOINT: '/ws',
};

export const getWebSocketUrl = () => {
  return `${WEBSOCKET_CONFIG.BASE_URL}${WEBSOCKET_CONFIG.ENDPOINT}`;
};
