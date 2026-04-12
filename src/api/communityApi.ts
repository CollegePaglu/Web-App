/**
 * Community API Service
 * 
 * Centralized API functions for community posts and stories.
 * Uses the shared API client with auth interceptors.
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { tokenStorage } from '@/utils/storage';
import { env } from '@/config/env';
import * as ImageManipulator from 'expo-image-manipulator';

// ============================================
// Types
// ============================================

import { MediaUploadService } from '@/services/MediaUploadService';

export interface User {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    college?: string;
    isSociety?: boolean;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
}

export interface Post {
    id: string;
    userId: string;
    user: User;
    content: string;
    title?: string;
    category?: string;
    eventDate?: string;
    mediaUrls: string[];
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    source?: string;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    user: User;
    content: string;
    createdAt: string;
    parentId?: string;
    replyCount?: number;
}

export interface Story {
    id: string;
    userId: string;
    user: User;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    viewCount: number;
    likeCount: number;
    hasViewed: boolean;
    hasLiked: boolean;
    expiresAt: string;
    createdAt: string;
}

export interface StoryViewer {
    userId: string;
    user: User;
    viewedAt: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

export interface CreatePostData {
    content: string;
    title?: string;
    mediaUrls?: string[];
}

export interface CreateStoryData {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
}

// ============================================
// Image Compression Helper
// ============================================

/**
 * Compress and resize images before upload for optimal display
 * Max width: 1200px, Quality: 80%
 * This prevents layout shifts and white borders when images are displayed
 */
const compressImage = async (
    file: { uri: string; type: string; name: string }
): Promise<{ uri: string; type: string; name: string }> => {
    try {
        // Skip non-image files
        if (!file.type.startsWith('image/')) {
            return file;
        }

        console.log(`🖼️ Compressing image: ${file.name}`);

        // Resize image to max 1200px width, maintaining aspect ratio
        // Quality: 80% for good balance between quality and file size
        const manipulationResult = await ImageManipulator.manipulateAsync(
            file.uri,
            [
                {
                    resize: {
                        width: 1200,
                        height: undefined, // Maintain aspect ratio
                    },
                },
            ],
            {
                compress: 0.8, // 0.8 = 80% quality
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );

        const compressedFile = {
            uri: manipulationResult.uri,
            type: 'image/jpeg',
            name: file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg',
        };

        console.log(`✅ Image compressed: ${file.name} → ${compressedFile.name}`);
        return compressedFile;
    } catch (error) {
        console.error(`❌ Image compression failed for ${file.name}:`, error);
        // Return original file if compression fails
        return file;
    }
};

/**
 * Compress multiple images before upload
 */
const compressImages = async (
    files: { uri: string; type: string; name: string }[]
): Promise<{ uri: string; type: string; name: string }[]> => {
    console.log(`📦 Compressing ${files.length} images...`);
    const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
    );
    console.log(`✅ All images compressed and ready to upload`);
    return compressedFiles;
};

// ============================================
// Shared Transformers
// ============================================

/**
 * Safely construct user display name from backend author data.
 */
const constructName = (author: any): string => {
    if (author?.displayName) return author.displayName;
    if (author?.name) return author.name;
    const firstName = author?.firstName || '';
    const lastName = author?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Anonymous';
};

/**
 * SINGLE source of truth for backend → frontend post transformation.
 * Used by ALL post-fetching functions.
 * Remote URLs are normalized at display time via AppImage / resolvePublicMediaUrl.
 */
const transformPost = (post: any): Post => ({
    id: post._id || post.id,
    userId: post.authorId || post.userId,
    user: post.author ? {
        id: post.author._id || post.author.id,
        name: constructName(post.author),
        avatarUrl: post.author.avatar,
        isSociety: post.author.isSociety || false,
        isFollowing: post.author.isFollowing ?? false,
        followersCount: post.author.followersCount ?? 0,
    } : {
        id: 'anonymous',
        name: post.anonymousName || 'Anonymous',
    },
    title: post.title,
    content: post.content,
    category: post.category,
    eventDate: post.eventDate,
    mediaUrls: [
        ...(post.images?.map((img: any) => img.url || img) || []),
        ...(post.videoUrl ? [post.videoUrl] : post.video?.url ? [post.video.url] : []),
    ],
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    userVote: post.userVote || null,
    commentCount: post.commentCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    source: post.source,
});

