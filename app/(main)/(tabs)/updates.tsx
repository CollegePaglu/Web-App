/**
 * Updates Screen
 * 
 * Official updates and announcements feed from societies and official account.
 * Uses the /community/updates endpoint with personalized recommendations.
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator, BackHandler } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { extendedColors as palette } from '../../../src/theme/colors';
import { typography, fontFamily } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { communityApi, Post } from '../../../src/api/communityApi';
import { PostCard } from '../../../src/features/community/components/PostCard';
import { VoteType } from '../../../src/features/community/types';
import { useThemeColors } from '@/context/ThemeContext';
import { CommentSection } from '../../../src/features/community/components/CommentSection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FeedSkeleton } from '@/features/community/components/FeedSkeleton';
import { useFeedFlashListProps } from '@/features/community/hooks/useFeedFlashListProps';
import { useFollowStore } from '@/store/useFollowStore';

export default function UpdatesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const { user: currentUser } = useAuth();
    const { syncFollowStatuses } = useFollowStore();

    const uiColors = useThemeColors();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Navigate to 'home' (Community) tab instead of default behavior
                router.navigate('/(main)/(tabs)/home');
                return true; // Prevent default behavior (exit/history)
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => subscription.remove();
        }, [router])
    );

    // Fetch updates
    const fetchUpdates = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
        try {
            if (refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);

            const response = await communityApi.getUpdates(pageNum, 20);
            console.log('📢 Updates fetched:', response.items.length);
            if (response.items.length > 0) {
                console.log('🔍 First item vote status:', {
                    id: response.items[0].id,
                    userVote: response.items[0].userVote,
                    upvotes: response.items[0].upvotes
                });
            }

            if (refresh || pageNum === 1) {
                setPosts(response.items);
            } else {
                setPosts(prev => [...prev, ...response.items]);
            }
            setHasMore(response.hasMore);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch updates:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates(1);
    }, [fetchUpdates]);

    const refreshFollowingList = useCallback(async () => {
        if (!currentUser?._id) return;
        try {
            const data = await communityApi.getFollowing(currentUser._id, 1, 500);
            const statuses: Record<string, boolean> = {};
            data.items.forEach((item) => {
                const id = item.id || item._id;
                if (id != null) statuses[String(id)] = true;
            });
            syncFollowStatuses(statuses);
        } catch (e) {
            console.error('Updates: failed to sync following list', e);
        }
    }, [currentUser?._id, syncFollowStatuses]);

    useEffect(() => {
        void refreshFollowingList();
    }, [refreshFollowingList]);

    const handleRefresh = () => {
        fetchUpdates(1, true);
        void refreshFollowingList();
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchUpdates(page + 1);
        }
    };

    const handleVote = async (postId: string, type: VoteType) => {
        try {
            const result = await communityApi.votePost(postId, type);
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote }
                    : p
            ));
        } catch (error) {
            console.error('Vote failed:', error);
        }
    };

    const handleRemoveVote = async (postId: string) => {
        try {
            const result = await communityApi.removeVote(postId);
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: null }
                    : p
            ));
        } catch (error) {
            console.error('Remove vote failed:', error);
        }
    };

    const handleCommentPress = (postId: string) => {
        setSelectedPostId(postId);
        setShowComments(true);
    };

    const followedRecord = useFollowStore((s) => s.followedRecord);

    const renderPost = ({ item }: { item: Post }) => (
        <View style={styles.feedRow} collapsable={false}>
            <PostCard
                post={item}
                currentUserId={(currentUser as any)?._id || (currentUser as any)?.id}
                onVote={handleVote}
                onRemoveVote={handleRemoveVote}
                onCommentPress={handleCommentPress}
            />
        </View>
    );

    const renderFooter = useCallback(() => {
        if (!hasMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={palette.primary[500]} />
            </View>
        );
    }, [hasMore]);

    const listEmpty = useMemo(
        () =>
            loading && posts.length === 0 ? (
                <FeedSkeleton count={3} />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="megaphone-outline" size={64} color={uiColors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: uiColors.text }]}>No updates yet</Text>
                    <Text style={[styles.emptyText, { color: uiColors.textSecondary }]}>
                        Official announcements and updates from societies will appear here
                    </Text>
                </View>
            ),
        [loading, posts.length, uiColors.text, uiColors.textSecondary]
    );

    const flashScrollProps = useFeedFlashListProps();

    return (
        <View style={[styles.container, { backgroundColor: uiColors.background }]}>
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + spacing[2],
                backgroundColor: uiColors.surface,
                borderBottomColor: uiColors.border
            }]}>
                <Text style={[styles.title, { color: uiColors.text }]}>Updates</Text>
            </View>

            {/* Updates List */}
            <FlashList
                {...flashScrollProps}
                data={posts}
                extraData={{ loading, followedRecord }}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={listEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={uiColors.primary}
                        colors={[uiColors.primary]}
                        progressBackgroundColor={uiColors.surface}
                    />
                }
                contentContainerStyle={posts.length === 0 ? styles.emptyList : styles.listContent}
            />

            {/* Comments Modal */}
            {selectedPostId && (
                <CommentSection
                    postId={selectedPostId}
                    visible={showComments}
                    onClose={() => setShowComments(false)}
                    currentUserAvatar={currentUser?.avatar}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    feedRow: {
        width: '100%',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[3],
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 28,
        fontFamily: fontFamily.heading,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyList: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100, // Account for bottom tab bar
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing[10],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: spacing[4],
        fontFamily: fontFamily.heading,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: spacing[2],
        lineHeight: 24,
    },
    footer: {
        paddingVertical: spacing[4],
        alignItems: 'center',
    },
});
