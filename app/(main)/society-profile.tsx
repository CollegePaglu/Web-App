import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
                    FlatList,
                    Pressable,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/context/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { communityApi } from '../../src/api/communityApi';
import { PostCard } from '../../src/features/community/components/PostCard';
import { UnfollowModal } from '../../src/features/community/components/UnfollowModal';
import * as Haptics from 'expo-haptics';
import { useFollowStore } from '../../src/store/useFollowStore';
import { AppImage } from '../../src/components/ui/AppImage';

interface SocietyProfile {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isVerified?: boolean;
    createdAt?: string;
}

export default function SocietyProfileScreen() {
    const router = useRouter();
    const { societyId } = useLocalSearchParams<{ societyId: string }>();
    const colors = useThemeColors();

    const [profile, setProfile] = useState<SocietyProfile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { followedRecord, setFollowStatus } = useFollowStore();
    const societyKey = societyId ? String(societyId) : '';
    const isFollowing = societyKey
        ? (followedRecord[societyKey] ?? profile?.isFollowing ?? false)
        : false;

    // Unfollow modal
    const [unfollowModalVisible, setUnfollowModalVisible] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!societyId) return;
        try {
            const data = await communityApi.getSocietyProfile(societyId);
            setProfile(data);
            if (data.isFollowing !== undefined) {
                setFollowStatus(societyId, data.isFollowing);
            }
        } catch (error) {
            console.error('Failed to fetch society profile:', error);
        }
    }, [societyId]);

    const fetchPosts = useCallback(
        async (pageNum: number, isRefresh = false, opts?: { silent?: boolean }) => {
            if (!societyId) return;
            const silent = opts?.silent ?? false;
            try {
                if (!silent) setIsLoadingPosts(true);
                const response = await communityApi.getSocietyPosts(societyId, pageNum, 20);
                const newPosts = response.items || [];

                if (isRefresh) {
                    setPosts(newPosts);
                } else {
                    setPosts((prev) => [...prev, ...newPosts]);
                }
                setHasMore(response.hasMore);
            } catch (error) {
                console.error('Failed to fetch society posts:', error);
                setHasMore(false);
            } finally {
                if (!silent) setIsLoadingPosts(false);
            }
        },
        [societyId]
    );

    const societyFirstFocusRef = useRef(true);

    useEffect(() => {
        societyFirstFocusRef.current = true;
    }, [societyId]);

    useFocusEffect(
        useCallback(() => {
            if (!societyId) return;
            const silent = !societyFirstFocusRef.current;
            societyFirstFocusRef.current = false;
            let cancelled = false;
            const run = async () => {
                if (!silent) setIsLoading(true);
                await Promise.all([
                    fetchProfile(),
                    fetchPosts(1, true, { silent }),
                ]);
                if (!cancelled && !silent) setIsLoading(false);
            };
            void run();
            return () => {
                cancelled = true;
                setIsLoading(false);
            };
        }, [societyId, fetchProfile, fetchPosts])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await Promise.all([fetchProfile(), fetchPosts(1, true)]);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!isLoadingPosts && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    const handleFollow = async () => {
        if (!profile) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Optimistic update
        setFollowStatus(profile.id, true);
        setProfile(prev => prev ? {
            ...prev,
            followersCount: prev.followersCount + 1
        } : prev);

        try {
            await communityApi.followUser(profile.id);
        } catch (error) {
            console.error('Failed to follow society:', error);
            // Revert
            setFollowStatus(profile.id, false);
            setProfile(prev => prev ? {
                ...prev,
                followersCount: Math.max(0, prev.followersCount - 1)
            } : prev);
        }
    };

    const handleUnfollow = async () => {
        if (!profile) return;

        // Optimistic update
        setFollowStatus(profile.id, false);
        setProfile(prev => prev ? {
            ...prev,
            followersCount: Math.max(0, prev.followersCount - 1)
        } : prev);

        try {
            await communityApi.unfollowUser(profile.id);
        } catch (error) {
            console.error('Failed to unfollow society:', error);
            // Revert
            setFollowStatus(profile.id, true);
            setProfile(prev => prev ? {
                ...prev,
                followersCount: prev.followersCount + 1
            } : prev);
        }
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const renderHeader = () => {
        if (!profile) return null;

        return (
            <View style={[styles.profileSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Back button row */}
                <View style={styles.topRow}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                </View>

                {/* Avatar + Name */}
                <View style={styles.profileHeader}>
                    {profile.avatar ? (
                        <AppImage uri={profile.avatar} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="people" size={40} color={colors.primary} />
                        </View>
                    )}

                    <View style={styles.nameSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                                {profile.name}
                            </Text>
                            {profile.isVerified && (
                                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                            )}
                        </View>
                        <View style={[styles.societyTag, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="people" size={12} color={colors.primary} />
                            <Text style={[styles.societyTagText, { color: colors.primary }]}>Society</Text>
                        </View>
                    </View>
                </View>

                {/* Bio */}
                {profile.bio ? (
                    <Text style={[styles.bio, { color: colors.textSecondary }]}>
                        {profile.bio}
                    </Text>
                ) : null}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>
                            {formatCount(posts.length > 0 ? posts.length : 0)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>
                            {formatCount(profile.followersCount)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.text }]}>
                            {formatCount(profile.followingCount)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.followButton,
                        {
                            backgroundColor: isFollowing ? 'transparent' : colors.primary,
                            borderColor: isFollowing ? colors.border : 'transparent',
                            borderWidth: 1.5,
                            opacity: pressed ? 0.7 : 1,
                        }
                    ]}
                    onPress={() => {
                        if (isFollowing) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setUnfollowModalVisible(true);
                        } else {
                            handleFollow();
                        }
                    }}
                >
                    <Ionicons
                        name={isFollowing ? 'checkmark' : 'add'}
                        size={18}
                        color={isFollowing ? colors.text : '#fff'}
                    />
                    <Text style={[
                        styles.followButtonText,
                        { color: isFollowing ? colors.text : '#fff' }
                    ]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </Pressable>

                {/* Posts header */}
                <View style={[styles.postsHeaderRow, { borderTopColor: colors.border }]}>
                    <Ionicons name="grid-outline" size={18} color={colors.primary} />
                    <Text style={[styles.postsHeaderText, { color: colors.text }]}>Posts</Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <FlatList
                data={posts}
                keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        hideFollowButton={true}
                        onVote={async (postId, type) => {
                            try {
                                const result = await communityApi.votePost(postId, type);
                                setPosts(prev => prev.map(p =>
                                    (p._id || p.id) === postId
                                        ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote }
                                        : p
                                ));
                            } catch (e) { console.error('Vote failed:', e); }
                        }}
                        onRemoveVote={async (postId) => {
                            try {
                                const result = await communityApi.removeVote(postId);
                                setPosts(prev => prev.map(p =>
                                    (p._id || p.id) === postId
                                        ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: null }
                                        : p
                                ));
                            } catch (e) { console.error('Remove vote failed:', e); }
                        }}
                        onCommentPress={(postId) => {
                            router.push({ pathname: '/post/[id]', params: { id: postId } });
                        }}
                    />
                )}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={() => (
                    !isLoadingPosts ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No posts yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                                This society hasn't posted anything yet.
                            </Text>
                        </View>
                    ) : null
                )}
                ListFooterComponent={() => (
                    isLoadingPosts && posts.length > 0 ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                )}
                removeClippedSubviews={Platform.OS !== 'android'}
            />

            {/* Unfollow Confirmation Modal */}
            <UnfollowModal
                visible={unfollowModalVisible}
                user={profile ? {
                    id: profile.id,
                    name: profile.name,
                    avatarUrl: profile.avatar
                } : null}
                onClose={() => setUnfollowModalVisible(false)}
                onConfirm={() => handleUnfollow()}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        flexGrow: 1,
    },
    profileSection: {
        paddingBottom: 0,
        marginBottom: spacing[2],
        borderBottomWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingTop: spacing[2],
        paddingBottom: spacing[2],
    },
    backButton: {
        padding: spacing[1],
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        paddingBottom: spacing[3],
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: spacing[4],
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: spacing[4],
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameSection: {
        flex: 1,
    },
    name: {
        ...typography.h3,
        fontWeight: '700',
        flexShrink: 1,
    },
    societyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    societyTagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    bio: {
        ...typography.body,
        paddingHorizontal: spacing[5],
        marginBottom: spacing[4],
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        marginBottom: spacing[4],
        gap: spacing[4],
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        ...typography.subtitle,
        fontWeight: '700',
        fontSize: 18,
    },
    statLabel: {
        ...typography.caption,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing[5],
        paddingVertical: spacing[3],
        borderRadius: 12,
        gap: 6,
        marginBottom: spacing[4],
    },
    followButtonText: {
        ...typography.button,
        fontWeight: '700',
    },
    postsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[3],
        borderTopWidth: 1,
    },
    postsHeaderText: {
        ...typography.subtitle,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing[10],
        paddingHorizontal: spacing[6],
    },
    emptyText: {
        ...typography.body,
        fontWeight: '600',
        marginTop: spacing[3],
    },
    emptySubtext: {
        ...typography.caption,
        marginTop: spacing[2],
        textAlign: 'center',
    },
    loadingFooter: {
        paddingVertical: spacing[6],
        alignItems: 'center',
    },
});
