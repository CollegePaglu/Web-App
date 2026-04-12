/**
 * CommentSection — FAANG-level design
 * Features: threaded replies, @mention autocomplete, keyboard-safe layout
 */

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Modal,
    Animated,
    Keyboard,
    KeyboardEvent,
    Easing,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Comment } from '@/features/community/types';
import { communityApi } from '@/api/communityApi';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import { AppImage } from '@/components/ui/AppImage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;

// ─── Time formatter ────────────────────────────────────────────────────────
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
};

// ─── Mention User type ─────────────────────────────────────────────────────
interface MentionUser { id: string; name: string; avatarUrl?: string; }

// ─── Reply target state ────────────────────────────────────────────────────
interface ReplyTarget { commentId: string; userName: string; }

// ─── Props ─────────────────────────────────────────────────────────────────
interface CommentSectionProps {
    postId: string;
    visible: boolean;
    onClose: () => void;
    currentUserAvatar?: string | null;
}

// ─── Mention detection regex ───────────────────────────────────────────────
const MENTION_REGEX = /@([\w]*)$/;

// ─── Single Reply Row ──────────────────────────────────────────────────────
const ReplyRow: React.FC<{
    reply: Comment;
    uiColors: any;
    isDark: boolean;
    onReplyPress: (target: ReplyTarget) => void;
}> = ({ reply, uiColors, isDark, onReplyPress }) => {
    const timeAgo = (() => { try { return formatTimeAgo(reply.createdAt); } catch { return ''; } })();
    return (
        <View style={replyStyles.row}>
            <View style={replyStyles.threadLine} />
            {reply.user.avatarUrl ? (
                <AppImage uri={reply.user.avatarUrl} style={replyStyles.avatar} contentFit="cover" />
            ) : (
                <View style={[replyStyles.avatarPlaceholder, { backgroundColor: uiColors.surfaceHighlight }]}>
                    <Text style={[replyStyles.avatarInitial, { color: uiColors.primary }]}>
                        {reply.user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
            )}
            <View style={replyStyles.body}>
                <View style={[replyStyles.bubble, { backgroundColor: isDark ? '#252525' : '#EBEBEB' }]}>
                    <Text style={[replyStyles.author, { color: uiColors.text }]}>{reply.user.name}</Text>
                    <Text style={[replyStyles.content, { color: uiColors.text }]}>{reply.content}</Text>
                </View>
                <View style={replyStyles.meta}>
                    <Text style={[replyStyles.time, { color: uiColors.textTertiary }]}>{timeAgo}</Text>
                    <Text style={[replyStyles.dot, { color: uiColors.textTertiary }]}>·</Text>
                    <TouchableOpacity onPress={() => onReplyPress({ commentId: reply.parentId!, userName: reply.user.name })}>
                        <Text style={[replyStyles.replyBtn, { color: uiColors.textSecondary }]}>Reply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const replyStyles = StyleSheet.create({
    row: { flexDirection: 'row', marginTop: 10, marginLeft: 48, alignItems: 'flex-start' },
    threadLine: { width: 1.5, backgroundColor: 'rgba(128,128,128,0.25)', position: 'absolute', left: -20, top: 0, bottom: 0 },
    avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginTop: 2 },
    avatarPlaceholder: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 11, fontWeight: '700' },
    body: { flex: 1 },
    bubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
    author: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
    content: { fontSize: 13, lineHeight: 18 },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 4, gap: 6 },
    time: { fontSize: 11, fontWeight: '500' },
    dot: { fontSize: 11 },
    replyBtn: { fontSize: 11, fontWeight: '600' },
});

