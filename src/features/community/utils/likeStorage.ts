/**
 * LikeStorage - Persists liked/disliked post IDs and counts to AsyncStorage
 * Ensures likes persist across app reloads without backend changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKES_KEY = '@CollegePaglu:likes';

interface LikeData {
    isLiked: boolean;
    isDisliked: boolean;
    likeCount: number;
    dislikeCount: number;
}

class LikeStorage {
    private postsData: Map<string, LikeData> = new Map();
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize by loading from AsyncStorage
     */
    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const stored = await AsyncStorage.getItem(LIKES_KEY);
                if (stored) {
                    const obj = JSON.parse(stored) as Record<string, LikeData>;
                    this.postsData = new Map(Object.entries(obj));
                }
                this.initialized = true;
            } catch (error) {
                console.error('LikeStorage init failed:', error);
                this.postsData = new Map();
                this.initialized = true;
            }
        })();

        return this.initPromise;
    }

    /**
     * Check if storage is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get data for a post
     */
    getPostData(postId: string): LikeData | null {
        return this.postsData.get(postId) || null;
    }

    /**
     * Check if a post is liked
     */
    isLiked(postId: string): boolean {
        return this.postsData.get(postId)?.isLiked || false;
    }

    /**
     * Check if a post is disliked
     */
    isDisliked(postId: string): boolean {
        return this.postsData.get(postId)?.isDisliked || false;
    }

    /**
     * Get like count for a post
     */
    getLikeCount(postId: string): number | null {
        const data = this.postsData.get(postId);
        return data ? data.likeCount : null;
    }

    /**
     * Set like state for a post
     */
    async setLike(postId: string, isLiked: boolean, likeCount: number, dislikeCount: number): Promise<void> {
        const existing = this.postsData.get(postId) || { isLiked: false, isDisliked: false, likeCount: 0, dislikeCount: 0 };
        this.postsData.set(postId, {
            ...existing,
            isLiked,
            isDisliked: isLiked ? false : existing.isDisliked, // Can't be both
            likeCount,
            dislikeCount,
        });
        await this.persist();
    }

    /**
     * Set dislike state for a post
     */
    async setDislike(postId: string, isDisliked: boolean, likeCount: number, dislikeCount: number): Promise<void> {
        const existing = this.postsData.get(postId) || { isLiked: false, isDisliked: false, likeCount: 0, dislikeCount: 0 };
        this.postsData.set(postId, {
            ...existing,
            isLiked: isDisliked ? false : existing.isLiked, // Can't be both
            isDisliked,
            likeCount,
            dislikeCount,
        });
        await this.persist();
    }

    /**
     * Add a like
     */
    async addLike(postId: string): Promise<void> {
        const existing = this.postsData.get(postId);
        if (existing) {
            existing.isLiked = true;
            existing.isDisliked = false;
            existing.likeCount += 1;
        } else {
            this.postsData.set(postId, { isLiked: true, isDisliked: false, likeCount: 1, dislikeCount: 0 });
        }
        await this.persist();
    }

    /**
     * Remove a like
     */
    async removeLike(postId: string): Promise<void> {
        const existing = this.postsData.get(postId);
        if (existing) {
            existing.isLiked = false;
            existing.likeCount = Math.max(0, existing.likeCount - 1);
        }
        await this.persist();
    }

    /**
     * Persist to AsyncStorage
     */
    private async persist(): Promise<void> {
        try {
            const obj = Object.fromEntries(this.postsData);
            await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(obj));
        } catch (error) {
            console.error('LikeStorage persist failed:', error);
        }
    }
}

export const likeStorage = new LikeStorage();
