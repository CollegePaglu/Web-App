import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    Text,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { grey } from '../../../theme/colors';
import { communityApi } from '../../../api/communityApi';
import { Post } from '../types';
import { useCurrentUser } from '../../auth';

// Components
import { PostCard } from './PostCard';
import { CommentSection } from './CommentSection';
import { NativeAdCard } from './NativeAdCard';
import { FeedSkeleton } from './FeedSkeleton';
import { useFeedFlashListProps } from '../hooks/useFeedFlashListProps';

export const UpdatesFeed = () => {
    const currentUser = useCurrentUser();

    // State for updates - using the dedicated /community/updates API
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Ref-based guards to avoid stale closures
    const isLoadingRef = useRef(false);
    const isLoadingMoreRef = useRef(false);

    // Modal states
    const [showComments, setShowComments] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Fetch updates using the /community/updates API
    const fetchUpdates = useCallback(async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        try {
            setIsLoading(true);
            setError(null);
            const response = await communityApi.getUpdates(1, 20);
            if (__DEV__) console.log('Updates fetched:', response.items.length);
            setPosts(response.items);
            setPage(1);
            setHasMore(response.hasMore);
        } catch (err: any) {
            setError(err?.message || 'Failed to load updates');
            if (__DEV__) console.error('Failed to fetch updates:', err);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, []);

    // Refresh updates
    const refreshUpdates = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);
            const response = await communityApi.getUpdates(1, 20);
            setPosts(response.items);
            setPage(1);
            setHasMore(response.hasMore);
        } catch (err: any) {
            setError(err?.message || 'Failed to refresh updates');
            if (__DEV__) console.error('Failed to refresh updates:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Load more updates
    const loadMoreUpdates = useCallback(async () => {
        if (isLoadingMoreRef.current || !hasMore) return;
        isLoadingMoreRef.current = true;
        try {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            const response = await communityApi.getUpdates(nextPage, 20);
            setPosts((prev) => [...prev, ...response.items]);
            setPage(nextPage);
            setHasMore(response.hasMore);
        } catch (err) {
            if (__DEV__) console.error('Failed to load more updates:', err);
        } finally {
            setIsLoadingMore(false);
            isLoadingMoreRef.current = false;
        }
    }, [hasMore, page]);

    // Vote on post (optimistic)
    const votePost = useCallback(async (postId: string, type: 'up' | 'down') => {
        let originalPost: Post | undefined;

        // Optimistic update
        setPosts((prev) =>
            prev.map((p) => {
                if (p.id !== postId) return p;
                originalPost = { ...p };

                let newUpvotes = p.upvotes;
                let newDownvotes = p.downvotes;
                let newUserVote: 'up' | 'down' | null = type;

                if (p.userVote === type) {
                    if (type === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
                    if (type === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
                    newUserVote = null;
                } else {
                    if (p.userVote === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
                    if (p.userVote === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
                    if (type === 'up') newUpvotes++;
                    if (type === 'down') newDownvotes++;
                }

                return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote };
            })
        );

        try {
            const result = await communityApi.votePost(postId, type);
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote }
                        : p
                )
            );
        } catch (err) {
            if (originalPost) {
                setPosts((prev) => prev.map((p) => p.id === postId ? originalPost! : p));
            }
            if (__DEV__) console.error('Failed to vote:', err);
        }
    }, []);

    // Remove vote from post (optimistic)
    const removeVote = useCallback(async (postId: string) => {
        let originalPost: Post | undefined;

        setPosts((prev) =>
            prev.map((p) => {
                if (p.id !== postId || !p.userVote) return p;
                originalPost = { ...p };

                let newUpvotes = p.upvotes;
                let newDownvotes = p.downvotes;
                if (p.userVote === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
                if (p.userVote === 'down') newDownvotes = Math.max(0, newDownvotes - 1);

                return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null };
            })
        );

        try {
            await communityApi.removeVote(postId);
        } catch (err) {
            if (originalPost) {
                setPosts((prev) => prev.map((p) => p.id === postId ? originalPost! : p));
            }
            if (__DEV__) console.error('Failed to remove vote:', err);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchUpdates();
    }, []);

    // End reached handler
    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            loadMoreUpdates();
        }
    }, [hasMore, isLoadingMore, loadMoreUpdates]);

    // Comment press handler
    const handleCommentPress = useCallback((postId: string) => {
        setSelectedPostId(postId);
        setShowComments(true);
    }, []);

    // Render post item — stable callback
    const getItemType = useCallback((_item: Post, index: number) => {
        if (index > 0 && index % 5 === 0) return 'postWithAd';
        return 'post';
    }, []);

    const renderPost = useCallback(({ item, index }: { item: Post, index: number }) => (
        <View style={styles.feedRow} collapsable={false}>
            {index > 0 && index % 5 === 0 && (
                <NativeAdCard />
            )}
            <PostCard
                post={item}
                currentUserId={currentUser?._id}
                onVote={votePost}
                onRemoveVote={removeVote}
                onCommentPress={handleCommentPress}
            />
        </View>
    ), [currentUser?._id, votePost, removeVote, handleCommentPress]);

    // Render footer — memoized
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <Text style={styles.footerText}>Loading more updates...</Text>
            </View>
        );
    }, [isLoadingMore]);

    const flashScrollProps = useFeedFlashListProps();
    const emptyStateExtra = useMemo(
        () => `${isLoading ? 1 : 0}-${error ?? ''}`,
        [isLoading, error]
    );

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return <FeedSkeleton count={3} />;
        }
        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="warning-outline" size={64} color={grey[600]} />
                    <Text style={styles.emptyTitle}>Something went wrong</Text>
                    <Text style={styles.emptyText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUpdates}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="megaphone-outline" size={64} color={grey[600]} />
                <Text style={styles.emptyTitle}>No updates yet</Text>
                <Text style={styles.emptyText}>Official announcements will appear here.</Text>
            </View>
        );
    }, [isLoading, error, fetchUpdates]);

    return (
        <View style={styles.container}>
            <FlashList
                {...flashScrollProps}
                data={posts ?? []}
                extraData={(posts?.length ?? 0) === 0 ? emptyStateExtra : undefined}
                getItemType={getItemType}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshUpdates}
                        tintColor={grey[400]}
                        colors={[grey[400]]}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={(posts?.length ?? 0) === 0 ? styles.emptyList : styles.listContent}
            />

            {/* Comments Modal */}
            {selectedPostId && (
                <CommentSection
                    postId={selectedPostId}
                    visible={showComments}
                    onClose={() => setShowComments(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    feedRow: {
        width: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: grey[900],
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        color: grey[500],
        fontSize: 14,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        color: grey[300],
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: grey[500],
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: grey[800],
        borderRadius: 8,
    },
    retryText: {
        color: grey[300],
        fontSize: 15,
        fontWeight: '600',
    },
});
