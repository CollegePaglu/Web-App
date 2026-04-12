/**
 * useAuth Hook
 * 
 * Custom hook combining auth service and store for complete auth functionality.
 * Provides a simple API for auth operations throughout the app.
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores';
import { authService } from '../api';
import { phoneValidation, otpValidation } from '@/utils/validation';
import { OTP_CONFIG } from '@/config/constants';
import { User, Tokens } from '../types';

interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  error: string | null;

  // Actions
  sendOTP: (phone: string, channel?: 'sms' | 'whatsapp') => Promise<boolean>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean; needsProfileComplete: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const {
    isAuthenticated,
    isLoading: storeLoading,
    isInitialized,
    user,
    error: storeError,
    login,
    logout: storeLogout,
    setUser,
    setError,
    clearError,
  } = useAuthStore();

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = storeLoading || localLoading;
  const error = storeError || localError;

  /**
   * Send OTP to phone number
   */
  const sendOTP = useCallback(
    async (phone: string, channel: 'sms' | 'whatsapp' = 'whatsapp'): Promise<boolean> => {
      // Validate phone
      const phoneError = phoneValidation.getErrorMessage(phone);
      if (phoneError) {
        setLocalError(phoneError);
        return false;
      }

      try {
        setLocalLoading(true);
        setLocalError(null);

        // Format phone for API
        const formattedPhone = phoneValidation.formatForApi(phone);
        await authService.sendOTP(formattedPhone, channel);

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to send OTP. Please try again.';
        setLocalError(errorMessage);
        return false;
      } finally {
        setLocalLoading(false);
      }
    },
    []
  );

  /**
   * Verify OTP and login
   */
  const verifyOTP = useCallback(
    async (
      phone: string,
      otp: string
    ): Promise<{ success: boolean; isNewUser: boolean; needsProfileComplete: boolean }> => {
      // Validate OTP
      const otpError = otpValidation.getErrorMessage(otp, OTP_CONFIG.LENGTH);
      if (otpError) {
        setLocalError(otpError);
        return { success: false, isNewUser: false, needsProfileComplete: false };
      }

      try {
        setLocalLoading(true);
        setLocalError(null);

        // Format phone for API
        const formattedPhone = phoneValidation.formatForApi(phone);
        const response = await authService.verifyOTP(formattedPhone, otp);

        // Login with tokens and user
        const tokens: Tokens = {
          accessToken: response.data.tokens?.accessToken || (response.data as any).accessToken,
          refreshToken: response.data.tokens?.refreshToken || (response.data as any).refreshToken,
        };

        await login(tokens, response.data.user);

        // Check if profile needs completion (no firstName means profile incomplete)
        const userData = response.data.user;
        const needsProfileComplete = !userData?.firstName || !userData?.lastName;

        return {
          success: true,
          isNewUser: response.data.isNewUser,
          needsProfileComplete,
        };
      } catch (err: any) {
        const errorMessage = err.message || 'Invalid OTP. Please try again.';
        setLocalError(errorMessage);
        return { success: false, isNewUser: false, needsProfileComplete: false };
      } finally {
        setLocalLoading(false);
      }
    },
    [login]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLocalLoading(true);
      await authService.logout();
      await storeLogout();
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still logout locally even if API fails
      await storeLogout();
    } finally {
      setLocalLoading(false);
    }
  }, [storeLogout]);

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      setLocalLoading(true);
      const response = await authService.fetchCurrentUser();
      setUser(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Refresh user error:', err);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [setUser]);

  /**
   * Clear all errors
   */
  const handleClearError = useCallback(() => {
    setLocalError(null);
    clearError();
  }, [clearError]);

  return {
    // State
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    error,

    // Actions
    sendOTP,
    verifyOTP,
    logout,
    refreshUser,
    clearError: handleClearError,
  };
};

export default useAuth;
