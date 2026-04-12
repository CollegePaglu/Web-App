/**
 * Auth Types
 * 
 * Type definitions specific to authentication feature.
 */

export interface User {
  _id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  college?: {
    name?: string;
    department?: string;
    year?: number;
    rollNumber?: string;
  };
  role: 'student' | 'admin' | 'alpha';
  isProfileComplete: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
  isNewUser: boolean;
}

export interface SendOTPResponse {
  message: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Auth state for Zustand store
export interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  tokens: Tokens | null;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (tokens: Tokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// OTP request state
export interface OTPState {
  phone: string;
  isResendEnabled: boolean;
  resendCountdown: number;
  expiresAt: number | null;
}

// Auth screen navigation params
export interface AuthScreenParams {
  PhoneInput: undefined;
  OTPVerify: { phone: string };
  ProfileComplete: undefined;
}