// ─── Comment Row Component ─────────────────────────────────────────────────
const CommentRow: React.FC<{
    item: Comment;
    postId: string;
    uiColors: any;
    isDark: boolean;
    onReplyPress: (target: ReplyTarget) => void;
}> = ({ item, postId, uiColors, isDark, onReplyPress }) => {
    const [expanded, setExpanded] = useState(false);
    const [replies, setReplies] = useState<Comment[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const timeAgo = (() => { try { return formatTimeAgo(item.createdAt); } catch { return ''; } })();

    const handleExpandReplies = async () => {
        if (expanded) { setExpanded(false); return; }
        setLoadingReplies(true);
        try {
            const data = await communityApi.getReplies(postId, item.id);
            setReplies(data);
            setExpanded(true);
        } catch { /* silent fail */ }
        finally { setLoadingReplies(false); }
    };

    const replyCount = item.replyCount ?? 0;

    return (
        <View style={rowStyles.container}>
            {/* Avatar */}
            {item.user.avatarUrl ? (
                <AppImage uri={item.user.avatarUrl} style={rowStyles.avatar} contentFit="cover" />
            ) : (
                <View style={[rowStyles.avatarPlaceholder, { backgroundColor: uiColors.surfaceHighlight }]}>
                    <Text style={[rowStyles.avatarInitial, { color: uiColors.primary }]}>
                        {item.user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
            )}

            <View style={rowStyles.right}>
                {/* Bubble */}
                <View style={[rowStyles.bubble, { backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0' }]}>
                    <Text style={[rowStyles.author, { color: uiColors.text }]}>{item.user.name}</Text>
                    <Text style={[rowStyles.content, { color: uiColors.text }]}>{item.content}</Text>
                </View>

                {/* Meta row */}
                <View style={rowStyles.meta}>
                    <Text style={[rowStyles.time, { color: uiColors.textTertiary }]}>{timeAgo}</Text>
                    <Text style={[rowStyles.dot, { color: uiColors.textTertiary }]}>·</Text>
                    <TouchableOpacity onPress={() => onReplyPress({ commentId: item.id, userName: item.user.name })}>
                        <Text style={[rowStyles.replyBtn, { color: uiColors.textSecondary }]}>Reply</Text>
                    </TouchableOpacity>
                    {replyCount > 0 && (
                        <>
                            <Text style={[rowStyles.dot, { color: uiColors.textTertiary }]}>·</Text>
                            <TouchableOpacity onPress={handleExpandReplies}>
                                {loadingReplies ? (
                                    <ActivityIndicator size="small" color={uiColors.primary} style={{ marginLeft: 2 }} />
                                ) : (
                                    <Text style={[rowStyles.viewReplies, { color: uiColors.primary }]}>
                                        {expanded ? 'Hide replies' : `View ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Inline replies */}
                {expanded && replies.map(r => (
                    <ReplyRow
                        key={r.id}
                        reply={r}
                        uiColors={uiColors}
                        isDark={isDark}
                        onReplyPress={onReplyPress}
                    />
                ))}
            </View>
        </View>
    );
};

const rowStyles = StyleSheet.create({
    container: { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-start' },
    avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10, marginTop: 2 },
    avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, marginRight: 10, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 15, fontWeight: '700' },
    right: { flex: 1 },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    author: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
    content: { fontSize: 14, lineHeight: 20 },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4, gap: 6, flexWrap: 'wrap' },
    time: { fontSize: 12, fontWeight: '500' },
    dot: { fontSize: 12 },
    replyBtn: { fontSize: 12, fontWeight: '600' },
    viewReplies: { fontSize: 12, fontWeight: '700' },
});

// ─── Main CommentSection (content inside Modal + SafeAreaProvider) ───────────
const CommentSectionContent: React.FC<CommentSectionProps> = ({
    postId,
    visible,
    onClose,
    currentUserAvatar,
}) => {
    const uiColors = useThemeColors();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Reply state
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

    // @mention state
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
    const [mentionLoading, setMentionLoading] = useState(false);
    const mentionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inputRef = useRef<TextInput>(null);
    const listRef = useRef<FlatList>(null);

    // ── Keyboard tracking ───────────────────────────────────────────────────
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const dur = Platform.OS === 'ios' ? 250 : 180;

        const onShow = (e: KeyboardEvent) => {
            const h = e.endCoordinates.height + 5;
            setKeyboardHeight(h);
            Animated.timing(keyboardOffset, { toValue: h, duration: dur, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
        };
        const onHide = () => {
            setKeyboardHeight(0);
            Animated.timing(keyboardOffset, { toValue: 0, duration: dur, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
        };

        const subShow = Keyboard.addListener(showEvent, onShow);
        const subHide = Keyboard.addListener(hideEvent, onHide);
        return () => { subShow.remove(); subHide.remove(); };
    }, [keyboardOffset]);

    useEffect(() => {
        if (!visible) {
            keyboardOffset.setValue(0);
            setNewComment('');
            setReplyTarget(null);
            setMentionQuery(null);
            setMentionUsers([]);
        }
    }, [visible, keyboardOffset]);

    // ── Fetch root comments ─────────────────────────────────────────────────
    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await communityApi.getComments(postId);
            // Only show root comments (no parentId)
            setComments(response.items.filter(c => !c.parentId));
        } catch (err: any) {
            setError(err.message || 'Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (visible) {
            fetchComments();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [visible, fetchComments]);

    // ── Handle text change + @mention detection ─────────────────────────────
    const handleTextChange = useCallback((text: string) => {
        setNewComment(text);

        // Detect @mention pattern at cursor end
        const match = text.match(MENTION_REGEX);
        if (match) {
            const query = match[1];
            setMentionQuery(query);

            // Debounce search
            if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current);
            mentionDebounceRef.current = setTimeout(async () => {
                setMentionLoading(true);
                const results = await communityApi.searchUsers(query);
                setMentionUsers(results);
                setMentionLoading(false);
            }, 300);
        } else {
            setMentionQuery(null);
            setMentionUsers([]);
        }
    }, []);

    // ── Insert @mention suggestion ──────────────────────────────────────────
    const handleMentionSelect = useCallback((user: MentionUser) => {
        // Replace current @query with @Name + space
        const replaced = newComment.replace(MENTION_REGEX, `@${user.name} `);
        setNewComment(replaced);
        setMentionQuery(null);
        setMentionUsers([]);
        inputRef.current?.focus();
    }, [newComment]);

    // ── Set reply target ───────────────────────────────────────────────────
    const handleReplyPress = useCallback((target: ReplyTarget) => {
        setReplyTarget(target);
        // Pre-fill input with @name
        setNewComment(`@${target.userName} `);
        setTimeout(() => inputRef.current?.focus(), 100);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const cancelReply = useCallback(() => {
        setReplyTarget(null);
        setNewComment('');
    }, []);

    // ── Send comment / reply ────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!newComment.trim() || isSending) return;
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSending(true);

            const comment = await communityApi.addComment(
                postId,
                newComment.trim(),
                replyTarget?.commentId,
            );

            if (replyTarget) {
                // Bump reply count on parent comment in state
                setComments(prev => prev.map(c =>
                    c.id === replyTarget.commentId
                        ? { ...c, replyCount: (c.replyCount ?? 0) + 1 }
                        : c
                ));
            } else {
                setComments(prev => [comment, ...prev]);
                listRef.current?.scrollToOffset({ offset: 0, animated: true });
            }

            setNewComment('');
            setReplyTarget(null);
            setMentionQuery(null);
            setMentionUsers([]);
        } catch (err: any) {
            setError(err.message || 'Failed to send');
        } finally {
            setIsSending(false);
        }
    }, [newComment, isSending, postId, replyTarget]);

    // ── Styles ──────────────────────────────────────────────────────────────
    const styles = useMemo(() => StyleSheet.create({
        overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
        sheet: {
            backgroundColor: uiColors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
        },
        dragBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: uiColors.border, alignSelf: 'center', marginTop: 10, marginBottom: 2 },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
            borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: uiColors.border,
        },
        headerTitle: { color: uiColors.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
        closeBtn: {
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
            alignItems: 'center', justifyContent: 'center',
        },
        listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
        centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
        stateText: { color: uiColors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8 },
        stateSubText: { color: uiColors.textTertiary, fontSize: 13, textAlign: 'center', marginTop: 4 },
        retryText: { color: uiColors.primary, fontSize: 14, marginTop: 10, fontWeight: '600' },

        // Reply banner
        replyBanner: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 8,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: uiColors.border,
        },
        replyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        replyBannerText: { color: uiColors.textSecondary, fontSize: 13 },
        replyBannerName: { color: uiColors.primary, fontSize: 13, fontWeight: '700' },
        replyBannerClose: { padding: 4 },

        // @mention dropdown
        mentionBox: {
            position: 'absolute', left: 0, right: 0, bottom: '100%',
            backgroundColor: uiColors.surface,
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            borderWidth: StyleSheet.hairlineWidth, borderColor: uiColors.border,
            maxHeight: 220, zIndex: 100,
            shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 12,
        },
        mentionHeader: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: uiColors.border },
        mentionHeaderText: { color: uiColors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
        mentionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
        mentionAvatar: { width: 32, height: 32, borderRadius: 16 },
        mentionAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: uiColors.surfaceHighlight },
        mentionAvatarInitial: { fontSize: 13, fontWeight: '700', color: uiColors.primary },
        mentionName: { color: uiColors.text, fontSize: 14, fontWeight: '600' },
        mentionAt: { color: uiColors.textTertiary, fontSize: 12 },

        // Input bar
        inputBar: {
            flexDirection: 'row', alignItems: 'flex-end',
            paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
            backgroundColor: uiColors.background, gap: 10,
        },
        inputAvatar: { width: 34, height: 34, borderRadius: 17, marginBottom: 4 },
        inputAvatarPlaceholder: {
            width: 34, height: 34, borderRadius: 17, marginBottom: 4,
            backgroundColor: uiColors.surfaceHighlight, alignItems: 'center', justifyContent: 'center',
        },
        inputAvatarInitial: { fontSize: 13, fontWeight: '700', color: uiColors.primary },
        inputWrapper: {
            flex: 1, flexDirection: 'row', alignItems: 'flex-end',
            backgroundColor: isDark ? '#2C2C2E' : '#EFEFEF',
            borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, minHeight: 46,
            borderWidth: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)',
        },
        textInput: { flex: 1, color: uiColors.text, fontSize: 15, lineHeight: 22, maxHeight: 110, paddingTop: 0, paddingBottom: 0 },
        sendBtn: {
            width: 38, height: 38, borderRadius: 19, backgroundColor: uiColors.primary,
            alignItems: 'center', justifyContent: 'center', marginBottom: 4,
            shadowColor: uiColors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 6,
        },
        sendBtnDisabled: { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', shadowOpacity: 0, elevation: 0 },
    }), [uiColors, isDark]);

    const safeHeight = Math.min(SHEET_HEIGHT, SCREEN_HEIGHT - keyboardHeight - 48);
    const hasMentions = mentionQuery !== null && (mentionUsers.length > 0 || mentionLoading);

    return (
        <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose(); }}>
            <Animated.View
                style={[styles.sheet, { height: safeHeight, marginBottom: keyboardOffset }]}
                onStartShouldSetResponder={() => true}
            >
                    {/* Drag bar */}
                    <View style={styles.dragBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            Comments{replyTarget ? ' → Reply' : ''}
                        </Text>
                        <Pressable style={styles.closeBtn} onPress={() => { Keyboard.dismiss(); onClose(); }}>
                            <Ionicons name="close" size={16} color={uiColors.text} />
                        </Pressable>
                    </View>

                    {/* Comment list */}
                    {isLoading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="small" color={uiColors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.centered}>
                            <Ionicons name="alert-circle-outline" size={32} color={uiColors.textTertiary} />
                            <Text style={styles.stateText}>{error}</Text>
                            <Pressable onPress={fetchComments}><Text style={styles.retryText}>Tap to retry</Text></Pressable>
                        </View>
                    ) : (
                        <FlatList
                            ref={listRef}
                            data={comments}
                            keyExtractor={(item: Comment) => item.id}
                            renderItem={({ item }) => (
                                <CommentRow
                                    item={item}
                                    postId={postId}
                                    uiColors={uiColors}
                                    isDark={isDark}
                                    onReplyPress={handleReplyPress}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                            removeClippedSubviews={false}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            initialNumToRender={15}
                            ListEmptyComponent={
                                <View style={styles.centered}>
                                    <Ionicons name="chatbubbles-outline" size={44} color={uiColors.textTertiary} />
                                    <Text style={styles.stateText}>No comments yet</Text>
                                    <Text style={styles.stateSubText}>Be the first to start the conversation!</Text>
                                </View>
                            }
                        />
                    )}

                    {/* Replying to banner */}
                    {replyTarget && (
                        <View style={styles.replyBanner}>
                            <View style={styles.replyBannerLeft}>
                                <Ionicons name="return-down-forward" size={14} color={uiColors.primary} />
                                <Text style={styles.replyBannerText}>Replying to </Text>
                                <Text style={styles.replyBannerName}>@{replyTarget.userName}</Text>
                            </View>
                            <TouchableOpacity onPress={cancelReply} style={styles.replyBannerClose}>
                                <Ionicons name="close-circle" size={18} color={uiColors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ position: 'relative' }}>
                        {/* @Mention dropdown (above input bar) */}
                        {hasMentions && (
                            <View style={styles.mentionBox}>
                                <View style={styles.mentionHeader}>
                                    <Text style={styles.mentionHeaderText}>Mention a user</Text>
                                </View>
                                {mentionLoading ? (
                                    <ActivityIndicator size="small" color={uiColors.primary} style={{ margin: 16 }} />
                                ) : (
                                    <ScrollView bounces={false} keyboardShouldPersistTaps="always">
                                        {mentionUsers.map(user => (
                                            <TouchableOpacity
                                                key={user.id}
                                                style={styles.mentionRow}
                                                onPress={() => handleMentionSelect(user)}
                                            >
                                                {user.avatarUrl ? (
                                                    <AppImage uri={user.avatarUrl} style={styles.mentionAvatar} contentFit="cover" />
                                                ) : (
                                                    <View style={styles.mentionAvatarPlaceholder}>
                                                        <Text style={styles.mentionAvatarInitial}>{user.name?.charAt(0).toUpperCase()}</Text>
                                                    </View>
                                                )}
                                                <View>
                                                    <Text style={styles.mentionName}>{user.name}</Text>
                                                    <Text style={styles.mentionAt}>@{user.name.toLowerCase().replace(/\s+/g, '')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        {/* Input bar — bottom inset for Android 3-button nav + home indicator */}
                        <View style={[styles.inputBar, { paddingBottom: 14 + insets.bottom }]}>
                            {currentUserAvatar ? (
                                <AppImage uri={currentUserAvatar} style={styles.inputAvatar} contentFit="cover" />
                            ) : (
                                <View style={styles.inputAvatarPlaceholder}>
                                    <Text style={styles.inputAvatarInitial}>Y</Text>
                                </View>
                            )}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    ref={inputRef}
                                    style={styles.textInput}
                                    placeholder={replyTarget ? `Reply to @${replyTarget.userName}…` : 'Add a comment…'}
                                    placeholderTextColor={uiColors.textTertiary}
                                    value={newComment}
                                    onChangeText={handleTextChange}
                                    multiline
                                    maxLength={500}
                                    returnKeyType="default"
                                    blurOnSubmit={false}
                                />
                            </View>
                            <Pressable
                                style={[styles.sendBtn, (!newComment.trim() || isSending) && styles.sendBtnDisabled]}
                                onPress={handleSend}
                                disabled={!newComment.trim() || isSending}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color={uiColors.primary} />
                                ) : (
                                    <Ionicons
                                        name="arrow-up"
                                        size={18}
                                        color={(!newComment.trim() || isSending) ? uiColors.textTertiary : '#FFFFFF'}
                                    />
                                )}
                            </Pressable>
                        </View>
                    </View>
            </Animated.View>
        </Pressable>
    );
};

export const CommentSection: React.FC<CommentSectionProps> = (props) => (
    <Modal
        visible={props.visible}
        transparent
        animationType="slide"
        onRequestClose={props.onClose}
        statusBarTranslucent
    >
        <SafeAreaProvider>
            <CommentSectionContent {...props} />
        </SafeAreaProvider>
    </Modal>
);

export default CommentSection;
