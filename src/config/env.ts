/**
 * Environment Configuration (Next.js)
 * 
 * Uses NEXT_PUBLIC_* variables. All values are read at build time by Next.js.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.collegepaglu.com/api/v1';

const CDN_URL = (
  process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.collegepaglu.com'
).replace(/\/+$/, '');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const env = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_STAGING: false,

  API_BASE_URL,
  R2_PUBLIC_URL: CDN_URL,

  // Timeouts
  API_TIMEOUT: IS_PRODUCTION ? 15000 : 20000,
  UPLOAD_TIMEOUT: 90000,

  // Retry
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 500,

  // Feature flags
  ENABLE_DEBUG_LOGS: IS_DEVELOPMENT,
  ENABLE_API_LOGS: IS_DEVELOPMENT,
  ENABLE_PERFORMANCE_MONITORING: IS_PRODUCTION,

  // Platform
  PLATFORM: 'web' as const,
  IS_ANDROID: false,
  IS_IOS: false,
  IS_WEB: true,

  APP_NAME: 'CollegePaglu',
  APP_VERSION: '2.0.0',
  APP_SCHEME: 'collegepaglu',
} as const;

export default env;
