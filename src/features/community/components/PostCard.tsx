/**
 * PostCard Component - Instagram-style Design
 * 
 * Pure controlled component. All vote state comes from props (usePosts hook).
 * No local vote/like state to prevent double-counting.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
    View,
    Text as RNText,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Post, communityApi } from '../../../api/communityApi';
import { VoteType } from '@/features/community/types';
import { useTheme, useThemeColors } from '@/context/ThemeContext';
import { useFollowStore } from '../../../store/useFollowStore';
import { useRouter } from 'expo-router';
import { UnfollowModal } from './UnfollowModal';
import { PostCardMedia } from './PostCardMedia';
import { AppImage } from '@/components/ui/AppImage';

const CARD_PADDING = 16;
const AVATAR_SIZE = 40;

// Instagram-like colors
const LIKE_COLOR = '#ED4956';
const ICON_SIZE = 26;

const REPORT_REASONS = [
    'Spam or misleading',
    'Harassment or hate',
    'Violence or dangerous acts',
    'Nudity or sexual content',
    'Something else',
] as const;

// Time formatter
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;
    return date.toLocaleDateString();
};

interface PostCardProps {
    post: Post;
    currentUserId?: string;
    onVote: (postId: string, type: VoteType) => void;
    onRemoveVote: (postId: string) => void;
    onCommentPress: (postId: string) => void;
    onDeletePress?: (postId: string) => void;
    onUserPress?: (userId: string) => void;
    onSavePress?: (postId: string) => void;
    hideFollowButton?: boolean;
    /** Whether this post is currently visible on screen */
    isVisible?: boolean;
}

