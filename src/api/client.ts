/**
 * API Client
 * 
 * Production-grade Axios client with:
 * - Request/Response interceptors
 * - Automatic token injection
 * - Token refresh on 401
 * - Retry logic for network errors
 * - Request/Response logging (dev only)
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { env } from '@/config/env';
import { isPublicEndpoint } from './endpoints';
import { ApiResponse, ApiException } from './types';
import { tokenStorage } from '@/utils/storage';
import { apiCircuitBreaker } from '@/utils/circuitBreaker';

// ============================================
// Types
// ============================================

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// ============================================
// Helpers
// ============================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract meaningful error info from various error types
 * Handles network errors, timeouts, axios errors, and API responses
 */
const extractErrorInfo = (error: AxiosError<ApiResponse>): {
  code: string;
  message: string;
  status: number;
  originalError?: string;
} => {
  // 1. Try to get error info from API response
  const apiErrorCode = error.response?.data?.error?.code;
  const apiErrorMessage = error.response?.data?.error?.message;

  if (apiErrorCode && apiErrorMessage) {
    return {
      code: apiErrorCode,
      message: apiErrorMessage,
      status: error.response?.status || 500,
    };
  }

  // 2. Handle specific axios error codes (network, timeout, etc)
  const axiosCode = error.code;

  switch (axiosCode) {
    case 'ECONNREFUSED':
      return {
        code: 'CONNECTION_REFUSED',
        message: 'Unable to connect to server. Please check your internet connection.',
        status: 0,
        originalError: 'ECONNREFUSED',
      };

    case 'ENOTFOUND':
      return {
        code: 'HOST_NOT_FOUND',
        message: 'Server host not found. Please check your internet connection.',
        status: 0,
        originalError: 'ENOTFOUND',
      };

    case 'ETIMEDOUT':
    case 'ECONNABORTED':
      return {
        code: 'REQUEST_TIMEOUT',
        message: 'Request timed out. Please try again.',
        status: 0,
        originalError: axiosCode,
      };

    case 'ERR_NETWORK':
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
        status: 0,
        originalError: 'ERR_NETWORK',
      };
  }

  // 3. Use HTTP status code if available
  if (error.response?.status) {
    const status = error.response.status;
    let message = error.message || 'An error occurred';

    if (status === 400) {
      message = 'Bad request. Please check your input.';
    } else if (status === 401) {
      message = 'Unauthorized. Please log in again.';
    } else if (status === 403) {
      message = 'Access forbidden.';
    } else if (status === 404) {
      message = 'Resource not found.';
    } else if (status === 429) {
      message = 'Too many requests. Please wait a moment.';
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    }

    return {
      code: `HTTP_${status}`,
      message,
      status,
    };
  }

  // 4. Default generic error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    status: 500,
  };
};

const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  const status = error.response.status;
  // Retry on timeout (0), server errors (5xx), and rate limits (429)
  return status === 0 || status >= 500 || status === 429;
};

// ============================================
// API Client Instance
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    Accept: 'application/json',
    // Note: Content-Type is set per-request, not globally
  },
});

// ============================================
// Request Interceptor
// ============================================

