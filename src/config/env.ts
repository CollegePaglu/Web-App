/**
 * Environment Configuration
 * 
 * Centralized environment variable management with type safety.
 * Supports development, staging, and production environments.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Environment detection
const ENV = (process.env.NODE_ENV || 'development') as string;
const IS_PRODUCTION = ENV === 'production';
const IS_DEVELOPMENT = ENV === 'development';

/**
 * Expo/RN often bundles with NODE_ENV=production while you are still on a dev client (__DEV__=true).
 * Without this, API_BASE_URL falls through to production URLs and you keep seeing prod feed.
 */
const IS_EXPO_DEV_CLIENT = typeof __DEV__ !== 'undefined' && __DEV__;

const urlProfile: keyof typeof API_URLS = IS_EXPO_DEV_CLIENT
  ? 'development'
  : ENV === 'staging'
    ? 'staging'
    : ENV === 'production'
      ? 'production'
      : 'development';

// API URLs per environment (development → LAN backend; override anytime with EXPO_PUBLIC_API_BASE_URL)
const API_URLS = {
  development: `https://api.collegepaglu.com/api/v1`,
  staging: `https://api.collegepaglu.com/api/v1`,
  production: `https://api.collegepaglu.com/api/v1`,
} as const;

// Public CDN for R2 object keys (development must match Backend R2_PUBLIC_URL / CDN_URL)
const R2_URLS = {
  development: 'https://cdn.collegepaglu.com',
  staging: 'https://cdn.collegepaglu.com',
  production: 'https://cdn.collegepaglu.com',
} as const;

/** Expo injects EXPO_PUBLIC_* at bundle time when set in .env */
const expoApiBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const expoR2Base = process.env.EXPO_PUBLIC_R2_PUBLIC_URL?.trim();

/**
 * Application Environment Configuration
 */
export const env = {
  // Environment flags
  NODE_ENV: ENV as 'development' | 'staging' | 'production',
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_STAGING: ENV === 'staging',

  API_BASE_URL: expoApiBase || API_URLS[urlProfile] || API_URLS.development,
  R2_PUBLIC_URL: (expoR2Base || R2_URLS[urlProfile] || R2_URLS.development).replace(
    /\/+$/,
    ''
  ),

  // Timeouts (in milliseconds)
  API_TIMEOUT: IS_PRODUCTION && !IS_EXPO_DEV_CLIENT ? 15000 : 20000,
  UPLOAD_TIMEOUT: 90000, // 90s for uploads

  // Retry configuration
  MAX_RETRIES: 2,  // Allow 2 retries on timeout
  RETRY_DELAY_MS: 500,  // 500ms delay between retries

  // Feature flags (__DEV__ keeps logs on even when NODE_ENV is production in the bundle)
  ENABLE_DEBUG_LOGS: IS_EXPO_DEV_CLIENT || !IS_PRODUCTION,
  ENABLE_API_LOGS: IS_EXPO_DEV_CLIENT || !IS_PRODUCTION,
  ENABLE_PERFORMANCE_MONITORING: IS_PRODUCTION && !IS_EXPO_DEV_CLIENT,

  // Platform info
  PLATFORM: Platform.OS,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',
  IS_WEB: Platform.OS === 'web',

  // App info from Expo Constants
  APP_NAME: Constants.expoConfig?.name || 'AppV1',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  APP_SCHEME: Constants.expoConfig?.scheme || 'appv1',
} as const;

/**
 * Development logging
 */
if (env.ENABLE_DEBUG_LOGS) {
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV (bundle): ${env.NODE_ENV}`);
  console.log(`   Dev client (__DEV__): ${IS_EXPO_DEV_CLIENT}`);
  console.log(`   API URL: ${env.API_BASE_URL}`);
  console.log(`   Platform: ${env.PLATFORM}`);
}

export default env;
