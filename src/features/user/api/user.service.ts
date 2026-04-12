/**
 * User Service
 */

import { apiClient, API_ENDPOINTS, ApiResponse } from '@/api';
import { userStorage } from '@/utils/storage';
import { User, UpdateProfilePayload, CompleteProfilePayload, ProfileStatus } from '../types';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.ME);

    // Update cached user
    if (response.data.data) {
      await userStorage.setUser(response.data.data);
    }

    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfilePayload): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data
    );

    // Update cached user
    if (response.data.data) {
      await userStorage.setUser(response.data.data);
    }

    return response.data;
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(uri: string): Promise<ApiResponse<User>> {
    const formData = new FormData();

    // Extract file info from URI
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 90000, // Use longer timeout for file uploads
      }
    );

    // Update cached user
    if (response.data.data) {
      await userStorage.setUser(response.data.data);
    }

    return response.data;
  },

  /**
   * Upload college ID card
   */
  async uploadCollegeId(uri: string): Promise<ApiResponse<User>> {
    const formData = new FormData();

    const filename = uri.split('/').pop() || 'college-id.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('collegeId', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPLOAD_COLLEGE_ID,
      formData
    );

    return response.data;
  },

  /**
   * Complete user profile (first-time setup after OTP)
   */
  async completeProfile(data: CompleteProfilePayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.COMPLETE_PROFILE,
      data
    );

    // Update cached user
    if (response.data.data) {
      await userStorage.setUser(response.data.data);
    }

    return response.data;
  },

  /**
   * Check profile completion status
   */
  async getProfileStatus(): Promise<ApiResponse<ProfileStatus>> {
    const response = await apiClient.get<ApiResponse<ProfileStatus>>(
      API_ENDPOINTS.USERS.PROFILE_STATUS
    );
    return response.data;
  },

  /**
   * Search users by username or display name
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USERS.SEARCH_USERS,
      {
        params: { q: query, page, limit }
      }
    );
    return response.data;
  },

  /**
   * Public profile by user id (for viewing other users)
   */
  async getPublicProfileById(userId: string): Promise<ApiResponse<User & { isFollowing?: boolean; followersCount?: number; followingCount?: number }>> {
    const response = await apiClient.get<ApiResponse<User & { isFollowing?: boolean; followersCount?: number; followingCount?: number }>>(
      API_ENDPOINTS.USERS.PUBLIC_PROFILE(userId)
    );
    return response.data;
  },
};

export default userService;

