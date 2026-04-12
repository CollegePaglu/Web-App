/**
 * Application Constants
 * 
 * Centralized constants for the entire application.
 */

// Secure Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  LAST_ACTIVE_TIMESTAMP: 'last_active_timestamp',
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  /** Number of days of inactivity before the user must re-login */
  EXPIRY_DAYS: 7,
} as const;

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Codes (matching backend)
export const ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  RATE_LIMITED: 'RATE_LIMITED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 60,
  EXPIRY_SECONDS: 300,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Debounce/Throttle Delays (ms)
export const DELAYS = {
  DEBOUNCE_INPUT: 300,
  DEBOUNCE_SEARCH: 500,
  THROTTLE_SCROLL: 100,
} as const;
