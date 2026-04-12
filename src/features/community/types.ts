/**
 * Community Feature Types
 * 
 * TypeScript interfaces for community posts, stories, and comments.
 */

// ============================================
// User Types
// ============================================

export interface CommunityUser {
    id: string;
    name: string;
    avatarUrl?: string;
    college?: string;
}

// ============================================
// Post Types
// ============================================

export interface Post {
    id: string;
    userId: string;
    user: CommunityUser;
    content: string;
    title?: string;
    category?: string;
    eventDate?: string;
    mediaUrls: string[];
    videoUrl?: string;
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    source?: string;
}

export interface CreatePostInput {
    content: string;
    mediaUrls?: string[];
}

export type VoteType = 'up' | 'down';

export interface VoteResult {
    upvotes: number;
    downvotes: number;
    userVote: 'up' | 'down' | null;
}

// ============================================
// Comment Types
// ============================================

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    user: CommunityUser;
    content: string;
    createdAt: string;
    // Reply support
    parentId?: string;
    parentUser?: CommunityUser; // who the reply is directed at
    replyCount?: number;
    replies?: Comment[];        // lazy-loaded inline replies
}

export interface CreateCommentInput {
    content: string;
    parentId?: string;          // if set, this is a reply
}

// For @mention autocomplete
export interface MentionUser {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
}

// ============================================
// Story Types
// ============================================

export type StoryMediaType = 'image' | 'video';

export interface Story {
    id: string;
    userId: string;
    user: CommunityUser;
    mediaUrl: string;
    mediaType: StoryMediaType;
    caption?: string;
    viewCount: number;
    likeCount: number;
    hasViewed: boolean;
    hasLiked: boolean;
    expiresAt: string;
    createdAt: string;
}

export interface CreateStoryInput {
    mediaUrl: string;
    mediaType: StoryMediaType;
    caption?: string;
}

export interface StoryViewer {
    userId: string;
    user: CommunityUser;
    viewedAt: string;
}

// ============================================
// Grouped Stories (for display)
// ============================================

export interface UserStories {
    userId: string;
    user: CommunityUser;
    stories: Story[];
    hasUnviewed: boolean;
    latestStoryAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// ============================================
// State Types
// ============================================

export interface PostsState {
    posts: Post[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
}

export interface StoriesState {
    stories: Story[];
    userStories: UserStories[];
    myStories: Story[];
    isLoading: boolean;
    error: string | null;
}
