/**
 * Secure Storage Utilities
 * 
 * Wrapper around expo-secure-store for token and user data management.
 * Provides type-safe access to sensitive data.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/constants';
import { User, Tokens } from '@/api/types';
import { env } from '@/config/env';

// ============================================
// Secure Storage (for sensitive data)
// ============================================

export const secureStorage = {
  /**
   * Get an item from secure storage
   */
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error reading from secure storage [${key}]:`, error);
      return null;
    }
  },

  /**
   * Set an item in secure storage
   */
  async set(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to secure storage [${key}]:`, error);
      return false;
    }
  },

  /**
   * Delete an item from secure storage
   */
  async delete(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error deleting from secure storage [${key}]:`, error);
      return false;
    }
  },
};

// ============================================
// Token Storage
// ============================================

export const tokenStorage = {
  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    const token = await secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (env.ENABLE_DEBUG_LOGS && token) {
      console.log('🔐 Access token retrieved');
    }
    return token;
  },

  /**
   * Set access token
   */
  async setAccessToken(token: string): Promise<boolean> {
    const success = await secureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    if (env.ENABLE_DEBUG_LOGS && success) {
      console.log('🔐 Access token stored');
    }
    return success;
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return secureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set refresh token
   */
  async setRefreshToken(token: string): Promise<boolean> {
    return secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Set both tokens at once
   */
  async setTokens(tokens: Tokens): Promise<boolean> {
    try {
      await Promise.all([
        this.setAccessToken(tokens.accessToken),
        this.setRefreshToken(tokens.refreshToken),
      ]);

      // Verify tokens were stored
      const [storedAccess, storedRefresh] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);

      if (!storedAccess || !storedRefresh) {
        throw new Error('Token verification failed');
      }

      if (env.ENABLE_DEBUG_LOGS) {
        console.log('✅ Tokens stored and verified');
      }

      return true;
    } catch (error) {
      console.error('Error storing tokens:', error);
      return false;
    }
  },

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.delete(STORAGE_KEYS.ACCESS_TOKEN),
      secureStorage.delete(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    if (env.ENABLE_DEBUG_LOGS) {
      console.log('🗑️ Tokens cleared');
    }
  },

  /**
   * Clear all auth-related data
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      userStorage.clearUser(),
    ]);
    if (env.ENABLE_DEBUG_LOGS) {
      console.log('🗑️ All auth data cleared');
    }
  },
};

// ============================================
// User Storage
// ============================================

export const userStorage = {
  /**
   * Get stored user data
   */
  async getUser(): Promise<User | null> {
    try {
      const json = await secureStorage.get(STORAGE_KEYS.USER_DATA);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Store user data
   */
  async setUser(user: User): Promise<boolean> {
    try {
      return await secureStorage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  },

  /**
   * Clear user data
   */
  async clearUser(): Promise<void> {
    await secureStorage.delete(STORAGE_KEYS.USER_DATA);
  },
};

// ============================================
// Last Active Timestamp Storage
// ============================================

export const lastActiveStorage = {
  /**
   * Get the last active timestamp
   */
  async get(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error reading last active timestamp:', error);
      return null;
    }
  },

  /**
   * Set the last active timestamp to now
   */
  async set(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP,
        Date.now().toString()
      );
      return true;
    } catch (error) {
      console.error('Error writing last active timestamp:', error);
      return false;
    }
  },

  /**
   * Clear the last active timestamp
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP);
      return true;
    } catch (error) {
      console.error('Error clearing last active timestamp:', error);
      return false;
    }
  },
};

// ============================================
// General Storage (for non-sensitive data)
// ============================================

export const storage = {
  /**
   * Get an item from async storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from storage [${key}]:`, error);
      return null;
    }
  },

  /**
   * Set an item in async storage
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to storage [${key}]:`, error);
      return false;
    }
  },

  /**
   * Delete an item from async storage
   */
  async delete(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error deleting from storage [${key}]:`, error);
      return false;
    }
  },

  /**
   * Clear all app storage
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};

export default {
  secure: secureStorage,
  token: tokenStorage,
  user: userStorage,
  general: storage,
};
