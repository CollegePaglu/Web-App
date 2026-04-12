/**
 * PostDetailModal Component
 * 
 * Full-screen modal for viewing a post from the grid
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/context/ThemeContext';
import { Post } from '@/features/community';
import { PostCard } from '@/features/community/components/PostCard';
import { CommentSection } from '@/features/community/components/CommentSection';
import { SafeArea } from '@/components/layout/SafeArea';
import { communityApi } from '@/api/communityApi';

interface PostDetailModalProps {
    visible: boolean;
    post: Post | null;
    currentUserId?: string;
    onClose: () => void;
    onVote: (postId: string, voteType: 'up' | 'down') => void;
    onRemoveVote: (postId: string) => void;
    onCommentPress: (postId: string) => void;
    onDeletePost?: (postId: string) => Promise<void>;
    /** Refresh grid + modal when post changes (e.g. after comments) */
    onPostUpdated?: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
    visible,
    post,
    currentUserId,
    onClose,
    onVote,
    onRemoveVote,
    onCommentPress,
    onDeletePost,
    onPostUpdated,
}) => {
    const colors = useThemeColors();
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const postId = post?.id ?? '';

    const refreshPostFromServer = useCallback(async () => {
        if (!onPostUpdated || !postId) return;
        try {
            const fresh = await communityApi.getPostById(postId);
            onPostUpdated(fresh);
        } catch {
            /* keep existing post */
        }
    }, [postId, onPostUpdated]);

    const handleCommentsClose = useCallback(() => {
        setShowComments(false);
        void refreshPostFromServer();
    }, [refreshPostFromServer]);

    if (!post) return null;

    const handleCommentPress = () => {
        setShowComments(true);
    };

    const handleDeletePress = () => {
        Alert.alert(
            'Delete Post?',
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!onDeletePost) return;
                        setIsDeleting(true);
                        try {
                            await onDeletePost(post.id);
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeArea backgroundColor={colors.background} style={styles.container}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={28} color={colors.text} />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />

                    {/* Delete Button */}
                    {onDeletePost && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeletePress}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#ED4956" />
                            ) : (
                                <Ionicons name="trash-outline" size={24} color="#ED4956" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Post Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                >
                    <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        onVote={onVote}
                        onRemoveVote={onRemoveVote}
                        onCommentPress={handleCommentPress}
                    />
                </ScrollView>
            </SafeArea>

            {/* Comments Modal */}
            <CommentSection
                postId={post.id}
                visible={showComments}
                onClose={handleCommentsClose}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    closeButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
});