/**
 * Helper to extract paginated data from backend response.
 * Paginated endpoints use ResponseBuilder.paginated: posts live in `data`, pagination in `meta.pagination`.
 */
const extractPaginatedData = (responseData: any, page: number, limit: number): { posts: any[]; pagination: any } => {
    const backendData = responseData.data;
    const posts = backendData?.data || backendData || [];
    const pagination = {
        ...(backendData?.pagination || {}),
        ...(responseData.meta?.pagination || {}),
    };
    const p = page;
    const lim = pagination.limit ?? limit;
    const total = pagination.total ?? 0;
    if (pagination.hasNext === undefined && total > 0) {
        pagination.hasNext = p * lim < total;
    }
    return { posts: Array.isArray(posts) ? posts : [], pagination };
};

// ============================================
// Posts API
// ============================================

/**
 * Get community posts feed with pagination
 */
export const getPosts = async (
    page: number = 1,
    limit: number = 20,
    category?: string
): Promise<PaginatedResponse<Post>> => {
    const params: any = { page, limit };
    if (category) params.category = category;

    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.POSTS, { params });
    const { posts, pagination } = extractPaginatedData(response.data, page, limit);

    if (__DEV__) console.log('Posts fetched:', posts.length);

    return {
        items: posts.map(transformPost),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get official updates/announcements feed
 */
export const getUpdates = async (
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.UPDATES, {
        params: { page, limit },
    });
    const { posts, pagination } = extractPaginatedData(response.data, page, limit);

    if (__DEV__) console.log('Updates fetched:', posts.length);

    return {
        items: posts.map(transformPost),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext ?? (page * limit) < (pagination.total || 0),
    };
};

/**
 * Get current user's posts
 */
export const getMyPosts = async (
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.MY_POSTS, {
        params: { page, limit },
    });
    const { posts, pagination } = extractPaginatedData(response.data, page, limit);

    return {
        items: posts.map(transformPost),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get posts liked by the current user
 */
export const getLikedPosts = async (
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.LIKED_POSTS, {
        params: { page, limit },
    });
    const { posts, pagination } = extractPaginatedData(response.data, page, limit);

    return {
        items: posts.map(p => ({ ...transformPost(p), userVote: p.userVote || 'up' as const })),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<Post> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.POST_BY_ID(postId));
    return transformPost(response.data.data);
};

/**
 * Create a new community post with optional media files
 * Sends form-data for file uploads (multipart/form-data)
 * @param data - Post content and title
 * @param mediaFiles - React Native file objects with { uri, type, name }
 */
