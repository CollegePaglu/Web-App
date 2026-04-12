/**
 * Assignment API Service
 * 
 * Centralized API functions for assignment/service requests.
 * Uses the shared API client with auth interceptors.
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

// ============================================
// Types
// ============================================

export type AssignmentType = 'assignment' | 'project' | 'file' | 'presentation' | 'thesis' | 'other';

export type AssignmentStatus =
    | 'draft'
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'submitted'
    | 'under_review'
    | 'revision_requested'
    | 'completed'
    | 'cancelled'
    | 'disputed';

export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded';

export interface AssignmentUser {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
}

export interface Assignment {
    id: string;
    requesterId: string;
    requester?: AssignmentUser;
    alphaId?: string;
    alpha?: AssignmentUser;
    adminId?: string;

    // Assignment Details
    type: AssignmentType;
    title: string;
    description: string;
    requirements: string[];
    attachments: string[];

    // Deadline & Budget
    deadline: string;
    budget: {
        min: number;
        max: number;
    };
    agreedPrice?: number;

    // Status
    status: AssignmentStatus;

    // Deliverables
    deliverables: string[];
    deliveredAt?: string;

    // Review
    rating?: number;
    feedback?: string;

    // Payment
    paymentStatus: PaymentStatus;
    paymentId?: string;

    // Timestamps
    assignedAt?: string;
    startedAt?: string;
    submittedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateAssignmentData {
    type: AssignmentType;
    title: string;
    description: string;
    requirements?: string[];
    attachments?: string[];
    deadline: string;
    budget: {
        min: number;
        max: number;
    };
}

export interface UpdateAssignmentData {
    title?: string;
    description?: string;
    requirements?: string[];
    attachments?: string[];
    deadline?: string;
    budget?: {
        min: number;
        max: number;
    };
}

export interface AssignmentFilters {
    type?: AssignmentType;
    status?: AssignmentStatus;
    search?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAssignmentResponse {
    items: Assignment[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// ============================================
// Helpers
// ============================================

/**
 * Transform backend assignment to frontend format
 */
const transformAssignment = (data: any): Assignment => ({
    id: data._id || data.id,
    requesterId: data.requesterId,
    requester: data.requester ? {
        id: data.requester._id || data.requester.id,
        name: data.requester.name || `${data.requester.firstName || ''} ${data.requester.lastName || ''}`.trim() || 'Unknown',
        avatar: data.requester.avatar,
        phone: data.requester.phone,
    } : undefined,
    alphaId: data.alphaId,
    alpha: data.alpha ? {
        id: data.alpha._id || data.alpha.id,
        name: data.alpha.name || `${data.alpha.firstName || ''} ${data.alpha.lastName || ''}`.trim() || 'Unknown',
        avatar: data.alpha.avatar,
        phone: data.alpha.phone,
    } : undefined,
    adminId: data.adminId,
    type: data.type,
    title: data.title,
    description: data.description,
    requirements: data.requirements || [],
    attachments: data.attachments || [],
    deadline: data.deadline,
    budget: data.budget || { min: 0, max: 0 },
    agreedPrice: data.agreedPrice,
    status: data.status,
    deliverables: data.deliverables || [],
    deliveredAt: data.deliveredAt,
    rating: data.rating,
    feedback: data.feedback,
    paymentStatus: data.paymentStatus || 'pending',
    paymentId: data.paymentId,
    assignedAt: data.assignedAt,
    startedAt: data.startedAt,
    submittedAt: data.submittedAt,
    completedAt: data.completedAt,
    cancelledAt: data.cancelledAt,
    cancellationReason: data.cancellationReason,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
});

// ============================================
// API Functions
// ============================================

/**
 * Create a new assignment request
 */
export const createAssignment = async (data: CreateAssignmentData): Promise<Assignment> => {
    const response = await apiClient.post(API_ENDPOINTS.ASSIGNMENTS.CREATE, data);
    return transformAssignment(response.data.data);
};

/**
 * Get user's assignments (as requester)
 */
export const getMyAssignments = async (
    params: PaginationParams = {}
): Promise<PaginatedAssignmentResponse> => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.MY_ASSIGNMENTS, {
        params: { page, limit, sortBy, sortOrder },
    });

    const backendData = response.data.data;
    const assignments = backendData?.data || backendData || [];
    const pagination = backendData?.pagination || response.data.pagination || {};

    return {
        items: (Array.isArray(assignments) ? assignments : []).map(transformAssignment),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get all assignments with filters (for browsing)
 */
export const getAssignments = async (
    filters: AssignmentFilters = {},
    params: PaginationParams = {}
): Promise<PaginatedAssignmentResponse> => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.LIST, {
        params: { page, limit, sortBy, sortOrder, ...filters },
    });

    const backendData = response.data.data;
    const assignments = backendData?.data || backendData || [];
    const pagination = backendData?.pagination || response.data.pagination || {};

    return {
        items: (Array.isArray(assignments) ? assignments : []).map(transformAssignment),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get open assignments (for alphas to browse)
 */
export const getOpenAssignments = async (
    params: PaginationParams = {}
): Promise<PaginatedAssignmentResponse> => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.OPEN_ASSIGNMENTS, {
        params: { page, limit, sortBy, sortOrder },
    });

    const backendData = response.data.data;
    const assignments = backendData?.data || backendData || [];
    const pagination = backendData?.pagination || response.data.pagination || {};

    return {
        items: (Array.isArray(assignments) ? assignments : []).map(transformAssignment),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (id: string): Promise<Assignment> => {
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS.ASSIGNMENT_BY_ID(id));
    return transformAssignment(response.data.data);
};

