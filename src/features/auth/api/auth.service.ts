/**
 * Auth Service
 * 
 * API calls for authentication matching the backend.
 */

import { apiClient, API_ENDPOINTS, ApiResponse } from '@/api';
import { tokenStorage, userStorage } from '@/utils/storage';
import { env } from '@/config/env';
import { AuthResponse, SendOTPResponse, RefreshTokenResponse, Tokens, User } from '../types';

export const authService = {
  /**
   * Send OTP to phone number
   */
  async sendOTP(
    phone: string,
    channel: 'sms' | 'whatsapp' = 'whatsapp'
  ): Promise<ApiResponse<SendOTPResponse>> {
    if (env.ENABLE_API_LOGS) {
      console.log('📤 Sending OTP to:', phone, 'via', channel);
    }

    const response = await apiClient.post<ApiResponse<SendOTPResponse>>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      { phone, channel }
    );

    if (env.ENABLE_API_LOGS) {
      console.log('✅ OTP sent successfully');
    }

    return response.data;
  },

  /**
   * Verify OTP and login/register
   */
  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    if (env.ENABLE_API_LOGS) {
      console.log('📤 Verifying OTP for:', phone);
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { phone, otp }
    );

    const { data } = response.data;

    // Extract tokens (handle both formats from backend)
    const tokens: Tokens = {
      accessToken: data.tokens?.accessToken || (data as any).accessToken,
      refreshToken: data.tokens?.refreshToken || (data as any).refreshToken,
    };

    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error('No tokens received from server');
    }

    // Store tokens securely
    await tokenStorage.setTokens(tokens);

    // Store user data
    if (data.user) {
      await userStorage.setUser(data.user);
    }

    if (env.ENABLE_API_LOGS) {
      console.log('✅ OTP verified, tokens stored');
      console.log('👤 User:', data.user?.name || 'New user');
      console.log('🆕 Is new user:', data.isNewUser);
    }

    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefresh } = response.data.data;
    if (accessToken) {
      await tokenStorage.setAccessToken(accessToken);
    }
    if (newRefresh) {
      await tokenStorage.setRefreshToken(newRefresh);
    }

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Attempt to call logout API (invalidates token on server)
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Log but don't throw - we still want to clear local tokens
      console.error('Logout API error:', error);
    } finally {
      // Always clear local tokens regardless of API response
      await tokenStorage.clearAll();
    }

    if (env.ENABLE_API_LOGS) {
      console.log('✅ Logged out successfully');
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    return !!token;
  },

  /**
   * Get current user from storage
   */
  async getCurrentUser(): Promise<User | null> {
    return userStorage.getUser();
  },

  /**
   * Fetch current user from API
   */
  async fetchCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.ME);

    // Update stored user data
    if (response.data.data) {
      await userStorage.setUser(response.data.data);
    }

    return response.data;
  },
};

export default authService;
