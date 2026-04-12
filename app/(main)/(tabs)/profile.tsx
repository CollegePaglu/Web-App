/**
 * Profile Screen - Instagram Style
 * 
 * Modern profile with tabs, grid layout, and premium UI
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  BackHandler,
  View,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeArea } from '../../../src/components/layout/SafeArea';
import { useAuth, useCurrentUser } from '../../../src/features/auth';
import { communityApi } from '../../../src/api/communityApi';
import { Post } from '../../../src/features/community';
import { likeStorage } from '../../../src/features/community/utils/likeStorage';
import { useThemeColors } from '@/context/ThemeContext';
import {
  ProfileHeader,
  ProfileStats,
  PostsGrid,
  SettingsBottomSheet,
  SettingsBottomSheetRef,
  PostDetailModal,
  FollowersListModal,
} from '../../../src/features/profile/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');



export default function ProfileScreen() {
  const user = useCurrentUser();
  const { logout, refreshUser } = useAuth();
  const colors = useThemeColors();

  const settingsSheetRef = useRef<SettingsBottomSheetRef>(null);

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);

  const isFirstProfileFocus = useRef(true);

  // Fetch user's posts (silent = no full-screen loader — for tab refocus)
  const fetchMyPosts = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) setIsLoading(true);
      const response = await communityApi.getMyPosts(1, 50);
      setMyPosts(response.items);
      setPostsCount(response.items.length);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const mergePostFromServer = useCallback(
    (
      postId: string,
      result: { upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }
    ) => {
      const patch = (p: Post) =>
        p.id === postId
          ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes, userVote: result.userVote }
          : p;
      setMyPosts((prev) => prev.map(patch));
      setSelectedPost((prev) => (prev && prev.id === postId ? patch(prev) : prev));
    },
    []
  );

  // Define handlers
  const handleBackPress = useCallback(() => {
    router.replace('/(main)/(tabs)/home');
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshUser(),
      fetchMyPosts(),
    ]);
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/phone-input');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const handleSettingsPress = () => {
    settingsSheetRef.current?.open();
  };

  const handleSupport = () => {
    router.push('/(main)/support');
  };

  const handleEditProfile = () => {
    router.push('/(main)/edit-profile');
  };

  useEffect(() => {
    isFirstProfileFocus.current = true;
  }, [user?._id]);

  // Refetch when the profile tab gains focus (new posts / edits without pull-to-refresh)
  useFocusEffect(
    useCallback(() => {
      const silent = !isFirstProfileFocus.current;
      isFirstProfileFocus.current = false;
      fetchMyPosts({ silent });
    }, [fetchMyPosts])
  );

  // Handle device back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handleBackPress])
  );


  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const result = await communityApi.votePost(postId, voteType);
      mergePostFromServer(postId, result);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleRemoveVote = async (postId: string) => {
    try {
      const result = await communityApi.removeVote(postId);
      mergePostFromServer(postId, { ...result, userVote: null });
    } catch (error) {
      console.error('Remove vote error:', error);
    }
  };

  const handlePostUpdated = useCallback((fresh: Post) => {
    setMyPosts((prev) => prev.map((p) => (p.id === fresh.id ? fresh : p)));
    setSelectedPost((prev) => (prev?.id === fresh.id ? fresh : prev));
  }, []);

  const handleCommentPress = (postId: string) => {
    // Comments are now handled within the PostDetailModal
    // No navigation needed
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await communityApi.deletePost(postId);
      setMyPosts(prev => prev.filter(p => p.id !== postId));
      setPostsCount(prev => Math.max(0, prev - 1));
      handleCloseModal();
    } catch (error) {
      console.error('Delete post error:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeArea edges={['top', 'bottom']} backgroundColor={colors.background} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        >
          {/* Profile Header */}
          <ProfileHeader
            user={user}
            onSettingsPress={handleSettingsPress}
            onAvatarPress={handleEditProfile}
            onBackPress={handleBackPress}
          />

          <ProfileStats
            postsCount={postsCount}
            followersCount={user?.followersCount || 0}
            onPostsPress={() => { }}
            onFollowersPress={() => setFollowersModalVisible(true)}
          />

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Grid Content */}
          <View style={styles.tabContent}>
            <PostsGrid
              posts={myPosts}
              isLoading={isLoading}
              onPostPress={handlePostPress}
              emptyMessage="No posts yet"
              emptyIcon="camera-outline"
            />
          </View>
        </ScrollView>

        {/* Settings Bottom Sheet */}
        <SettingsBottomSheet
          ref={settingsSheetRef}
          onEditProfile={handleEditProfile}
          onSupport={handleSupport}
          onLogout={handleLogout}
        />

        {/* Post Detail Modal */}
        <PostDetailModal
          visible={isPostModalVisible}
          post={selectedPost}
          currentUserId={user?._id}
          onClose={handleCloseModal}
          onVote={handleVote}
          onRemoveVote={handleRemoveVote}
          onCommentPress={handleCommentPress}
          onDeletePost={handleDeletePost}
          onPostUpdated={handlePostUpdated}
        />

        <FollowersListModal
          visible={followersModalVisible}
          onClose={() => setFollowersModalVisible(false)}
          userId={user?._id}
        />
      </SafeArea>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    minHeight: 300,
  },
});
