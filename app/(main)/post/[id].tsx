/**
 * Post Details Screen
 * 
 * Displays a single post with comments.
 */

import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeArea } from '../../../src/components/layout/SafeArea';
import { Text } from '../../../src/components/ui/Text';
import { grey } from '../../../src/theme/colors';
import { communityApi, Post } from '../../../src/api/communityApi';
import { PostCard } from '../../../src/features/community/components/PostCard';
import { CommentSection } from '../../../src/features/community/components/CommentSection';
import { useCurrentUser } from '../../../src/features/auth';

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const currentUser = useCurrentUser();

    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const postRef = useRef<Post | null>(null);
    postRef.current = post;

    const loadPost = useCallback(async (postId: string, opts?: { background?: boolean }) => {
        const background = opts?.background ?? false;
        try {
            if (!background) setIsLoading(true);
            const data = await communityApi.getPostById(postId);
            setPost(data);
        } catch (error) {
            console.error('Error fetching post:', error);
            if (!background) {
                Alert.alert('Error', 'Failed to load post');
            }
        } finally {
            if (!background) setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!id) return;
            const background = postRef.current?.id === id;
            void loadPost(id, { background });
        }, [id, loadPost])
    );

    const handleVote = async (postId: string, type: 'up' | 'down') => {
        if (!post) return;
        try {
            const result = await communityApi.votePost(postId, type);
            setPost(prev => prev ? ({
                ...prev,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
                userVote: result.userVote
            }) : null);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleRemoveVote = async (postId: string) => {
        if (!post) return;
        try {
            const result = await communityApi.removeVote(postId);
            setPost(prev => prev ? ({
                ...prev,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
                userVote: result.userVote
            }) : null);
        } catch (error) {
            console.error('Error removing vote:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={grey[0]} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.errorContainer}>
                <Text variant="h3" color="secondary">Post not found</Text>
            </View>
        );
    }

    return (
        <SafeArea edges={['top']} style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Post',
                    headerStyle: { backgroundColor: grey[950] },
                    headerTintColor: grey[0],
                    headerBackTitle: '',
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <PostCard
                    post={post}
                    currentUserId={currentUser?._id}
                    onVote={handleVote}
                    onRemoveVote={handleRemoveVote}
                    onCommentPress={() => setShowComments(true)}
                    onDeletePress={async (postId) => {
                        // Handle delete
                        try {
                            await communityApi.deletePost(postId);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    }}
                />
            </ScrollView>

            {/* Comments Modal */}
            <Modal
                visible={showComments}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    setShowComments(false);
                    void loadPost(post.id, { background: true });
                }}
            >
                <CommentSection
                    postId={post.id}
                    onClose={() => {
                        setShowComments(false);
                        void loadPost(post.id, { background: true });
                    }}
                />
            </Modal>
        </SafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: grey[950],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: grey[950],
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: grey[950],
    },
    content: {
        paddingBottom: 40,
    }
});
