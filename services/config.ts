// Configuration for API endpoints
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Environment variable validation
const validateEnvironment = () => {
  if (isProduction) {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.error('NEXT_PUBLIC_BACKEND_URL is required in production');
    }
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      console.error('NEXT_PUBLIC_WEBSOCKET_URL is required in production');
    }
  }
};

// Backend URLs for different environments
const BACKEND_URLS = {
  development: 'http://localhost:8080',
  production: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  test: 'http://localhost:8080',
};

const WEBSOCKET_URLS = {
  development: 'ws://localhost:8080',
  production: process.env.NEXT_PUBLIC_WEBSOCKET_URL || '',
  test: 'ws://localhost:8080',
};

// Get current environment
const getCurrentEnvironment = (): 'development' | 'production' | 'test' => {
  if (process.env.NODE_ENV === 'test') return 'test';
  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
};

const currentEnv = getCurrentEnvironment();

// Validate environment on initialization
validateEnvironment();

export const API_CONFIG = {
  BASE_URL: BACKEND_URLS[currentEnv],
  WEBSOCKET_URL: WEBSOCKET_URLS[currentEnv],
  API_PREFIX: '/api',
  TIMEOUT: isDevelopment ? 15000 : 10000, // Longer timeout in development
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Feature flags
  FEATURES: {
    WEBSOCKET_ENABLED: true,
    DEBUG_MODE: isDevelopment,
    OFFLINE_SUPPORT: false,
    ANALYTICS: isProduction,
  },
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    CHAT: {
      ROOMS: '/chat/rooms',
      MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
      SEND_MESSAGE: (roomId: string) => `/chat/rooms/${roomId}/messages`,
      DM_ROOM: (friendId: string) => `/chat/rooms/dm/${friendId}`,
    },
    FRIENDS: {
      LIST: '/friends',
      REQUESTS: '/friends/requests',
      SEND_REQUEST: '/friends/requests',
      ACCEPT_REQUEST: (id: string) => `/friends/requests/${id}/accept`,
      REJECT_REQUEST: (id: string) => `/friends/requests/${id}/reject`,
      REMOVE: (id: string) => `/friends/${id}`,
    },
    USERS: {
      SEARCH: '/users/search',
      FIND: '/users/find',
    },
    FILES: {
      UPLOAD: '/files/upload',
      DOWNLOAD: (filename: string) => `/files/download/${filename}`,
      ATTACHMENTS: (messageId: string) => `/files/attachments/${messageId}`,
      DELETE_ATTACHMENT: (attachmentId: string) => `/files/attachments/${attachmentId}`,
    },
    GEMINI: {
      GENERATE: '/gemini/generate',
      BOT_RESPONSE: (botId: string) => `/gemini/bot/${botId}/response`,
      CONFIGURE: '/gemini/configure',
      TEST: '/gemini/test',
    },
    BOTS: {
      LIST: '/bots',
      CREATE: '/bots',
      DELETE: (id: string) => `/bots/${id}`,
    },
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: 'chitchat_token',
    USER: 'chitchat_user',
    PREFERENCES: 'chitchat_preferences',
    CHAT_DRAFT: 'chitchat_chat_draft',
  },
};

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  if (!baseUrl) {
    console.error('Base URL is not configured');
    return endpoint;
  }
  
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullPath = `${cleanBase}${API_CONFIG.API_PREFIX}${cleanEndpoint}`;
  
  if (API_CONFIG.FEATURES.DEBUG_MODE) {
    console.debug('API URL:', fullPath);
  }
  
  return fullPath;
};

export const getWebSocketUrl = (endpoint: string = ''): string => {
  const baseUrl = API_CONFIG.WEBSOCKET_URL;
  if (!baseUrl) {
    console.error('WebSocket URL is not configured');
    return '';
  }
  
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cleanBase}${cleanEndpoint}`;
};

export const isApiConfigValid = (): boolean => {
  const hasBaseUrl = !!API_CONFIG.BASE_URL;
  const hasWebSocketUrl = !!API_CONFIG.WEBSOCKET_URL;
  
  if (!hasBaseUrl) {
    console.error('API base URL is not configured');
  }
  
  if (!hasWebSocketUrl && API_CONFIG.FEATURES.WEBSOCKET_ENABLED) {
    console.error('WebSocket URL is not configured but WebSocket is enabled');
  }
  
  return hasBaseUrl && (hasWebSocketUrl || !API_CONFIG.FEATURES.WEBSOCKET_ENABLED);
};

// Log configuration in development
if (API_CONFIG.FEATURES.DEBUG_MODE) {
  console.log('API Configuration:', {
    environment: currentEnv,
    baseUrl: API_CONFIG.BASE_URL,
    websocketUrl: API_CONFIG.WEBSOCKET_URL,
    features: API_CONFIG.FEATURES,
  });
}

export default API_CONFIG;
