import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    Text,
    Pressable,
    Modal,
    Alert,
    DeviceEventEmitter,
    ViewToken,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useFeedFlashListProps } from '../hooks/useFeedFlashListProps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { grey, extendedColors as colors, shadowColors } from '../../../theme/colors';
import { usePosts } from '../hooks/usePosts';
import { useStories } from '../hooks/useStories';
import { Post, UserStories } from '../types';
import { useCurrentUser } from '../../auth';
import { communityApi } from '../../../api/communityApi';
import { useThemeColors } from '@/context/ThemeContext';
import { useFollowStore } from '../../../store/useFollowStore';

// Components
import { StoriesRow } from './StoriesRow';
import { StoryViewerModal } from './StoryViewerModal';
import { PostCard } from './PostCard';
import { CommentSection } from './CommentSection';
import { CreatePostModal } from './CreatePostModal';
import { UnfollowModal } from './UnfollowModal';
import { NativeAdCard } from './NativeAdCard';
import { warmNativeAdPool } from '../nativeAdPool';
import { FeedSkeleton } from './FeedSkeleton';
import { HOME_TAB_DOUBLE_TAP_EVENT } from '@/components/navigation/CustomTabBar';

export const CommunityFeed = () => {
    const insets = useSafeAreaInsets();
    const currentUser = useCurrentUser();

    // Hooks
    const {
        posts,
        isLoading: isLoadingPosts,
        isRefreshing,
        isLoadingMore,
        hasMore,
        fetchPosts,
        refreshPosts,
        loadMorePosts,
        votePost,
        removeVote,
        addPostToFeed,
    } = usePosts();

    const {
        userStories,
        myStories,
        isLoading: isLoadingStories,
        fetchStoryFeed,
        fetchMyStories,
        createStory,
        deleteStory,
    } = useStories();

    // Modal states
    const [showComments, setShowComments] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [unfollowTarget, setUnfollowTarget] = useState<{ id: string, name: string, avatarUrl?: string } | null>(null);
    const [isUploadingStory, setIsUploadingStory] = useState(false);

    const listRef = useRef<FlashListRef<Post>>(null);

    const { syncFollowStatuses } = useFollowStore();
    const followedRecord = useFollowStore((s) => s.followedRecord);

    // Story viewer state
    const [showStoryViewer, setShowStoryViewer] = useState(false);
    const [selectedUserStories, setSelectedUserStories] = useState<UserStories | null>(null);
    const [initialStoryIndex, setInitialStoryIndex] = useState(0);

    // Track which posts are currently visible on screen (for video pause/play)
    const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const ids = new Set<string>();
            viewableItems.forEach((item) => {
                if (item.isViewable && item.item?.id) {
                    ids.add(item.item.id);
                }
            });
            setVisiblePostIds(ids);
        },
        []
    );

    const fetchFollowingList = useCallback(async () => {
        if (!currentUser?._id) return;
        try {
            const data = await communityApi.getFollowing(currentUser._id, 1, 500);
            const statuses: Record<string, boolean> = {};
            data.items.forEach(item => {
                const id = item.id || item._id;
                if (id != null) statuses[String(id)] = true;
            });
            syncFollowStatuses(statuses);
        } catch (error) {
            console.error('Failed to fetch following list', error);
        }
    }, [currentUser?._id, syncFollowStatuses]);

    // Initial fetch called by parent or on mount?
    // Since this is now a component, we can fetch on mount.
    useEffect(() => {
        warmNativeAdPool();
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchStoryFeed();
        fetchMyStories();
        fetchFollowingList();
    }, [fetchFollowingList, fetchPosts, fetchStoryFeed, fetchMyStories]);

    // Listen for POST_CREATED events from other screens (e.g. Create layout tab)
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('POST_CREATED', (newPost: Post) => {
            console.log('📡 Received POST_CREATED event, optimistically adding to feed');
            addPostToFeed(newPost);
        });

        return () => {
            subscription.remove();
        };
    }, [addPostToFeed]);

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        await Promise.all([
            refreshPosts(),
            fetchStoryFeed(),
            fetchMyStories(),
            fetchFollowingList(),
        ]);
    }, [refreshPosts, fetchStoryFeed, fetchMyStories, fetchFollowingList]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(HOME_TAB_DOUBLE_TAP_EVENT, () => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
            void handleRefresh();
        });
        return () => sub.remove();
    }, [handleRefresh]);

    // End reached handler (infinite scroll)
    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            loadMorePosts();
        }
    }, [hasMore, isLoadingMore, loadMorePosts]);

    // Comment press handler
    const handleCommentPress = (postId: string) => {
        setSelectedPostId(postId);
        setShowComments(true);
    };

    // Story press handler
    const handleStoryPress = useCallback((targetUserStories: UserStories, index: number) => {
        setSelectedUserStories(targetUserStories);
        setInitialStoryIndex(0); // Start from first story of user
        setShowStoryViewer(true);
    }, []);

    // Add story handler - Pick image and upload
    const handleAddStory = useCallback(async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photos to add stories');
                return;
            }

            // Pick image or video
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.8,
                videoMaxDuration: 30, // 30 seconds max for stories
            });

            if (result.canceled || !result.assets[0]) {
                return;
            }

            const asset = result.assets[0];
            const isVideo = asset.type === 'video' || (asset.mimeType?.startsWith('video') ?? false);
            setIsUploadingStory(true);

            // Upload media first
            const filename = asset.uri.split('/').pop() || (isVideo ? 'story.mp4' : 'story.jpg');
            const mediaResponse = await communityApi.uploadMedia([{
                uri: asset.uri,
                type: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
                name: filename,
            }]);

            // Get uploaded URL — video files return in .video, images in .images
            const uploadedUrl = isVideo
                ? mediaResponse.video?.url
                : mediaResponse.images[0]?.url;

            if (!uploadedUrl) {
                throw new Error('Failed to upload story media');
            }

            // Create story with uploaded URL
            const story = await createStory({
                mediaUrl: uploadedUrl,
                mediaType: isVideo ? 'video' : 'image',
            });

            if (story) {
                Alert.alert('Success', 'Your story has been posted!');
                fetchMyStories();
                fetchStoryFeed();
            }
        } catch (error: any) {
            console.error('Error creating story:', error);
            Alert.alert('Error', error.message || 'Failed to create story');
        } finally {
            setIsUploadingStory(false);
        }
    }, [createStory, fetchMyStories, fetchStoryFeed]);

    // My story handler  
    const handleMyStoryPress = useCallback(() => {
        if (myStories && myStories.length > 0) {
            // Construct UserStories object for viewing own stories
            const myUserStories: UserStories = {
                userId: currentUser?._id || 'me',
                user: {
                    id: currentUser?._id || 'me',
                    name: 'Your Story',
                    avatarUrl: currentUser?.avatar,
                },
                stories: myStories,
                hasUnviewed: false,
                latestStoryAt: myStories[myStories.length - 1]?.createdAt || new Date().toISOString(),
            };

            setSelectedUserStories(myUserStories);
            setInitialStoryIndex(0);
            setShowStoryViewer(true);
        } else {
            handleAddStory();
        }
    }, [myStories, currentUser, handleAddStory]);

    // Post created handler
    const handlePostCreated = () => {
        console.log('📝 Post created! Refreshing feed...');
        refreshPosts();
    };

    // Memoize header to prevent StoriesRow from remounting (which resets scroll position)
    const listHeader = useMemo(() => (
        <View>
            <StoriesRow
                userStories={userStories}
                myStories={myStories}
                isLoading={isLoadingStories}
                onStoryPress={handleStoryPress}
                onAddStoryPress={handleAddStory}
                onMyStoryPress={handleMyStoryPress}
            />
        </View>
    ), [userStories, myStories, isLoadingStories, handleStoryPress, handleAddStory, handleMyStoryPress]);

    const renderPost = useCallback(({ item, index }: { item: Post, index: number }) => (
        <View style={styles.feedRow} collapsable={false}>
            {index > 0 && index % 5 === 0 && (
                <NativeAdCard />
            )}
            <PostCard
                post={item}
                currentUserId={currentUser?._id}
                onVote={votePost}
                onRemoveVote={removeVote}
                onCommentPress={handleCommentPress}
                isVisible={visiblePostIds.has(item.id)}
            />
        </View>
    ), [currentUser?._id, votePost, removeVote, handleCommentPress, visiblePostIds]);

    const uiColors = useThemeColors();
    const flashScrollProps = useFeedFlashListProps();

    const renderEmpty = useCallback(() => {
        if (isLoadingPosts) {
            return <FeedSkeleton count={3} />;
        }
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={64} color={uiColors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: uiColors.text }]}>No posts yet</Text>
                <Text style={[styles.emptyText, { color: uiColors.textSecondary }]}>Be the first to share something!</Text>
                <Pressable
                    style={[styles.createFirstButton, { backgroundColor: uiColors.primary }]}
                    onPress={() => setShowCreatePost(true)}
                >
                    <Text style={styles.createFirstText}>Create Post</Text>
                </Pressable>
            </View>
        );
    }, [isLoadingPosts, uiColors.textTertiary, uiColors.text, uiColors.textSecondary, uiColors.primary]);

    const getItemType = useCallback((_item: Post, index: number) => {
        if (index > 0 && index % 5 === 0) return 'postWithAd';
        return 'post';
    }, []);

    const renderFooterCb = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <Text style={styles.footerText}>Loading more...</Text>
            </View>
        );
    }, [isLoadingMore]);

    return (
        <View style={[styles.container, { backgroundColor: uiColors.background }]}>
            <FlashList
                ref={listRef}
                {...flashScrollProps}
                data={posts ?? []}
                extraData={{
                    loadingEmpty: (posts?.length ?? 0) === 0 ? isLoadingPosts : false,
                    followedRecord,
                    visiblePostIds,
                }}
                getItemType={getItemType}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={listHeader}
                ListFooterComponent={renderFooterCb}
                ListEmptyComponent={renderEmpty}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={grey[400]}
                        colors={[grey[400]]}
                    />
                }
                showsVerticalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                contentContainerStyle={(posts?.length ?? 0) === 0 ? styles.emptyList : styles.listContent}
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

            {/* Story Viewer Modal */}
            {selectedUserStories && (
                <Modal
                    visible={showStoryViewer}
                    animationType="fade"
                    transparent={false}
                    onRequestClose={() => setShowStoryViewer(false)}
                >
                    <StoryViewerModal
                        visible={showStoryViewer}
                        onClose={() => setShowStoryViewer(false)}
                        userStories={selectedUserStories}
                        initialStoryIndex={initialStoryIndex}
                        onStoryViewed={async (id: string) => {
                            try {
                                await communityApi.viewStory(id);
                                console.log('Story view recorded:', id);
                            } catch (e) {
                                console.error('Failed to record story view', e);
                            }
                        }}
                        onDeleteStory={async (storyId: string) => {
                            const success = await deleteStory(storyId);
                            if (success) {
                                fetchStoryFeed();
                                fetchMyStories();
                            }
                            return success;
                        }}
                        onAddStory={selectedUserStories.userId === (currentUser?._id || 'me')
                            ? () => {
                                setShowStoryViewer(false);
                                // Small delay to allow modal to close smoothly before opening picker
                                setTimeout(() => {
                                    handleAddStory();
                                }, 500);
                            }
                            : undefined
                        }
                    />
                </Modal>
            )}

            {/* Create Post Modal */}
            <Modal
                visible={showCreatePost}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowCreatePost(false)}
            >
                <CreatePostModal
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={handlePostCreated}
                    onAddPostToFeed={addPostToFeed}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    feedRow: {
        width: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50], // Beige background
    },
    listContent: {
        paddingBottom: 100, // Account for bottom tab bar
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        color: grey[600],
        fontSize: 14,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    loadingText: {
        color: grey[600],
        fontSize: 14,
        marginTop: 12,
    },
    emptyTitle: {
        color: grey[800],
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: grey[600],
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
    },
    createFirstButton: {
        marginTop: 24,
        backgroundColor: grey[900],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    createFirstText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