export const createPost = async (
    data: CreatePostData,
    mediaFiles?: { uri: string; type: string; name: string }[]
): Promise<Post> => {
    // If files are provided, send as form-data
    if (mediaFiles && mediaFiles.length > 0) {
        // Compress images before upload to prevent white borders and layout shifts
        console.log('🔄 Starting image compression and upload...');
        const compressedFiles = await compressImages(mediaFiles);

        const formData = new FormData();
        formData.append('content', data.content);
        if (data.title) formData.append('title', data.title);

        // Append compressed media files - React Native format
        for (const file of compressedFiles) {
            // React Native FormData expects objects with uri, type, and name
            formData.append('media', {
                uri: file.uri,
                type: file.type,
                name: file.name,
            } as any);
        }

        console.log('📤 Sending FormData with', compressedFiles.length, 'compressed files (using fetch)');
        if (__DEV__) console.log('Sending FormData with', mediaFiles.length, 'files');

        // USE FETCH INSTEAD OF AXIOS FOR MULTIPART
        // Axios has known issues with FormData in React Native
        const token = await tokenStorage.getAccessToken();
        const response = await fetch(`${env.API_BASE_URL}${API_ENDPOINTS.COMMUNITY.POSTS}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                // Intentionally NOT setting Content-Type so browser/engine sets boundary
            },
            body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (__DEV__) console.error('Upload failed:', response.status, responseData);
            // Construct an error object that mimics Axios error for frontend compatibility
            const error: any = new Error(responseData.message || 'Upload failed');
            error.response = {
                status: response.status,
                data: responseData,
            };
            throw error;
        }

        const post = responseData.data;
        return transformPost(post);
    }

    // If no files, send as JSON (text-only post)
    const response = await apiClient.post(API_ENDPOINTS.COMMUNITY.POSTS, {
        content: data.content,
        title: data.title,
    });
    const post = response.data.data;
    return transformPost(post);
};

// transformPost is now defined above (line ~114)

/**
 * Delete a post (user's own posts only)
 */
export const deletePost = async (postId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COMMUNITY.POST_BY_ID(postId));
};

/**
 * Vote on a post (upvote or downvote)
 */
export const votePost = async (
    postId: string,
    voteType: 'up' | 'down'
): Promise<{ upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMUNITY.POST_VOTE(postId), {
        type: voteType,
    });
    return response.data.data;
};

/**
 * Remove vote from a post
 */
export const removeVote = async (
    postId: string
): Promise<{ upvotes: number; downvotes: number; userVote: null }> => {
    const response = await apiClient.delete(API_ENDPOINTS.COMMUNITY.POST_VOTE(postId));
    return response.data.data;
};

// ============================================
// Users API
// ============================================

/**
 * Follow a user
 */
export const followUser = async (userId: string): Promise<{ followersCount: number; isFollowing: boolean }> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.FOLLOW(userId));
    return response.data.data;
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string): Promise<{ followersCount: number; isFollowing: boolean }> => {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.UNFOLLOW(userId));
    return response.data.data;
};

/**
 * Get following list for a user
 */
export const getFollowing = async (userId: string, page = 1, limit = 500): Promise<{ items: any[], hasMore: boolean }> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.FOLLOWING(userId), {
        params: { page, limit }
    });

    // The backend returns an array of objects like { user: { id: "..." }, followedAt: "...", isFollowing: true }
    // Structure: { success: true, data: [...], meta: { pagination: { hasNext: boolean } } }
    const items = response.data.data || [];
    const mappedItems = items.map((item: any) => {
        const userId = item.user?.id || item.user?._id || item.id || item._id;
        return {
            ...item.user,
            id: userId,
            _id: userId
        };
    });

    return {
        items: mappedItems,
        hasMore: response.data.meta?.pagination?.hasNext || false
    };
};

/** One row in the followers list (backend populates `user.avatar`). */
export interface FollowerListEntry {
    id: string;
    name: string;
    /** Profile photo URL when the user has uploaded one */
    avatarUrl?: string | null;
}

/**
 * Get followers of a user (names + optional avatar URLs for list UI).
 */
export const getFollowers = async (
    userId: string,
    page = 1,
    limit = 100
): Promise<{ followers: FollowerListEntry[]; hasMore: boolean }> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.FOLLOWERS(userId), {
        params: { page, limit },
    });

    const items = response.data.data || [];
    const followers: FollowerListEntry[] = [];
    for (const item of items) {
        const u = item.user;
        if (!u) continue;
        const name =
            (typeof u.displayName === 'string' && u.displayName.trim()) ||
            (typeof u.username === 'string' && u.username.trim()) ||
            'Unknown';
        const rawId = u.id ?? u._id;
        const id = rawId != null ? String(rawId) : `anon-${followers.length}`;
        const avatar =
            typeof u.avatar === 'string' && u.avatar.trim() ? u.avatar.trim() : null;
        followers.push({
            id,
            name,
            avatarUrl: avatar,
        });
    }

    return {
        followers,
        hasMore: response.data.meta?.pagination?.hasNext || false,
    };
};

// ============================================
// Comments API
// ============================================

/**
 * Get comments for a post
 */
export const getComments = async (
    postId: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId), {
        params: { page, limit },
    });

    // Transform backend response to frontend format
    const backendData = response.data.data;
    if (__DEV__) console.log('Comments raw response:', backendData?.data?.length || 0);

    const comments = backendData?.data || backendData || [];
    const pagination = backendData?.pagination || {};

    // Transform comments to match frontend Comment interface
    const transformedComments: Comment[] = (Array.isArray(comments) ? comments : []).map((comment: any) => ({
        id: comment._id || comment.id,
        postId: comment.postId,
        userId: comment.authorId || comment.userId,
        user: comment.author ? {
            id: comment.author._id || comment.author.id,
            name: comment.author.displayName || `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Anonymous',
            avatarUrl: comment.author.avatar,
        } : {
            id: 'anonymous',
            name: comment.anonymousName || 'Anonymous',
        },
        content: comment.content,
        createdAt: comment.createdAt,
        parentId: comment.parentId || undefined,
        replyCount: comment.replyCount || 0,
    }));



    return {
        items: transformedComments,
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

/**
 * Add a comment to a post (or reply to a comment via parentId)
 */
export const addComment = async (
    postId: string,
    content: string,
    parentId?: string,
): Promise<Comment> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId), {
        content,
        ...(parentId ? { parentId } : {}),
    });
    const comment = response.data.data;

    // Transform to frontend format
    return {
        id: comment._id || comment.id,
        postId: comment.postId || postId,
        userId: comment.authorId || comment.userId,
        user: comment.author ? {
            id: comment.author._id || comment.author.id,
            name: comment.author.displayName || `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Anonymous',
            avatarUrl: comment.author.avatar,
        } : {
            id: 'anonymous',
            name: comment.anonymousName || 'You',
        },
        content: comment.content,
        createdAt: comment.createdAt,
        parentId: comment.parentId || parentId,
        replyCount: comment.replyCount || 0,
    };
};

/**
 * Get replies for a specific comment (threaded)
 */
export const getReplies = async (
    postId: string,
    commentId: string,
    page: number = 1,
    limit: number = 30
): Promise<Comment[]> => {
    // Uses the dedicated /replies endpoint that correctly filters by parentId
    const response = await apiClient.get(
        API_ENDPOINTS.COMMUNITY.COMMENT_REPLIES(postId, commentId),
        { params: { page, limit } }
    );
    const backendData = response.data.data;
    const replies = backendData?.data || backendData || [];

    return (Array.isArray(replies) ? replies : []).map((comment: any) => ({
        id: comment._id || comment.id,
        postId: comment.postId || postId,
        userId: comment.authorId || comment.userId,
        user: comment.author ? {
            id: comment.author._id || comment.author.id,
            name: comment.author.displayName || `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Anonymous',
            avatarUrl: comment.author.avatar,
        } : { id: 'anonymous', name: comment.anonymousName || 'Anonymous' },
        content: comment.content,
        createdAt: comment.createdAt,
        parentId: commentId,
        replyCount: 0,
    }));
};