// Track refresh promise to prevent multiple simultaneous refreshes
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const isPublic = isPublicEndpoint(url);

    // Check circuit breaker - fail fast if backend is down
    if (!apiCircuitBreaker.canExecute()) {
      const metrics = apiCircuitBreaker.getMetrics();
      if (env.ENABLE_API_LOGS) {
        console.warn(`🚫 Circuit Breaker OPEN: Too many failures. Failing fast.`, metrics);
      }
      return Promise.reject(
        new ApiException({
          code: 'CIRCUIT_BREAKER_OPEN',
          message: 'Backend service is temporarily unavailable. Please try again in a moment.',
          status: 503,
        })
      );
    }

    // Get access token
    const accessToken = await tokenStorage.getAccessToken();

    // Add auth header if token exists
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Reject if protected endpoint without token
    if (!accessToken && !isPublic) {
      if (env.ENABLE_API_LOGS) {
        console.error('❌ No token for protected endpoint:', url);
      }
      return Promise.reject(
        new ApiException({
          code: 'NO_TOKEN',
          message: 'Authentication required. Please log in.',
          status: 401,
        })
      );
    }

    // CRITICAL: Clean up GET/DELETE requests - ensure absolutely no body is sent
    const method = config.method?.toLowerCase();
    if (method === 'get' || method === 'delete' || method === 'head' || method === 'options') {
      // Completely remove data to prevent any body from being sent
      config.data = undefined;
      // Remove Content-Type header (not needed for requests without body)
      // Use AxiosHeaders .delete() method (Axios v1+ uses a special headers class)
      if (config.headers) {
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
        } else {
          delete (config.headers as any)['Content-Type'];
          delete (config.headers as any)['content-type'];
        }
      }
      // Prevent Axios transformRequest from re-serializing anything
      config.transformRequest = [(data: any) => data];
    }

    // Handle FormData - let the platform set Content-Type with boundary
    // In React Native, we explicitly set 'multipart/form-data' and Axios adds the boundary
    if (config.data instanceof FormData) {
      // Only delete Content-Type if it's NOT already set to multipart/form-data
      // (deleting it in React Native can cause issues with boundary not being set)
      const currentContentType = config.headers?.['Content-Type'] || config.headers?.['content-type'];
      if (currentContentType && typeof currentContentType === 'string' && !currentContentType.includes('multipart/form-data')) {
        if (config.headers) {
          delete config.headers['Content-Type'];
        }
      }
    }

    // Debug logging
    if (env.ENABLE_API_LOGS) {
      console.log('🔵 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${url}`,
        hasAuth: !!accessToken,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Record success in circuit breaker
    apiCircuitBreaker.recordSuccess();

    if (env.ENABLE_API_LOGS) {
      console.log('🟢 API Response:', {
        status: response.status,
        url: response.config.url,
        circuitState: apiCircuitBreaker.getState(),
      });
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as RetryConfig;
    const errorInfo = extractErrorInfo(error);

    // Log error details with proper info
    if (env.ENABLE_API_LOGS) {
      // Distinguish between different error types for debugging
      if (error.response) {
        // Server responded with error status
        console.error('🔴 API Error (Server Response):', {
          code: errorInfo.code,
          message: errorInfo.message,
          status: error.response.status,
          url: originalRequest?.url,
          method: originalRequest?.method?.toUpperCase(),
          responseData: error.response.data,
          circuitState: apiCircuitBreaker.getState(),
        });
      } else if (error.request) {
        // Request was made but no response received (NETWORK_ERROR)
        console.error('🔴 API Error (No Response - NETWORK ERROR):', {
          code: errorInfo.code,
          message: errorInfo.message,
          url: originalRequest?.url,
          baseURL: originalRequest?.baseURL,
          method: originalRequest?.method?.toUpperCase(),
          axiosCode: error.code,
          timeout: originalRequest?.timeout,
          circuitState: apiCircuitBreaker.getState(),
          hint: 'Check: 1) Backend running? 2) Correct IP? 3) Firewall? 4) Android cleartext enabled?',
        });
      } else {
        // Error in request setup
        console.error('🔴 API Error (Request Setup):', {
          code: errorInfo.code,
          message: error.message,
          url: originalRequest?.url,
          circuitState: apiCircuitBreaker.getState(),
        });
      }
    }

    // Only record failure in circuit breaker for actual server errors or auth issues
    // Don't count transient network timeouts which are usually temporary
    const shouldRecordFailure =
      error.response?.status === 401 ||  // Auth failures are real
      error.response?.status === 403 ||  // Forbidden is real
      (error.response?.status ?? 0) >= 500 ||   // Server errors are real
      errorInfo.code === 'CIRCUIT_BREAKER_OPEN'; // Already rejected by CB

    if (shouldRecordFailure) {
      apiCircuitBreaker.recordFailure();
    }

    const errorData = error.response?.data;

    // Handle session invalidation
    const isSessionInvalidated =
      errorData?.error?.code === 'INVALID_TOKEN' &&
      errorData?.error?.message === 'Session has been invalidated';

    if (isSessionInvalidated) {
      console.error('❌ Session invalidated. Clearing tokens.');
      await tokenStorage.clearAll();
      return Promise.reject(
        new ApiException({
          code: 'SESSION_INVALIDATED',
          message: 'Your session has been invalidated. Please log in again.',
          status: 401,
        })
      );
    }

    // Handle 401 - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          // No refresh token - clear and reject
          await tokenStorage.clearAll();
          return Promise.reject(
            new ApiException({
              code: 'NO_REFRESH_TOKEN',
              message: 'Session expired. Please log in again.',
              status: 401,
            })
          );
        }

        // If refresh is already in progress, wait for it
        if (refreshPromise) {
          const newAccessToken = await refreshPromise;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        }

        // Start new refresh
        refreshPromise = (async () => {
          try {
            const response = await axios.post(
              `${env.API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            const payload = response.data.data;
            const { accessToken, refreshToken: newRefreshToken } = payload;
            await tokenStorage.setAccessToken(accessToken);
            // Backend rotates refresh JWT on each refresh; persist it so the 7d window
            // slides for active users (otherwise the original refresh expires on day 7).
            if (newRefreshToken) {
              await tokenStorage.setRefreshToken(newRefreshToken);
            }

            if (env.ENABLE_API_LOGS) {
              console.log('✅ Token refreshed successfully');
            }

            return accessToken;
          } finally {
            refreshPromise = null;
          }
        })();

        const newAccessToken = await refreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens
        await tokenStorage.clearAll();
        console.error('❌ Token refresh failed:', refreshError);
        return Promise.reject(
          new ApiException({
            code: 'REFRESH_FAILED',
            message: 'Session expired. Please log in again.',
            status: 401,
          })
        );
      }
    }

    // Handle retryable errors (network errors, server errors, rate limits)
    if (isRetryableError(error) && originalRequest) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= env.MAX_RETRIES) {
        // Calculate delay (exponential backoff for rate limits)
        let delayMs = env.RETRY_DELAY_MS * originalRequest._retryCount;
        if (error.response?.status === 429) {
          delayMs = Math.min(5000 * originalRequest._retryCount, 15000);
        }

        if (env.ENABLE_API_LOGS) {
          console.log(
            `🔄 Retrying (${originalRequest._retryCount}/${env.MAX_RETRIES}) after ${delayMs}ms`
          );
        }

        await delay(delayMs);
        return apiClient(originalRequest);
      }
    }

    // Transform to ApiException
    return Promise.reject(
      new ApiException({
        code: errorInfo.code,
        message: errorInfo.message,
        status: errorInfo.status,
        details: errorData?.error?.details,
      })
    );
  }
);

export default apiClient;
