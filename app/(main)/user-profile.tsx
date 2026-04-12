import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../src/context/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { userService } from '../../src/features/user/api/user.service';
import { useCurrentUser } from '../../src/features/auth';
import { communityApi } from '../../src/api/communityApi';
import { UnfollowModal } from '../../src/features/community/components/UnfollowModal';
import { useFollowStore } from '../../src/store/useFollowStore';
import { AppImage } from '../../src/components/ui/AppImage';

/**
 * Profile GET can return isFollowing: false when auth context is missing or wrong.
 * Never push `false` into the global follow store from this response — it wipes real follows everywhere.
 * UI still uses `followedRecord ?? profile.isFollowing` so "not following" displays correctly when store is empty.
 */
const mergeProfileFollowIntoStore = (profileUserId: string, apiIsFollowing: boolean | undefined) => {
    if (apiIsFollowing !== true) return;
    useFollowStore.getState().setFollowStatus(String(profileUserId), true);
};

type PublicProfile = {
    _id?: string;
    id?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    college?: { name?: string; department?: string; year?: number };
};

export default function UserProfileScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const currentUser = useCurrentUser();
    const { followedRecord, setFollowStatus } = useFollowStore();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [unfollowVisible, setUnfollowVisible] = useState(false);

    const resolvedId = profile?._id || profile?.id || userId;
    const resolvedKey = resolvedId != null ? String(resolvedId) : '';
    const isFollowing = resolvedKey
        ? (followedRecord[resolvedKey] ?? profile?.isFollowing ?? false)
        : false;

    const fetchProfile = useCallback(async () => {
        if (!userId) return;
        setLoadError(null);
        setIsLoading(true);
        try {
            const res = await userService.getPublicProfileById(userId);
            if (res.data) {
                const p = res.data as PublicProfile;
                setProfile(p);
                const id = p._id || p.id || userId;
                if (id != null) {
                    mergeProfileFollowIntoStore(String(id), p.isFollowing);
                }
            } else {
                setLoadError('Could not load profile.');
            }
        } catch {
            setLoadError('Could not load profile.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId && currentUser?._id && userId === currentUser._id) {
            router.replace('/(main)/(tabs)/profile');
            return;
        }
        fetchProfile();
    }, [userId, currentUser?._id, fetchProfile, router]);

    const displayName =
        profile?.displayName ||
        (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : null) ||
        profile?.name ||
        'User';

    const handleFollow = async () => {
        if (!resolvedId) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFollowStatus(resolvedId, true);
        setProfile((prev) =>
            prev ? { ...prev, followersCount: (prev.followersCount ?? 0) + 1, isFollowing: true } : prev
        );
        try {
            await communityApi.followUser(resolvedId);
        } catch {
            setFollowStatus(resolvedId, false);
            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          followersCount: Math.max(0, (prev.followersCount ?? 1) - 1),
                          isFollowing: false,
                      }
                    : prev
            );
        }
    };

    const handleUnfollowConfirm = async (id: string) => {
        setFollowStatus(id, false);
        setProfile((prev) =>
            prev
                ? {
                      ...prev,
                      followersCount: Math.max(0, (prev.followersCount ?? 1) - 1),
                      isFollowing: false,
                  }
                : prev
        );
        try {
            await communityApi.unfollowUser(id);
        } catch {
            setFollowStatus(id, true);
            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          followersCount: (prev.followersCount ?? 0) + 1,
                          isFollowing: true,
                      }
                    : prev
            );
        }
    };

    const formatCount = (n?: number) => {
        const c = n ?? 0;
        if (c >= 1_000_000) return `${(c / 1_000_000).toFixed(1)}M`;
        if (c >= 1000) return `${(c / 1000).toFixed(1)}K`;
        return String(c);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    Profile
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : loadError ? (
                <View style={styles.centered}>
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>{loadError}</Text>
                    <Pressable
                        onPress={fetchProfile}
                        style={({ pressed }) => [
                            styles.retryBtn,
                            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                        ]}
                    >
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </Pressable>
                </View>
            ) : profile ? (
                <ScrollView
                    contentContainerStyle={[styles.scroll, { paddingBottom: spacing[8] }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {profile.avatar ? (
                            <AppImage uri={profile.avatar} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatarPh, { backgroundColor: colors.surfaceHighlight }]}>
                                <Ionicons name="person" size={48} color={colors.textTertiary} />
                            </View>
                        )}
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                            {profile.isVerified ? (
                                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                            ) : null}
                        </View>
                        {profile.username ? (
                            <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username}</Text>
                        ) : null}
                        {profile.bio ? (
                            <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
                        ) : null}
                        {profile.college?.name ? (
                            <View style={styles.collegeRow}>
                                <Ionicons name="school-outline" size={16} color={colors.textTertiary} />
                                <Text style={[styles.college, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {profile.college.name}
                                    {profile.college.department ? ` · ${profile.college.department}` : ''}
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.stats}>
                            <View style={styles.stat}>
                                <Text style={[styles.statNum, { color: colors.text }]}>
                                    {formatCount(profile.followersCount)}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.stat}>
                                <Text style={[styles.statNum, { color: colors.text }]}>
                                    {formatCount(profile.followingCount)}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.followBtn,
                                {
                                    backgroundColor: isFollowing ? 'transparent' : colors.primary,
                                    borderColor: isFollowing ? colors.border : 'transparent',
                                    opacity: pressed ? 0.85 : 1,
                                },
                            ]}
                            onPress={() => {
                                if (!resolvedId) return;
                                if (isFollowing) {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setUnfollowVisible(true);
                                } else {
                                    handleFollow();
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.followBtnText,
                                    { color: isFollowing ? colors.text : '#fff' },
                                ]}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            ) : null}

            <UnfollowModal
                visible={unfollowVisible}
                user={
                    resolvedId
                        ? { id: resolvedId, name: displayName, avatarUrl: profile?.avatar }
                        : null
                }
                onClose={() => setUnfollowVisible(false)}
                onConfirm={handleUnfollowConfirm}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[2],
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { padding: spacing[2] },
    headerTitle: { ...typography.subtitle, fontWeight: '600', flex: 1, textAlign: 'center' },
    headerSpacer: { width: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
    errorText: { ...typography.body, textAlign: 'center', marginBottom: spacing[4] },
    retryBtn: { paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: 12 },
    retryBtnText: { ...typography.button, color: '#fff', fontWeight: '600' },
    scroll: { padding: spacing[4] },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: spacing[5],
        alignItems: 'center',
    },
    avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing[4] },
    avatarPh: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: spacing[4],
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { ...typography.h3, fontWeight: '700', textAlign: 'center' },
    username: { ...typography.caption, marginTop: 4 },
    bio: { ...typography.body, textAlign: 'center', marginTop: spacing[3], lineHeight: 22 },
    collegeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing[3],
        paddingHorizontal: spacing[2],
    },
    college: { ...typography.caption, flex: 1 },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing[5],
        marginBottom: spacing[4],
    },
    stat: { flex: 1, alignItems: 'center' },
    statNum: { ...typography.subtitle, fontWeight: '700' },
    statLabel: { ...typography.caption, marginTop: 2 },
    statDivider: { width: 1, height: 28 },
    followBtn: {
        width: '100%',
        paddingVertical: spacing[3],
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    followBtnText: { ...typography.button, fontWeight: '700' },
});
