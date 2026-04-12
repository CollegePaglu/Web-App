import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/context/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { userService } from '../../src/features/user/api/user.service';
import { communityApi } from '../../src/api/communityApi';
import { User } from '../../src/features/user/types';
import { UnfollowModal } from '../../src/features/community/components/UnfollowModal';
import * as Haptics from 'expo-haptics';
import { useFollowStore } from '../../src/store/useFollowStore';
import { AppImage } from '../../src/components/ui/AppImage';

export default function SearchScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { followedRecord, setFollowStatus, syncFollowStatuses } = useFollowStore();

    // Unfollow modal state
    const [unfollowModalVisible, setUnfollowModalVisible] = useState(false);
    const [selectedUserToUnfollow, setSelectedUserToUnfollow] = useState<{ id: string; name: string; avatarUrl?: string } | null>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch results when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            setPage(1);
            fetchResults(debouncedQuery, 1, true);
        } else {
            setResults([]);
            setHasMore(false);
        }
    }, [debouncedQuery]);

    const fetchResults = async (query: string, pageNum: number, isNewSearch: boolean = false) => {
        if (!query.trim()) return;

        try {
            setIsLoading(true);
            const response = await userService.searchUsers(query, pageNum, 20);

            if (response.data) {
                if (isNewSearch) {
                    setResults(response.data);
                } else {
                    setResults(prev => [...prev, ...response.data!]);
                }

                // Sync initial states to the global store
                const statuses: Record<string, boolean> = {};
                response.data.forEach(u => {
                    const id = u._id || (u as any).id;
                    const isFollowing = (u as any).isFollowing;
                    if (id != null && isFollowing !== undefined) {
                        statuses[String(id)] = isFollowing;
                    }
                });
                syncFollowStatuses(statuses);

                setHasMore(response.data.length === 20); // Assuming limit is 20
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        if (!isLoading && hasMore && debouncedQuery.trim()) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchResults(debouncedQuery, nextPage);
        }
    };

    const handleFollowUser = async (userId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Optimistic UI update
        setFollowStatus(userId, true);
        setResults(prev => prev.map(user =>
            (user._id || (user as any).id) === userId ? { ...user, followersCount: ((user as any).followersCount || 0) + 1 } : user
        ));

        try {
            await communityApi.followUser(userId);
        } catch (error) {
            console.error('Failed to follow user:', error);
            // Revert optimistic update
            setFollowStatus(userId, false);
            setResults(prev => prev.map(user =>
                (user._id || (user as any).id) === userId ? { ...user, followersCount: Math.max(0, ((user as any).followersCount || 1) - 1) } : user
            ));
        }
    };

    const requestUnfollow = (user: { id: string; name: string; avatarUrl?: string }) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedUserToUnfollow(user);
        setUnfollowModalVisible(true);
    };

    const handleUnfollowUser = async (userId: string) => {
        // Optimistic UI update
        setFollowStatus(userId, false);
        setResults(prev => prev.map(user =>
            (user._id || (user as any).id) === userId ? { ...user, followersCount: Math.max(0, ((user as any).followersCount || 1) - 1) } : user
        ));

        try {
            await communityApi.unfollowUser(userId);
        } catch (error) {
            console.error('Failed to unfollow user:', error);
            // Revert optimistic update
            setFollowStatus(userId, true);
            setResults(prev => prev.map(user =>
                (user._id || (user as any).id) === userId ? { ...user, followersCount: ((user as any).followersCount || 0) + 1 } : user
            ));
        }
    };

    const renderItem = ({ item }: { item: User & { isFollowing?: boolean; isSociety?: boolean } }) => {
        const displayName = item.displayName ||
            (item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : null) ||
            item.name ||
            'User';

        const userId = item._id || (item as any).id;
        const userIdKey = userId != null ? String(userId) : '';
        const isFollowingGlobally = userIdKey ? (followedRecord[userIdKey] ?? item.isFollowing ?? false) : (item.isFollowing ?? false);
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.userItem,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderWidth: 1,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if ((item as any).isSociety) {
                        router.push({ pathname: '/society-profile', params: { societyId: userId } });
                    } else {
                        router.push({ pathname: '/user-profile', params: { userId: String(userId) } });
                    }
                }}
            >
                {item.avatar ? (
                    <AppImage uri={item.avatar} style={styles.avatar} contentFit="cover" />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceHighlight }]}>
                        <Ionicons name={(item as any).isSociety ? 'people' : 'person'} size={24} color={colors.textTertiary} />
                    </View>
                )}

                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>
                            {displayName}
                        </Text>
                        {(item as any).isSociety && (
                            <View style={[styles.societyBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                                <Text style={[styles.societyBadgeText, { color: colors.primary }]}>Society</Text>
                            </View>
                        )}
                    </View>
                    {item.bio ? (
                        <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.bio}
                        </Text>
                    ) : null}
                </View>

                {/* Following Status Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.followButton,
                        {
                            backgroundColor: isFollowingGlobally ? 'transparent' : colors.primary,
                            borderColor: isFollowingGlobally ? colors.border : 'transparent',
                            borderWidth: 1,
                            opacity: pressed ? 0.7 : 1,
                        }
                    ]}
                    onPress={() => isFollowingGlobally ? requestUnfollow({
                        id: userId,
                        name: displayName,
                        avatarUrl: item.avatar
                    }) : handleFollowUser(userId)}
                >
                    <Text style={[
                        styles.followButtonText,
                        { color: isFollowingGlobally ? colors.text : '#fff' }
                    ]}>
                        {isFollowingGlobally ? 'Following' : 'Follow'}
                    </Text>
                </Pressable>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, zIndex: 10 }]}>
                    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>

                    <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search users & societies..."
                            placeholderTextColor={colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Results */}
                <FlatList
                    data={results}
                    extraData={followedRecord}
                    keyExtractor={(item) => {
                        const id = item._id || (item as any).id;
                        return id ? id.toString() : Math.random().toString();
                    }}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing[4], paddingTop: spacing[4] }]}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color={colors.primary} />
                            ) : searchQuery.length > 0 ? (
                                <>
                                    <Ionicons name="search-outline" size={64} color={colors.textTertiary} style={{ marginBottom: spacing[4] }} />
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                        No results found for "{searchQuery}"
                                    </Text>
                                    <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                                        Try checking the spelling or use a different name
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.searchIconContainer, { backgroundColor: colors.surfaceHighlight }]}>
                                        <Ionicons name="people-outline" size={48} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.emptyText, { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 0 }]}>
                                        Find friends & societies
                                    </Text>
                                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                        Search for users or college societies to connect and follow.
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                    ListFooterComponent={() => (
                        isLoading && results.length > 0 ? (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : null
                    )}
                />

                {/* Unfollow Confirmation Modal */}
                <UnfollowModal
                    visible={unfollowModalVisible}
                    user={selectedUserToUnfollow}
                    onClose={() => setUnfollowModalVisible(false)}
                    onConfirm={handleUnfollowUser}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        paddingBottom: spacing[4],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        padding: spacing[2],
        marginRight: spacing[2],
        marginLeft: -spacing[2],
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: spacing[4],
        height: 44,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: spacing[2],
    },
    searchInput: {
        flex: 1,
        height: '100%',
        ...typography.body,
    },
    clearButton: {
        padding: spacing[1],
    },
    listContent: {
        flexGrow: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        marginHorizontal: spacing[4],
        marginBottom: spacing[3],
        borderRadius: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: spacing[3],
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: spacing[3],
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    displayName: {
        ...typography.subtitle,
        marginBottom: 2,
        fontWeight: '600',
    },
    bio: {
        ...typography.caption,
        marginTop: 2,
    },
    followButton: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: 20,
        marginLeft: spacing[3],
    },
    followButtonText: {
        ...typography.caption,
        fontWeight: '700',
    },
    societyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    societyBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing[10],
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        marginTop: spacing[4],
    },
    emptySubtext: {
        ...typography.body,
        textAlign: 'center',
        marginTop: spacing[2],
        paddingHorizontal: spacing[8],
        fontSize: 14,
    },
    searchIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    loadingFooter: {
        paddingVertical: spacing[6],
        alignItems: 'center',
    },
});
