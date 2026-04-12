/**
 * useStories Hook
 * 
 * State management for community stories with CRUD operations,
 * viewing, liking, and grouping by user.
 */

import { useState, useCallback, useMemo } from 'react';
import { communityApi } from '@/api/communityApi';
import { Story, UserStories, CreateStoryInput, CommunityUser } from '../types';

interface UseStoriesReturn {
    stories: Story[];
    userStories: UserStories[];
    myStories: Story[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchStoryFeed: () => Promise<void>;
    fetchMyStories: () => Promise<void>;
    createStory: (data: CreateStoryInput) => Promise<Story | null>;
    deleteStory: (storyId: string) => Promise<boolean>;
    viewStory: (storyId: string) => Promise<void>;
    likeStory: (storyId: string) => Promise<void>;
    unlikeStory: (storyId: string) => Promise<void>;
}

/**
 * Group stories by user for display
 */
const groupStoriesByUser = (stories: Story[]): UserStories[] => {
    const userMap = new Map<string, UserStories>();

    for (const story of stories) {
        const existing = userMap.get(story.userId);

        if (existing) {
            existing.stories.push(story);
            existing.hasUnviewed = existing.hasUnviewed || !story.hasViewed;
            if (new Date(story.createdAt) > new Date(existing.latestStoryAt)) {
                existing.latestStoryAt = story.createdAt;
            }
        } else {
            userMap.set(story.userId, {
                userId: story.userId,
                user: story.user,
                stories: [story],
                hasUnviewed: !story.hasViewed,
                latestStoryAt: story.createdAt,
            });
        }
    }

    // Sort by latest story, unviewed first
    return Array.from(userMap.values()).sort((a, b) => {
        // Unviewed stories first
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        // Then by latest story
        return new Date(b.latestStoryAt).getTime() - new Date(a.latestStoryAt).getTime();
    });
};

export const useStories = (): UseStoriesReturn => {
    const [stories, setStories] = useState<Story[]>([]);
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Computed: Group stories by user
    const userStories = useMemo(() => groupStoriesByUser(stories), [stories]);

    /**
     * Fetch story feed
     */
    const fetchStoryFeed = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const feedStories = await communityApi.getStoryFeed();
            setStories(feedStories);
        } catch (err: any) {
            console.warn('Failed to fetch story feed:', err.message);
            setStories([]);
            setError('Failed to load stories. Pull to refresh.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch current user's stories
     */
    const fetchMyStories = useCallback(async () => {
        try {
            const stories = await communityApi.getMyStories();
            setMyStories(stories);
        } catch (err: any) {
            console.warn('Failed to fetch my stories:', err.message);
            setMyStories([]);
        }
    }, []);

    /**
     * Create a new story
     */
    const createStory = useCallback(async (data: CreateStoryInput): Promise<Story | null> => {
        try {
            const newStory = await communityApi.createStory(data);
            // Add to my stories
            setMyStories(prev => [newStory, ...prev]);
            return newStory;
        } catch (err: any) {
            setError(err.message || 'Failed to create story');
            return null;
        }
    }, []);

    /**
     * Delete a story
     */
    const deleteStory = useCallback(async (storyId: string): Promise<boolean> => {
        // Optimistic update
        const previousMyStories = myStories;
        setMyStories(prev => prev.filter(s => s.id !== storyId));

        try {
            await communityApi.deleteStory(storyId);
            return true;
        } catch (err: any) {
            // Rollback on error
            setMyStories(previousMyStories);
            setError(err.message || 'Failed to delete story');
            return false;
        }
    }, [myStories]);

    /**
     * Mark story as viewed
     */
    const viewStory = useCallback(async (storyId: string) => {
        // Optimistic update
        setStories(prev => prev.map(s =>
            s.id === storyId ? { ...s, hasViewed: true, viewCount: s.viewCount + 1 } : s
        ));

        try {
            await communityApi.viewStory(storyId);
        } catch (err: any) {
            console.error('Error marking story as viewed:', err);
        }
    }, []);

    /**
     * Like a story
     */
    const likeStory = useCallback(async (storyId: string) => {
        // Optimistic update
        setStories(prev => prev.map(s =>
            s.id === storyId ? { ...s, hasLiked: true, likeCount: s.likeCount + 1 } : s
        ));

        try {
            const result = await communityApi.likeStory(storyId);
            setStories(prev => prev.map(s =>
                s.id === storyId ? { ...s, likeCount: result.likeCount } : s
            ));
        } catch (err: any) {
            // Rollback on error
            setStories(prev => prev.map(s =>
                s.id === storyId ? { ...s, hasLiked: false, likeCount: s.likeCount - 1 } : s
            ));
            console.error('Error liking story:', err);
        }
    }, []);

    /**
     * Unlike a story
     */
    const unlikeStory = useCallback(async (storyId: string) => {
        // Optimistic update
        setStories(prev => prev.map(s =>
            s.id === storyId ? { ...s, hasLiked: false, likeCount: Math.max(0, s.likeCount - 1) } : s
        ));

        try {
            const result = await communityApi.unlikeStory(storyId);
            setStories(prev => prev.map(s =>
                s.id === storyId ? { ...s, likeCount: result.likeCount } : s
            ));
        } catch (err: any) {
            // Rollback on error
            setStories(prev => prev.map(s =>
                s.id === storyId ? { ...s, hasLiked: true, likeCount: s.likeCount + 1 } : s
            ));
            console.error('Error unliking story:', err);
        }
    }, []);

    return {
        stories,
        userStories,
        myStories,
        isLoading,
        error,
        fetchStoryFeed,
        fetchMyStories,
        createStory,
        deleteStory,
        viewStory,
        likeStory,
        unlikeStory,
    };
};

export default useStories;
