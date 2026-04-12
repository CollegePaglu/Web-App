/**
 * Modal listing followers (display names + subtle initials avatar).
 */

import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/context/ThemeContext';
import { communityApi, FollowerListEntry } from '@/api/communityApi';
import { SafeArea } from '@/components/layout/SafeArea';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface FollowersListModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string | undefined;
}

const AVATAR_BACKGROUNDS = [
    '#148659',
    '#1B9D6B',
    '#0F6D48',
    '#047857',
    '#059669',
    '#0D9488',
    '#0891B2',
];

function initialFromName(name: string): string {
    const t = name.trim();
    if (!t) return '?';
    return t.charAt(0).toUpperCase();
}

function avatarColor(name: string): string {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return AVATAR_BACKGROUNDS[sum % AVATAR_BACKGROUNDS.length];
}

const FollowerAvatar = memo(function FollowerAvatar({
    name,
    avatarUrl,
}: {
    name: string;
    avatarUrl?: string | null;
}) {
    const [imageFailed, setImageFailed] = useState(false);
    const showPhoto = Boolean(avatarUrl && !imageFailed);

    if (showPhoto) {
        return (
            <AppImage
                uri={avatarUrl as string}
                style={styles.avatarImage}
                contentFit="cover"
                onError={() => setImageFailed(true)}
            />
        );
    }

    return (
        <View style={[styles.avatar, { backgroundColor: avatarColor(name) }]}>
            <Text style={styles.avatarLetter}>{initialFromName(name)}</Text>
        </View>
    );
});

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
    visible,
    onClose,
    userId,
}) => {
    const colors = useThemeColors();
    const [followers, setFollowers] = useState<FollowerListEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { followers: list } = await communityApi.getFollowers(userId, 1, 100);
            setFollowers(list);
        } catch (e) {
            console.error('Failed to load followers', e);
            setError('Could not load followers');
            setFollowers([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (visible && userId) {
            load();
        } else if (!visible) {
            setFollowers([]);
            setError(null);
        }
    }, [visible, userId, load]);

    const countLabel = useMemo(() => {
        if (loading) return '…';
        return String(followers.length);
    }, [loading, followers.length]);

    const headerSubtitle = loading
        ? 'Loading…'
        : `${followers.length} ${followers.length === 1 ? 'person' : 'people'}`;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeArea edges={['top', 'bottom']} backgroundColor={colors.background} style={styles.container}>
                <View style={styles.sheetGrabberWrap}>
                    <View style={[styles.sheetGrabber, { backgroundColor: colors.muted }]} />
                </View>

                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.closeCircle, { backgroundColor: colors.surfaceHighlight }]}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitles}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Followers</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            {error ? 'Something went wrong' : headerSubtitle}
                        </Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={[styles.countText, { color: colors.primary }]}>{countLabel}</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingHint, { color: colors.textSecondary }]}>
                            Fetching your followers
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.centered}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="cloud-offline-outline" size={40} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>{error}</Text>
                        <TouchableOpacity
                            onPress={load}
                            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.retryBtnText, { color: colors.primaryForeground }]}>Try again</Text>
                        </TouchableOpacity>
                    </View>
                ) : followers.length === 0 ? (
                    <View style={styles.centered}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="people-outline" size={44} color={colors.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No followers yet</Text>
                        <Text style={[styles.emptyCaption, { color: colors.textSecondary }]}>
                            When someone follows you, they will appear here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={followers}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.row,
                                    { backgroundColor: colors.surface, borderColor: colors.border, gap: spacing[4] },
                                    Platform.OS === 'ios' ? shadows.xs : {},
                                ]}
                            >
                                <FollowerAvatar name={item.name} avatarUrl={item.avatarUrl} />
                                <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </View>
                        )}
                    />
                )}
            </SafeArea>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sheetGrabberWrap: {
        alignItems: 'center',
        paddingTop: spacing[2],
        paddingBottom: spacing[1],
    },
    sheetGrabber: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: spacing[3],
    },
    closeCircle: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitles: {
        flex: 1,
        minWidth: 0,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: '500',
    },
    countBadge: {
        minWidth: 36,
        alignItems: 'flex-end',
    },
    countText: {
        fontSize: 20,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[8],
    },
    loadingHint: {
        marginTop: spacing[4],
        fontSize: 15,
        fontWeight: '500',
    },
    emptyIconWrap: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[4],
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    emptyCaption: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 280,
    },
    retryBtn: {
        marginTop: spacing[6],
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[8],
        borderRadius: borderRadius.xl,
    },
    retryBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[2],
        paddingBottom: spacing[8],
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        borderRadius: borderRadius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing[2],
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(128,128,128,0.15)',
    },
    avatarLetter: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    nameText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
});