/**
 * Update assignment (only if draft or open)
 */
export const updateAssignment = async (id: string, data: UpdateAssignmentData): Promise<Assignment> => {
    const response = await apiClient.put(API_ENDPOINTS.ASSIGNMENTS.ASSIGNMENT_BY_ID(id), data);
    return transformAssignment(response.data.data);
};

/**
 * Delete assignment (soft delete)
 */
export const deleteAssignment = async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ASSIGNMENTS.ASSIGNMENT_BY_ID(id));
};

/**
 * Update assignment status
 */
export const updateAssignmentStatus = async (
    id: string,
    status: AssignmentStatus,
    reason?: string
): Promise<Assignment> => {
    const response = await apiClient.patch(API_ENDPOINTS.ASSIGNMENTS.UPDATE_STATUS(id), {
        status,
        reason
    });
    return transformAssignment(response.data.data);
};

/**
 * Rate completed assignment
 */
export const rateAssignment = async (
    id: string,
    rating: number,
    feedback?: string
): Promise<Assignment> => {
    const response = await apiClient.post(API_ENDPOINTS.ASSIGNMENTS.RATE(id), {
        rating,
        feedback
    });
    return transformAssignment(response.data.data);
};

/**
 * Upload attachment file (image or PDF)
 * Uses community media upload endpoint
 * Note: Uses axios directly to properly handle React Native FormData
 */
export const uploadAttachment = async (
    file: { uri: string; type: string; name: string }
): Promise<string> => {
    console.log('📤 Uploading file:', { name: file.name, type: file.type, uri: file.uri.substring(0, 50) });

    const formData = new FormData();

    // React Native requires file object with uri, type, name
    formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg', // Default to jpeg if no type
        name: file.name || 'file.jpg',
    } as any);

    // Get auth token
    const { tokenStorage } = await import('@/utils/storage');
    const accessToken = await tokenStorage.getAccessToken();

    // Use axios directly to avoid transformRequest issues with FormData
    const axios = (await import('axios')).default;
    const { env } = await import('@/config/env');

    try {
        const response = await axios.post(
            `${env.API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.UPLOAD_SINGLE}`,
            formData,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
                },
                timeout: 120000, // 2 minutes for large files
            }
        );

        console.log('✅ Upload successful:', response.data);
        const data = response.data.data;

        if (data.url) {
            return data.url;
        }

        throw new Error('No file URL returned from upload');
    } catch (error: any) {
        console.error('❌ Upload failed:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data,
        });
        throw error;
    }
};

/**
 * Upload multiple attachments
 */
export const uploadAttachments = async (
    files: { uri: string; type: string; name: string }[]
): Promise<string[]> => {
    const urls: string[] = [];

    // Upload files one by one to avoid timeout issues
    for (const file of files) {
        const url = await uploadAttachment(file);
        urls.push(url);
    }

    return urls;
};

// ============================================
// Status Helpers
// ============================================

export const ASSIGNMENT_STATUS_CONFIG: Record<AssignmentStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}> = {
    draft: { label: 'Draft', color: '#6B7280', bgColor: '#F3F4F6', icon: 'document-outline' },
    open: { label: 'Open', color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle-outline' },
    assigned: { label: 'Assigned', color: '#3B82F6', bgColor: '#DBEAFE', icon: 'person-outline' },
    in_progress: { label: 'In Progress', color: '#8B5CF6', bgColor: '#EDE9FE', icon: 'hourglass-outline' },
    submitted: { label: 'Completed', color: '#10B981', bgColor: '#CCFBF1', icon: 'checkmark-circle-outline' }, // Display as Completed (green)
    under_review: { label: 'Under Review', color: '#6366F1', bgColor: '#E0E7FF', icon: 'eye-outline' },
    revision_requested: { label: 'Revision Needed', color: '#EF4444', bgColor: '#FEE2E2', icon: 'alert-circle-outline' },
    completed: { label: 'Completed', color: '#14B8A6', bgColor: '#CCFBF1', icon: 'checkmark-done-outline' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle-outline' },
    disputed: { label: 'Disputed', color: '#F97316', bgColor: '#FFEDD5', icon: 'warning-outline' },
};

export const ASSIGNMENT_TYPE_CONFIG: Record<AssignmentType, {
    label: string;
    icon: string;
    description: string;
}> = {
    assignment: { label: 'Assignment', icon: 'document-text-outline', description: 'College assignments & homework' },
    project: { label: 'Project', icon: 'folder-outline', description: 'Academic projects & reports' },
    presentation: { label: 'Presentation', icon: 'easel-outline', description: 'PPT & slide decks' },
    thesis: { label: 'Thesis', icon: 'book-outline', description: 'Research papers & thesis' },
    file: { label: 'Lab File', icon: 'flask-outline', description: 'Lab manuals & records' },
    other: { label: 'Other', icon: 'apps-outline', description: 'Other academic work' },
};

// ============================================
// Export all functions
// ============================================

export const assignmentApi = {
    createAssignment,
    getMyAssignments,
    getAssignments,
    getOpenAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    updateAssignmentStatus,
    rateAssignment,
    uploadAttachment,
    uploadAttachments,
};

export default assignmentApi;
