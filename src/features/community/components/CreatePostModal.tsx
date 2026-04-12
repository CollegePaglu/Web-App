/**
 * CreatePostModal Component
 * 
 * Modal for creating a new community post with text and media.
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    Pressable,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { grey } from '@/theme/colors';
import { communityApi } from '@/api/communityApi';
import { CreatePostInput, Post } from '@/features/community/types';
import { useCurrentUser } from '@/features/auth';
import { apiCircuitBreaker } from '@/utils/circuitBreaker';
import { AppImage } from '@/components/ui/AppImage';

import { useThemeColors } from '@/context/ThemeContext';

interface CreatePostModalProps {
    onClose: () => void;
    onPostCreated: () => void;
    onAddPostToFeed?: (post: Post) => void; // For optimistic updates
}

const CreatePostModalInner: React.FC<CreatePostModalProps> = ({
    onClose,
    onPostCreated,
    onAddPostToFeed,
}) => {
    const currentUser = useCurrentUser();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const [content, setContent] = useState('');
    const [mediaItems, setMediaItems] = useState<{ uri: string; type: string; name: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Pick images or videos from gallery
    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsMultipleSelection: false, // Disable multiple to allow cropping
                allowsEditing: true, // Enable native cropper
                aspect: [4, 5], // Suggest 4:5 ratio
                quality: 0.8,
                videoMaxDuration: 60, // 60 seconds max for posts
            });

            if (!result.canceled && result.assets.length > 0) {
                const newItems = result.assets.map(asset => {
                    const isVideo = asset.type === 'video' || asset.uri.endsWith('.mp4') || asset.uri.endsWith('.mov');
                    return {
                        uri: asset.uri,
                        type: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
                        name: asset.fileName || asset.uri.split('/').pop() || (isVideo ? 'video.mp4' : 'image.jpg')
                    };
                });
                setMediaItems(prev => [...prev, ...newItems].slice(0, 4));
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    // Take photo with camera
    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                const asset = result.assets[0];
                const newItem = {
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg'
                };
                setMediaItems(prev => [...prev, newItem].slice(0, 4));
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    // Remove selected image
    const removeImage = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    // Create post with media files (sent as form-data)
    const handlePost = async () => {
        if (!content.trim() && mediaItems.length === 0) {
            Alert.alert('Error', 'Please add some content or an image');
            return;
        }

        try {
            setIsPosting(true);
            setIsUploading(true);

            // Check circuit breaker before starting
            const cbMetrics = apiCircuitBreaker.getMetrics();
            console.log('🔌 Circuit breaker status at start:', cbMetrics);

            if (cbMetrics.state === 'OPEN') {
                console.warn('⚠️  Circuit breaker is OPEN - backend may be down');
                Alert.alert(
                    'Service Issue',
                    'Backend service is temporarily unavailable. Try again in a moment.',
                    [{
                        text: 'OK', onPress: () => {
                            setIsPosting(false);
                            setIsUploading(false);
                        }
                    }]
                );
                return;
            }

            console.log('📝 Creating post with:', {
                contentLength: content.trim().length,
                mediaCount: mediaItems.length,
                cbState: apiCircuitBreaker.getMetrics().state,
            });

            // Send post with media files directly (as form-data)
            // Backend handles file upload internally
            const newPost = await communityApi.createPost(
                {
                    content: content.trim(),
                },
                mediaItems // Pass actual File objects
            );

            console.log('✅ Post created successfully:', {
                postId: newPost.id,
                authorId: newPost.userId,
                mediaCount: newPost.mediaUrls.length,
            });

            // Emit event so other active screens (like the feed) can update instantly
            DeviceEventEmitter.emit('POST_CREATED', newPost);

            // Call any locally provided callbacks
            onAddPostToFeed?.(newPost);

            Alert.alert('Success', 'Post created successfully!');
            onPostCreated();
            onClose();
        } catch (error: any) {
            console.error('❌ Error creating post:', error);

            const errorDetails = {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                responseData: error.response?.data,
                isCircuitBreakerError: error.code === 'CIRCUIT_BREAKER_OPEN',
            };
            console.error('Full error details:', errorDetails);

            let userMessage = error.message || 'Failed to create post';
            if (error.code === 'CIRCUIT_BREAKER_OPEN') {
                userMessage = 'Backend service is temporarily unavailable. Please try again in a moment.';
            } else if (error.code === 'NETWORK_ERROR' || error.code === 'CONNECTION_REFUSED') {
                userMessage = 'Network connection error. Please check your internet and try again.';
            }

            Alert.alert('Error', userMessage);
        } finally {
            setIsPosting(false);
            setIsUploading(false);
        }
    };

    const canPost = content.trim().length > 0 || mediaItems.length > 0;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            zIndex: 10,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        postButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.primary,
            borderRadius: 20,
        },
        postButtonDisabled: {
            backgroundColor: colors.border,
        },
        postButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 14,
        },
        postButtonTextDisabled: {
            color: colors.textTertiary,
        },
        content: {
            flex: 1,
            padding: 16,
        },
        userRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        avatarPlaceholder: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceHighlight,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        avatarText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        userName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        input: {
            fontSize: 18,
            color: colors.text,
            minHeight: 120,
            textAlignVertical: 'top',
        },
        uploadingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            padding: 12,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 8,
        },
        uploadingText: {
            marginLeft: 8,
            color: colors.textSecondary,
            fontSize: 14,
        },
        mediaPreview: {
            marginTop: 16,
            marginBottom: 32,
        },
        mediaItem: {
            marginRight: 12,
            position: 'relative',
        },
        mediaImage: {
            width: 200,
            height: 250,
            borderRadius: 12,
            backgroundColor: colors.surfaceHighlight,
        },
        removeButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 12,
        },
        actions: {
            flexDirection: 'row',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 24,
            padding: 8,
        },
        actionText: {
            marginLeft: 8,
            fontSize: 16,
            color: colors.textSecondary,
            fontWeight: '500',
        },
    }), [colors]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={onClose} hitSlop={8}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </Pressable>

                <Text style={styles.headerTitle}>Create Post</Text>

                <Pressable
                    style={[styles.postButton, !canPost && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={!canPost || isPosting}
                >
                    {isPosting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.postButtonText, !canPost && styles.postButtonTextDisabled]}>
                            Post
                        </Text>
                    )}
                </Pressable>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {/* User info */}
                <View style={styles.userRow}>
                    {currentUser?.avatar ? (
                        <AppImage uri={currentUser.avatar} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {currentUser?.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.userName}>{currentUser?.name || 'You'}</Text>
                </View>

                {/* Text input */}
                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.textTertiary}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    autoFocus
                    maxLength={2000}
                />

                {/* Uploading indicator */}
                {isUploading && (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="small" color={colors.textSecondary} />
                        <Text style={styles.uploadingText}>Uploading media...</Text>
                    </View>
                )}

                {/* Selected images */}
                {mediaItems.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.mediaPreview}
                    >
                        {mediaItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <View style={styles.mediaItem}>
                                    <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                                    <Pressable
                                        style={styles.removeButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                                    </Pressable>
                                </View>
                            </React.Fragment>
                        ))}
                    </ScrollView>
                )}
            </ScrollView>

            {/* Actions — bottom inset for 3-button Android nav + edge-to-edge */}
            <View style={[styles.actions, { paddingBottom: 16 + insets.bottom }]}>
                <Pressable style={styles.actionButton} onPress={pickImages}>
                    <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.actionText}>Gallery</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.actionText}>Camera</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

/** Modal windows need their own provider on Android so nav-bar insets are measured correctly. */
export const CreatePostModal: React.FC<CreatePostModalProps> = (props) => (
    <SafeAreaProvider>
        <CreatePostModalInner {...props} />
    </SafeAreaProvider>
);

export default CreatePostModal;