const PostCardInner: React.FC<PostCardProps> = ({
    post,
    currentUserId,
    onVote,
    onRemoveVote,
    onCommentPress,
    onDeletePress,
    onUserPress,
    onSavePress,
    hideFollowButton = false,
    isVisible,
}) => {
    const router = useRouter();
    const { followedRecord, setFollowStatus } = useFollowStore();
    const authorId = post.userId ? String(post.userId) : '';
    // Store wins when set (follow/unfollow anywhere); otherwise use API flag on the post so feed/search/profile stay aligned.
    const fromStore = authorId ? followedRecord[authorId] : undefined;
    const isFollowing =
        fromStore !== undefined ? fromStore : (post.user?.isFollowing ?? false);

    // Unfollow Modal State for PostCard
    const [unfollowModalVisible, setUnfollowModalVisible] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [reportSheetVisible, setReportSheetVisible] = useState(false);
    const [reportStep, setReportStep] = useState<'menu' | 'reasons'>('menu');
    const [reportSuccessVisible, setReportSuccessVisible] = useState(false);
    const lastTapRef = useRef<number>(0);

    const uiColors = useThemeColors();
    const { isDark } = useTheme();

    // Animation values
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    const heartRotate = useSharedValue(0);
    const likeButtonScale = useSharedValue(1);

    // Derive everything from props — NO local vote state
    const isLiked = post.userVote === 'up';
    const isDisliked = post.userVote === 'down';
    const contentTooLong = (post.content?.length || 0) > 150;

    const user = post.user || { name: 'Unknown', avatarUrl: null, isSociety: false };
    const isSocietyPost = !!(user.isSociety || (post as any).authorType === 'CollegeSociety');
    const userName = user.name || 'Unknown';

    // Format time
    const timeAgo = useMemo(() => {
        try {
            return formatTimeAgo(post.createdAt);
        } catch {
            return '';
        }
    }, [post.createdAt]);

    // Double tap like handler
    const handleDoubleTap = useCallback(() => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            // Randomize heart rotation slightly for organic feel
            heartRotate.value = Math.random() > 0.5 ? 15 : -15;

            // Show heart animation
            heartScale.value = withSequence(
                withSpring(1.5, { damping: 10, stiffness: 150 }),
                withDelay(400, withTiming(0, { duration: 250 }))
            );
            heartOpacity.value = withSequence(
                withTiming(1, { duration: 100 }),
                withDelay(400, withTiming(0, { duration: 250 }))
            );

            // Like the post (only if not already liked)
            if (!isLiked) {
                onVote(post.id, 'up');
            }
        }
        lastTapRef.current = now;
    }, [isLiked, onVote, post.id, heartScale, heartOpacity, heartRotate]);

    // Like button handler — delegates to parent, no local state
    const handleLikePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        likeButtonScale.value = withSequence(
            withSpring(1.3, { damping: 10, stiffness: 200 }),
            withSpring(1)
        );

        if (isLiked) {
            onRemoveVote(post.id);
        } else {
            onVote(post.id, 'up');
        }
    }, [isLiked, onVote, onRemoveVote, post.id, likeButtonScale]);

    // Dislike button handler — delegates to parent, no local state
    const handleDislikePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isDisliked) {
            onRemoveVote(post.id);
        } else {
            onVote(post.id, 'down');
        }
    }, [isDisliked, onVote, onRemoveVote, post.id]);

    // Follow button handler — handles logic internally (uses global follow store for all screens)
    const handleFollowPress = useCallback(async () => {
        if (!authorId || authorId === String(currentUserId ?? '')) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isFollowing) {
            setUnfollowModalVisible(true);
        } else {
            setFollowStatus(authorId, true);
            try {
                await communityApi.followUser(authorId);
            } catch (error: any) {
                if (error?.response?.status !== 409) {
                    setFollowStatus(authorId, false);
                }
            }
        }
    }, [isFollowing, authorId, currentUserId, setFollowStatus]);

    const handleConfirmUnfollow = useCallback(async () => {
        if (!authorId) return;
        setFollowStatus(authorId, false);
        try {
            await communityApi.unfollowUser(authorId);
        } catch (error) {
            setFollowStatus(authorId, true);
        }
    }, [authorId, setFollowStatus]);

    // Handle user/society profile navigation
    const handleUserNavigate = useCallback(() => {
        if (onUserPress) {
            onUserPress(post.userId);
            return;
        }

        const isSocietyPost = !!(post.user?.isSociety || (post as any).authorType === 'CollegeSociety');
        if (isSocietyPost) {
            router.push({ pathname: '/society-profile', params: { societyId: post.userId } });
        }
    }, [onUserPress, post.userId, post.user, router]);

    // Animated styles
    const heartOverlayStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: heartScale.value },
            { rotate: `${heartRotate.value}deg` }
        ],
        opacity: heartOpacity.value,
    }));

    const likeButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: likeButtonScale.value }],
    }));

    // Dynamic theme styles
    const dynamicStyles = useMemo(() => ({
        container: {
            backgroundColor: uiColors.surface,
            borderBottomColor: uiColors.border,
        },
        userName: {
            color: uiColors.text,
        },
        timeAgo: {
            color: uiColors.textTertiary,
        },
        content: {
            color: uiColors.text,
        },
        actionIcon: {
            color: uiColors.text,
        },
        likeCount: {
            color: uiColors.text,
        },
        commentCount: {
            color: uiColors.textSecondary,
        },
    }), [uiColors]);

    const skeletonBg =
        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    const canShowPostMenu = Boolean(post.userId && post.userId !== currentUserId);

    const closeReportSheet = useCallback(() => {
        setReportSheetVisible(false);
        setReportStep('menu');
    }, []);

    const openPostMenu = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setReportStep('menu');
        setReportSheetVisible(true);
    }, []);

    const handlePickReportReason = useCallback(() => {
        closeReportSheet();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setReportSuccessVisible(true);
    }, [closeReportSheet]);

    const closeReportSuccess = useCallback(() => {
        setReportSuccessVisible(false);
    }, []);

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.userInfo}
                    onPress={handleUserNavigate}
                >
                    {/* Avatar */}
                    {user.avatarUrl ? (
                        <AppImage uri={user.avatarUrl} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: uiColors.surfaceHighlight }]}>
                            <RNText style={[styles.avatarText, { color: uiColors.primary }]}>
                                {userName.charAt(0).toUpperCase()}
                            </RNText>
                        </View>
                    )}

                    {/* Name and time */}
                    <View style={styles.nameContainer}>
                        <View style={styles.nameRow}>
                            <RNText style={[styles.userName, dynamicStyles.userName]}>
                                {userName}
                            </RNText>
                            {isSocietyPost && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={14}
                                    color={uiColors.primary}
                                    style={styles.verifiedBadge}
                                />
                            )}
                        </View>
                    </View>
                </Pressable>

                {/* Right side: Follow + post menu (⋯) */}
                <View style={styles.rightHeaderActions}>
                    {!hideFollowButton && post.userId !== currentUserId && (
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                {
                                    backgroundColor: isFollowing ? 'transparent' : uiColors.primary,
                                    borderColor: isFollowing ? uiColors.border : 'transparent',
                                    borderWidth: 1,
                                }
                            ]}
                            onPress={handleFollowPress}
                            activeOpacity={0.7}
                        >
                            <RNText
                                style={[
                                    styles.followButtonText,
                                    { color: isFollowing ? uiColors.text : '#fff' }
                                ]}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </RNText>
                        </TouchableOpacity>
                    )}
                    {canShowPostMenu && (
                        <TouchableOpacity
                            style={styles.postMenuButton}
                            onPress={openPostMenu}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Post options"
                        >
                            <Ionicons name="ellipsis-horizontal" size={22} color={uiColors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {post.mediaUrls && post.mediaUrls.length > 0 ? (
                <PostCardMedia
                    postId={post.id}
                    mediaUrls={post.mediaUrls}
                    onDoubleTap={handleDoubleTap}
                    heartOverlayStyle={heartOverlayStyle}
                    skeletonBgColor={skeletonBg}
                    isVisible={isVisible}
                />
            ) : null}

            {/* Action Row */}
            <View style={styles.actionsRow}>
                <View style={styles.leftActions}>
                    {/* Like */}
                    <Animated.View style={likeButtonStyle}>
                        <TouchableOpacity
                            onPress={handleLikePress}
                            style={styles.actionButton}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={ICON_SIZE}
                                color={isLiked ? LIKE_COLOR : uiColors.text}
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Dislike */}
                    <TouchableOpacity
                        onPress={handleDislikePress}
                        style={styles.actionButton}
                    >
                        <Ionicons
                            name={isDisliked ? "thumbs-down" : "thumbs-down-outline"}
                            size={ICON_SIZE - 2}
                            color={isDisliked ? '#6B7280' : uiColors.text}
                        />
                    </TouchableOpacity>

                    {/* Comment */}
                    <TouchableOpacity
                        onPress={() => onCommentPress(post.id)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="chatbubble-outline" size={ICON_SIZE - 2} color={uiColors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Likes count — directly from props */}
            <View style={styles.engagementContainer}>
                <RNText style={[styles.likesCount, dynamicStyles.likeCount]}>
                    {post.upvotes.toLocaleString()} likes
                </RNText>
            </View>

            {/* Caption */}
            {
                Boolean(post.content) && (
                    <View style={styles.captionContainer}>
                        <RNText style={[styles.caption, dynamicStyles.content]}>
                            <RNText style={styles.captionUsername}>{userName}</RNText>
                            {'  '}
                            {showFullContent || !contentTooLong
                                ? post.content
                                : `${post.content?.slice(0, 150)}...`
                            }
                            {contentTooLong && !showFullContent && (
                                <RNText
                                    style={[styles.moreText, { color: uiColors.textTertiary }]}
                                    onPress={() => setShowFullContent(true)}
                                >
                                    {' more'}
                                </RNText>
                            )}
                        </RNText>
                    </View>
                )
            }

            {/* View comments */}
            {
                post.commentCount > 0 && (
                    <TouchableOpacity
                        onPress={() => onCommentPress(post.id)}
                        style={styles.viewCommentsButton}
                    >
                        <RNText style={[styles.viewCommentsText, dynamicStyles.commentCount]}>
                            View all {post.commentCount} comments
                        </RNText>
                    </TouchableOpacity>
                )
            }

            {/* Time ago */}
            <RNText style={[styles.timeAgo, dynamicStyles.timeAgo]}>
                {timeAgo}
            </RNText>

            {/* Unfollow Modal */}
            <UnfollowModal
                visible={unfollowModalVisible}
                user={{ id: post.userId, name: userName, avatarUrl: user.avatarUrl }}
                onClose={() => setUnfollowModalVisible(false)}
                onConfirm={handleConfirmUnfollow}
            />

            {/* Report options sheet */}
            <Modal
                visible={reportSheetVisible}
                transparent
                animationType="slide"
                onRequestClose={closeReportSheet}
            >
                <View style={styles.reportModalRoot}>
                    <Pressable style={styles.reportBackdrop} onPress={closeReportSheet} />
                    <View style={[styles.reportSheet, { backgroundColor: uiColors.surface }]}>
                    {reportStep === 'menu' ? (
                        <>
                            <RNText style={[styles.reportSheetTitle, { color: uiColors.textSecondary }]}>
                                Post options
                            </RNText>
                            <TouchableOpacity
                                style={[styles.reportSheetRow, { borderBottomColor: uiColors.border }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setReportStep('reasons');
                                }}
                            >
                                <Ionicons name="flag-outline" size={22} color="#FF3B30" />
                                <RNText style={[styles.reportSheetRowText, { color: '#FF3B30' }]}>
                                    Report
                                </RNText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.reportSheetRow} onPress={closeReportSheet}>
                                <RNText style={[styles.reportSheetRowText, { color: uiColors.text }]}>
                                    Cancel
                                </RNText>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.reportBackRow}
                                onPress={() => setReportStep('menu')}
                            >
                                <Ionicons name="chevron-back" size={22} color={uiColors.primary} />
                                <RNText style={{ color: uiColors.primary, fontSize: 16, fontWeight: '600' }}>
                                    Back
                                </RNText>
                            </TouchableOpacity>
                            <RNText style={[styles.reportSheetTitle, { color: uiColors.text, marginBottom: 8 }]}>
                                Why are you reporting this post?
                            </RNText>
                            {REPORT_REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    style={[styles.reportReasonRow, { borderBottomColor: uiColors.border }]}
                                    onPress={handlePickReportReason}
                                >
                                    <RNText style={[styles.reportReasonText, { color: uiColors.text }]}>
                                        {reason}
                                    </RNText>
                                    <Ionicons name="chevron-forward" size={18} color={uiColors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={reportSuccessVisible}
                transparent
                animationType="fade"
                onRequestClose={closeReportSuccess}
            >
                <View style={styles.reportSuccessModalRoot}>
                    <Pressable style={styles.reportSuccessBackdrop} onPress={closeReportSuccess} />
                    <View style={styles.reportSuccessCenter} pointerEvents="box-none">
                        <View
                            style={[
                                styles.reportSuccessCard,
                                {
                                    backgroundColor: uiColors.surface,
                                    borderColor: uiColors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.reportSuccessIconWrap,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(52, 199, 89, 0.22)'
                                            : 'rgba(52, 199, 89, 0.14)',
                                    },
                                ]}
                            >
                                <Ionicons name="checkmark-circle" size={44} color="#30D158" />
                            </View>
                            <RNText style={[styles.reportSuccessTitle, { color: uiColors.text }]}>
                                Reported to team
                            </RNText>
                            <RNText style={[styles.reportSuccessMessage, { color: uiColors.textSecondary }]}>
                                Thanks for letting us know. We’ll review this post and take action if needed.
                            </RNText>
                            <TouchableOpacity
                                style={[styles.reportSuccessButton, { backgroundColor: uiColors.primary }]}
                                onPress={closeReportSuccess}
                                activeOpacity={0.85}
                            >
                                <RNText style={styles.reportSuccessButtonText}>OK</RNText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
};

// Wrap in React.memo — re-renders only when props change
export const PostCard = React.memo(PostCardInner);

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: CARD_PADDING,
        paddingVertical: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nameContainer: {
        marginLeft: 12,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    verifiedBadge: {
        marginLeft: 4,
    },
    menuButton: {
        padding: 8,
    },
    rightHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postMenuButton: {
        paddingVertical: 6,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportModalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    reportBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    reportSheet: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 12,
        maxHeight: '70%',
    },
    reportSheetTitle: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    reportSheetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    reportSheetRowText: {
        fontSize: 16,
        fontWeight: '500',
    },
    reportBackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    reportReasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    reportReasonText: {
        fontSize: 16,
        flex: 1,
        paddingRight: 12,
    },
    reportSuccessModalRoot: {
        flex: 1,
    },
    reportSuccessBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    reportSuccessCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    reportSuccessCard: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 22,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
    reportSuccessIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    reportSuccessTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    reportSuccessMessage: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    reportSuccessButton: {
        alignSelf: 'stretch',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    reportSuccessButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    followButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    followButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: CARD_PADDING,
        paddingTop: 12,
        paddingBottom: 8,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginRight: 16,
        padding: 2,
    },
    engagementContainer: {
        paddingHorizontal: CARD_PADDING,
        marginBottom: 6,
    },
    likesCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    captionContainer: {
        paddingHorizontal: CARD_PADDING,
        marginBottom: 4,
    },
    caption: {
        fontSize: 14,
        lineHeight: 20,
    },
    captionUsername: {
        fontWeight: '600',
    },
    moreText: {
        fontWeight: '400',
    },
    viewCommentsButton: {
        paddingHorizontal: CARD_PADDING,
        paddingVertical: 4,
    },
    viewCommentsText: {
        fontSize: 14,
    },
    timeAgo: {
        fontSize: 11,
        paddingHorizontal: CARD_PADDING,
        paddingBottom: 12,
        marginTop: 4,
    },
});

export default PostCard;
