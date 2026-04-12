/**
 * API Types
 * 
 * Type definitions for API requests and responses.
 * Matches the backend response format.
 */

import { z } from 'zod';

// ============================================
// Base API Response Types
// ============================================

/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// ============================================
// Auth Types
// ============================================

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    _id: string;
    phone: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: 'student' | 'admin' | 'alpha' | 'society';
    isProfileComplete: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    tokens: Tokens;
    isNewUser: boolean;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

// ============================================
// Zod Schemas for Runtime Validation
// ============================================

export const TokensSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
});

export const UserSchema = z.object({
    _id: z.string(),
    phone: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(['student', 'admin', 'alpha', 'society']),
    isProfileComplete: z.boolean(),
    isVerified: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const AuthResponseSchema = z.object({
    user: UserSchema,
    tokens: TokensSchema,
    isNewUser: z.boolean(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        data: dataSchema,
        message: z.string().optional(),
        error: z
            .object({
                code: z.string(),
                message: z.string(),
                details: z.unknown().optional(),
            })
            .optional(),
    });

// ============================================
// Request Types
// ============================================

export interface SendOTPRequest {
    phone: string;
    channel?: 'sms' | 'whatsapp';
}

export interface VerifyOTPRequest {
    phone: string;
    otp: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    avatar?: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
    code: string;
    message: string;
    status?: number;
    details?: unknown;
}

export class ApiException extends Error {
    code: string;
    status: number;
    details?: unknown;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiException';
        this.code = error.code;
        this.status = error.status || 500;
        this.details = error.details;
    }
}
