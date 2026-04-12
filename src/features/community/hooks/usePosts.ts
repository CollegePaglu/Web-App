/**
 * usePosts Hook
 * 
 * State management for community posts with CRUD operations,
 * voting, and optimistic updates.
 * 
 * SINGLE SOURCE OF TRUTH for all post/vote state.
 * Components should treat this as read-only props + action dispatchers.
 */

import { useState, useCallback, useRef } from 'react';
import { communityApi } from '@/api/communityApi';
import { Post, VoteType, CreatePostInput } from '../types';

interface UsePostsOptions {
    initialLimit?: number;
    category?: string;
}

interface UsePostsReturn {
    posts: Post[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMore: boolean;

    // Actions
    fetchPosts: () => Promise<void>;
    refreshPosts: () => Promise<void>;
    loadMorePosts: () => Promise<void>;
    createPost: (data: CreatePostInput) => Promise<Post | null>;
    deletePost: (postId: string) => Promise<boolean>;
    votePost: (postId: string, voteType: VoteType) => Promise<void>;
    removeVote: (postId: string) => Promise<void>;
    addPostToFeed: (post: Post) => void;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
    const { initialLimit = 20, category } = options;

    const [posts, setPosts] = useState<Post[]>([]);
    /** Start true so first paint shows skeletons instead of a flash of empty state. */
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const pageRef = useRef(1);
    const isFetchingRef = useRef(false);

    /**
     * Fetch initial posts
     */
    const fetchPosts = useCallback(async () => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            setIsLoading(true);
            setError(null);

            const response = await communityApi.getPosts(1, initialLimit, category);

            setPosts(response.items);
            pageRef.current = 1;
            setHasMore(response.hasMore);
        } catch (err: any) {
            console.warn('Failed to fetch posts:', err.message);
            setPosts([]);
            pageRef.current = 1;
            setHasMore(false);
            setError('Failed to load posts. Pull to refresh.');
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [initialLimit, category]);

    /**
     * Pull-to-refresh
     */
    const refreshPosts = useCallback(async () => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            setIsRefreshing(true);
            setError(null);

            const response = await communityApi.getPosts(1, initialLimit, category);

            setPosts(response.items);
            pageRef.current = 1;
            setHasMore(response.hasMore);
        } catch (err: any) {
            console.warn('Failed to refresh posts:', err.message);
            setError('Failed to refresh. Try again.');
        } finally {
            setIsRefreshing(false);
            isFetchingRef.current = false;
        }
    }, [initialLimit, category]);

    /**
     * Load more posts (infinite scroll)
     */
    const loadMorePosts = useCallback(async () => {
        if (isFetchingRef.current || !hasMore || isLoadingMore) return;

        try {
            isFetchingRef.current = true;
            setIsLoadingMore(true);

            const nextPage = pageRef.current + 1;
            const response = await communityApi.getPosts(nextPage, initialLimit, category);

            setPosts(prev => [...prev, ...response.items]);
            pageRef.current = nextPage;
            setHasMore(response.hasMore);
        } catch (err: any) {
            console.warn('Error loading more posts:', err.message);
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [hasMore, isLoadingMore, initialLimit, category]);

    /**
     * Create a new post
     */
    const createPost = useCallback(async (data: CreatePostInput): Promise<Post | null> => {
        try {
            const newPost = await communityApi.createPost(data);
            setPosts(prev => [newPost, ...prev]);
            return newPost;
        } catch (err: any) {
            setError(err.message || 'Failed to create post');
            return null;
        }
    }, []);

    /**
     * Delete a post (optimistic with rollback)
     */
    const deletePost = useCallback(async (postId: string): Promise<boolean> => {
        // Capture snapshot for rollback using functional update
        let snapshot: Post[] = [];
        setPosts(prev => {
            snapshot = prev;
            return prev.filter(p => p.id !== postId);
        });

        try {
            await communityApi.deletePost(postId);
            return true;
        } catch (err: any) {
            // Rollback
            setPosts(snapshot);
            setError(err.message || 'Failed to delete post');
            return false;
        }
    }, []);

    /**
     * Vote on a post (optimistic update — SINGLE SOURCE OF TRUTH)
     * 
     * Uses functional setPosts to avoid stale closure issues.
     * No dependency on `posts` in useCallback.
     */
    const votePost = useCallback(async (postId: string, voteType: VoteType) => {
        // Snapshot for rollback (captured inside functional update)
        let originalPost: Post | undefined;

        // Optimistic update
        setPosts(current => current.map(p => {
            if (p.id !== postId) return p;

            // Capture original for rollback
            originalPost = { ...p };

            let newUpvotes = p.upvotes;
            let newDownvotes = p.downvotes;
            let newUserVote: 'up' | 'down' | null = voteType;

            // If already voted the same way → toggle off
            if (p.userVote === voteType) {
                if (voteType === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
                if (voteType === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
                newUserVote = null;
            } else {
                // Remove previous vote first
                if (p.userVote === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
                if (p.userVote === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
                // Apply new vote
                if (voteType === 'up') newUpvotes++;
                if (voteType === 'down') newDownvotes++;
            }

            return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote };
        }));

        try {
            const result = await communityApi.votePost(postId, voteType);
            // Reconcile with server truth
            setPosts(current => current.map(p =>
                p.id === postId
                    ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote }
                    : p
            ));
        } catch (err: any) {
            // Rollback to original
            if (originalPost) {
                setPosts(current => current.map(p =>
                    p.id === postId ? originalPost! : p
                ));
            }
            if (__DEV__) console.error('Vote failed:', err);
        }
    }, []); // No dependency on posts! Uses functional updater.

    /**
     * Remove vote from a post
     */
    const removeVote = useCallback(async (postId: string) => {
        let originalPost: Post | undefined;

        // Optimistic update
        setPosts(current => current.map(p => {
            if (p.id !== postId || !p.userVote) return p;

            originalPost = { ...p };

            let newUpvotes = p.upvotes;
            let newDownvotes = p.downvotes;

            if (p.userVote === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
            if (p.userVote === 'down') newDownvotes = Math.max(0, newDownvotes - 1);

            return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null };
        }));

        try {
            await communityApi.removeVote(postId);
        } catch (err: any) {
            // Rollback
            if (originalPost) {
                setPosts(current => current.map(p =>
                    p.id === postId ? originalPost! : p
                ));
            }
            if (__DEV__) console.error('Error removing vote:', err);
        }
    }, []);

    /**
     * Optimistically add a new post to the feed (for immediate UI feedback)
     */
    const addPostToFeed = useCallback((post: Post) => {
        setPosts(prev => [post, ...prev]);
    }, []);

    return {
        posts,
        isLoading,
        isRefreshing,
        isLoadingMore,
        error,
        hasMore,
        fetchPosts,
        refreshPosts,
        loadMorePosts,
        createPost,
        deletePost,
        votePost,
        removeVote,
        addPostToFeed,
    };
};

export default usePosts;