/**
 * Search users for @mention autocomplete
 */
export const searchUsers = async (query: string): Promise<{ id: string; name: string; avatarUrl?: string }[]> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USERS.SEARCH_USERS, {
            params: { q: query, limit: 8 },
        });
        // Backend returns: { success, data: [ { id, username, displayName, avatar, followersCount } ] }
        const users = response.data.data || [];
        return (Array.isArray(users) ? users : []).map((u: any) => ({
            id: u.id || u._id,
            name: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown',
            avatarUrl: u.avatar,
        }));
    } catch {
        return [];
    }
};

/**
 * Delete a comment (user's own comments only)
 */
export const deleteComment = async (
    postId: string,
    commentId: string
): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId)}/${commentId}`);
};

// ============================================
// Media Upload API
// ============================================

/**
 * Upload media file (image/video) to R2 storage
 * For React Native, file must be { uri, type, name }
 */
/**
 * Upload media files (images/video) to R2 storage
 * Accepts multiple files (max 5 total)
 */
export const uploadMedia = async (
    files: { uri: string; type: string; name: string }[]
): Promise<{
    images: { url: string; key: string; thumbnailUrl: string }[];
    video?: { url: string; key: string };
}> => {
    // Delegate to native upload service for reliability
    return await MediaUploadService.uploadBatch(files);
};

// ============================================
// Stories API
// ============================================

// Helper to transform story data
const transformStory = (story: any): Story => ({
    id: story._id || story.id,
    userId: story.authorId || story.userId,
    user: story.author ? {
        id: story.author._id || story.author.id,
        name: story.author.displayName || `${story.author.firstName || ''} ${story.author.lastName || ''}`.trim() || 'Anonymous',
        avatarUrl: story.author.avatar,
    } : {
        id: 'anonymous',
        name: 'Anonymous',
        ...story.user,
        avatarUrl: story.user?.avatar ?? story.user?.avatarUrl,
    },
    mediaUrl: story.mediaUrl || story.url || '',
    mediaType: story.mediaType || 'image',
    caption: story.caption,
    viewCount: story.viewCount || 0,
    likeCount: story.likeCount || 0,
    hasViewed: story.hasViewed || false,
    hasLiked: story.hasLiked || false,
    expiresAt: story.expiresAt,
    createdAt: story.createdAt,
});

/**
 * Get story feed (stories from other users - grouped by user)
 */
export const getStoryFeed = async (): Promise<Story[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORIES_FEED);
    const userStoriesArray = response.data.data;

    // Backend returns grouped stories: [{ author: {...}, stories: [...] }, ...]
    // We need to flatten them and ensure author data is attached to each story
    const allStories: Story[] = [];

    if (Array.isArray(userStoriesArray)) {
        for (const userStories of userStoriesArray) {
            if (Array.isArray(userStories.stories)) {
                for (const story of userStories.stories) {
                    // Attach author info to story
                    story.author = userStories.author;
                    allStories.push(transformStory(story));
                }
            }
        }
    }

    return allStories;
};

/**
 * Get current user's active stories
 */
export const getMyStories = async (): Promise<Story[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORIES_ME);
    const stories = response.data.data;
    return (Array.isArray(stories) ? stories : []).map(transformStory);
};

/**
 * Get stories by a specific user
 */
export const getUserStories = async (userId: string): Promise<Story[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORIES_BY_USER(userId));
    const stories = response.data.data;
    return (Array.isArray(stories) ? stories : []).map(transformStory);
};

/**
 * Get a single story by ID
 */
export const getStoryById = async (storyId: string): Promise<Story> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORY_BY_ID(storyId));
    return transformStory(response.data.data);
};

/**
 * Create a new story
 */
export const createStory = async (data: CreateStoryData): Promise<Story> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMUNITY.STORIES, data);
    return transformStory(response.data.data);
};

/**
 * Delete a story (user's own stories only)
 */
export const deleteStory = async (storyId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COMMUNITY.STORY_BY_ID(storyId));
};

/**
 * Mark a story as viewed
 */
export const viewStory = async (storyId: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.COMMUNITY.STORY_VIEW(storyId));
};

/**
 * Like a story
 */
export const likeStory = async (storyId: string): Promise<{ likeCount: number }> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMUNITY.STORY_LIKE(storyId));
    return response.data.data;
};

/**
 * Unlike a story
 */
export const unlikeStory = async (storyId: string): Promise<{ likeCount: number }> => {
    const response = await apiClient.delete(API_ENDPOINTS.COMMUNITY.STORY_LIKE(storyId));
    return response.data.data;
};

/**
 * Get story viewers
 */
export const getStoryViewers = async (storyId: string): Promise<StoryViewer[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORY_VIEWERS(storyId));
    return response.data.data;
};

/**
 * Get users who liked a story
 */
export const getStoryLikers = async (storyId: string): Promise<User[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMUNITY.STORY_LIKERS(storyId));
    return response.data.data;
};

// ============================================
// Society
// ============================================

/**
 * Get society profile
 */
export const getSocietyProfile = async (societyId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.SOCIETY.PROFILE(societyId));
    return response.data.data;
};

/**
 * Get society posts
 */
export const getSocietyPosts = async (
    societyId: string,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(API_ENDPOINTS.SOCIETY.POSTS(societyId), {
        params: { page, limit }
    });

    const { posts, pagination } = extractPaginatedData(response.data, page, limit);

    return {
        items: posts.map(transformPost),
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        hasMore: pagination.hasNext || false,
    };
};

// ============================================
// Export all functions
// ============================================

export const communityApi = {
    // Posts
    getPosts,
    getUpdates,
    getMyPosts,
    getLikedPosts,
    getPostById,
    createPost,
    deletePost,
    votePost,
    removeVote,

    // Users
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers,

    // Comments
    getComments,
    addComment,
    getReplies,
    deleteComment,
    searchUsers,

    // Media
    uploadMedia,

    // Stories
    getStoryFeed,
    getMyStories,
    getUserStories,
    getStoryById,
    createStory,
    deleteStory,
    viewStory,
    likeStory,
    unlikeStory,
    getStoryViewers,
    getStoryLikers,

    // Society
    getSocietyProfile,
    getSocietyPosts,
};

export default communityApi;

