import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image as RNImage,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  StatusBar,
  ScrollView,
  PanResponder,
  Alert,
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { grey } from '@/theme/colors';
import { Story, StoryViewer, UserStories } from '@/features/community/types';
import { useCurrentUser } from '@/features/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { communityApi } from '@/api/communityApi';
import { resolvePublicMediaUrl } from '@/utils/resolvePublicMediaUrl';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

interface StoryViewerModalProps {
  visible: boolean;
  onClose: () => void;
  userStories: UserStories;
  initialStoryIndex?: number;
  onStoryViewed?: (storyId: string) => void;
  onAddStory?: () => void;
  onDeleteStory?: (storyId: string) => Promise<boolean>;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  visible,
  onClose,
  userStories,
  initialStoryIndex = 0,
  onStoryViewed,
  onAddStory,
  onDeleteStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for tracking story likes
  const [localLikeState, setLocalLikeState] = useState<Record<string, { hasLiked: boolean; likeCount: number }>>({});

  // Use refs for pause state to avoid stale closures in animation callbacks
  const isPausedRef = useRef(false);
  const [isPausedUI, setIsPausedUI] = useState(false); // Only for re-render triggers
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Track if finger is currently down (for distinguishing tap vs hold)
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  const stories = userStories.stories;
  const currentStory = stories[currentIndex];
  const isVideoStory = currentStory?.mediaType === 'video' ||
    /\.(mp4|mov|avi|webm|mkv)$/i.test(currentStory?.mediaUrl || '') ||
    /\/videos?\//i.test(currentStory?.mediaUrl || '');
  const currentUser = useCurrentUser();
  const isOwner = currentUser?._id === userStories.user.id;
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);

  // ---- Viewers Panel State ----
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [likers, setLikers] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const viewersPanelAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

  // ---- Animation Control ----
  const startProgress = useCallback(() => {
    if (isPausedRef.current) return;

    // For video stories, progress is driven by onPlaybackStatusUpdate
    const story = userStories.stories[currentIndex];
    if (story?.mediaType === 'video') return;

    // Get current progress value
    const currentValue = (progressAnim as any)._value || 0;
    const remainingDuration = STORY_DURATION * (1 - currentValue);

    if (remainingDuration <= 0) {
      goNext();
      return;
    }

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
      // Linear easing for smooth consistent progress
    });

    animationRef.current.start(({ finished }) => {
      if (finished && !isPausedRef.current) {
        goNext();
      }
    });
  }, [currentIndex, stories.length]);

  const pauseProgress = useCallback(() => {
    isPausedRef.current = true;
    setIsPausedUI(true);
    // Stop animation in place (keeps current progress value)
    animationRef.current?.stop();
    // Pause video if playing
    videoRef.current?.pauseAsync?.();
  }, []);

  const resumeProgress = useCallback(() => {
    isPausedRef.current = false;
    setIsPausedUI(false);
    // Resume from where it stopped
    startProgress();
    // Resume video if it's a video story
    videoRef.current?.playAsync?.();
  }, [startProgress]);

  // ---- Navigation ----
  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Restart current story
      progressAnim.setValue(0);
      startProgress();
    }
  }, [currentIndex, startProgress]);

  // ---- Lifecycle ----
  // Reset on modal open / user change
  useEffect(() => {
    if (visible && stories.length > 0) {
      isPausedRef.current = false;
      setIsPausedUI(false);
      setCurrentIndex(initialStoryIndex);
      setIsLoading(true);
      progressAnim.setValue(0);
      startProgress();
    } else {
      animationRef.current?.stop();
      progressAnim.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [visible, userStories]);

  // On story index change
  useEffect(() => {
    if (visible && currentIndex >= 0 && currentIndex < stories.length) {
      setIsLoading(true);
      isPausedRef.current = false;
      setIsPausedUI(false);
      progressAnim.setValue(0);
      startProgress();

      // Mark as viewed
      if (onStoryViewed && currentStory && !currentStory.hasViewed) {
        onStoryViewed(currentStory.id);
      }
    }
  }, [currentIndex]);

  // ---- Story Like Handler ----
  const handleLikeStory = async () => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    const currentLiked = localLikeState[storyId]?.hasLiked ?? currentStory.hasLiked;
    const currentCount = localLikeState[storyId]?.likeCount ?? currentStory.likeCount;

    // Optimistic update
    setLocalLikeState(prev => ({
      ...prev,
      [storyId]: {
        hasLiked: !currentLiked,
        likeCount: !currentLiked ? currentCount + 1 : Math.max(0, currentCount - 1),
      }
    }));

    try {
      if (currentLiked) {
        await communityApi.unlikeStory(storyId);
      } else {
        await communityApi.likeStory(storyId);
      }
    } catch (error) {
      console.error('Failed to toggle like on story:', error);
      // Revert optimistic update
      setLocalLikeState(prev => ({
        ...prev,
        [storyId]: {
          hasLiked: currentLiked,
          likeCount: currentCount,
        }
      }));
    }
  };

  // ---- Touch Handlers (Instagram-style) ----
  // onPressIn: Immediately pause. Start a timer to distinguish tap vs hold.
  const handlePressIn = useCallback(() => {
    // Immediately pause the progress
    pauseProgress();

    // Start tracking hold duration
    isHoldingRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
    }, 200); // After 200ms, consider it a "hold" not a "tap"
  }, [pauseProgress]);

  // onPressOut: Resume progress. If it was a short tap, also navigate.
  const handlePressOut = useCallback((side: 'left' | 'right') => {
    // Clear the hold timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (isHoldingRef.current) {
      // It was a hold — just resume, don't navigate
      isHoldingRef.current = false;
      resumeProgress();
    } else {
      // It was a quick tap — navigate
      isHoldingRef.current = false;
      if (side === 'left') {
        goPrevious();
      } else {
        goNext();
      }
    }
  }, [resumeProgress, goPrevious, goNext]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // ---- Viewers Panel ----
  const openViewersPanel = useCallback(async () => {
    if (!isOwner || !currentStory) return;

    pauseProgress();
    setShowViewers(true);
    setLoadingViewers(true);

    // Animate panel up
    Animated.spring(viewersPanelAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    try {
      const [viewersData, likersData] = await Promise.all([
        communityApi.getStoryViewers(currentStory.id),
        communityApi.getStoryLikers(currentStory.id)
      ]);
      setViewers(Array.isArray(viewersData) ? viewersData : []);
      setLikers(Array.isArray(likersData) ? likersData : []);
    } catch (err) {
      console.error('Failed to load viewers/likers:', err);
      // Show empty state
      setViewers([]);
      setLikers([]);
    } finally {
      setLoadingViewers(false);
    }
  }, [isOwner, currentStory, pauseProgress]);

  const closeViewersPanel = useCallback(() => {
    Animated.timing(viewersPanelAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowViewers(false);
      setViewers([]);
      setLikers([]);
      resumeProgress();
    });
  }, [resumeProgress]);

  // ---- Swipe Up Detection (PanResponder) ----
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture vertical swipe up (dy negative, significant movement)
        return gestureState.dy < -30 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -80) {
          // Swipe up detected
          openViewersPanel();
        }
      },
    })
  ).current;

  // Helper to format "time ago"
  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Render a single viewer row
  const renderViewerItem = useCallback(({ item }: { item: any }) => {
    const u = item.user || {};
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.displayName || u.name || 'Unknown';
    const initial = (u.firstName || u.displayName || u.name || '?').charAt(0).toUpperCase();

    const hasLiked = likers.some(l => (l.user?._id || l.userId) === (u._id || item.userId));

    return (
      <View style={styles.viewerItem}>
        {u.avatar ? (
          <AppImage uri={u.avatar} style={styles.viewerAvatar} contentFit="cover" />
        ) : (
          <View style={styles.viewerAvatarPlaceholder}>
            <Text style={styles.viewerAvatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.viewerInfo}>
          <Text style={styles.viewerName} numberOfLines={1}>{fullName}</Text>
          {u.college && (
            <Text style={styles.viewerCollege} numberOfLines={1}>{u.college}</Text>
          )}
        </View>
        {hasLiked && (
          <Ionicons name="heart" size={20} color="#ff3040" style={styles.likeIcon} />
        )}
        <Text style={styles.viewerTime}>{formatTimeAgo(item.viewedAt)}</Text>
      </View>
    );
  }, [likers]);

  if (!visible || !currentStory) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />

      {/* Background Image (Blurred) — skip for video stories */}
      <View style={styles.backgroundContainer}>
        {!isVideoStory && (
          <RNImage
            source={{ uri: resolvePublicMediaUrl(currentStory.mediaUrl) }}
            style={styles.backgroundImage}
            blurRadius={20}
          />
        )}
        <View style={styles.overlay} />
      </View>

      {/* Story Media */}
      <View style={styles.mediaContainer}>
        {isVideoStory ? (
          <Video
            ref={videoRef}
            source={{ uri: resolvePublicMediaUrl(currentStory.mediaUrl) }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isMuted={false}
            isLooping={false}
            onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
              if (!status.isLoaded) return;
              // Clear loading state when video is actually playing
              if (isLoading && status.isPlaying) {
                setIsLoading(false);
              }
              // Drive progress bar from video position
              if (status.durationMillis && status.durationMillis > 0) {
                const progress = status.positionMillis / status.durationMillis;
                progressAnim.setValue(progress);
              }
              // Auto-advance when video ends
              if (status.didJustFinish) {
                goNext();
              }
            }}
            onError={(error: string) => console.error('🎥 Video error:', error)}
          />
        ) : (
          <AppImage
            uri={currentStory.mediaUrl}
            style={styles.media}
            contentFit="contain"
            onLoadEnd={handleImageLoad}
          />
        )}
        {isLoading && !isVideoStory && (
          <View style={styles.loadingContainer}>
            <Text style={{ color: 'white' }}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Header (progress bars + user info) — above everything */}
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 20) }]}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((story: Story, index: number) => (
            <React.Fragment key={story.id}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: currentIndex === index
                        ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                        : index < currentIndex
                          ? '100%'
                          : '0%',
                    },
                  ]}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <AppImage
              uri={userStories.user.avatarUrl || 'https://via.placeholder.com/40'}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.username}>{userStories.user.name}</Text>
            <Text style={styles.timeAgo}>
              {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.headerButtons}>
            {isOwner && onAddStory && (
              <Pressable onPress={onAddStory} style={styles.iconButton}>
                <Ionicons name="add-circle-outline" size={28} color="#FFF" />
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Touch Overlay — Instagram style */}
      {!showViewers && (
        <View style={styles.touchOverlay} {...(isOwner ? panResponder.panHandlers : {})}>
          <Pressable
            style={styles.touchLeft}
            onPressIn={handlePressIn}
            onPressOut={() => handlePressOut('left')}
          />
          <Pressable
            style={styles.touchRight}
            onPressIn={handlePressIn}
            onPressOut={() => handlePressOut('right')}
          />
        </View>
      )}

      {/* Footer / Caption */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        {currentStory.caption && (
          <Text style={styles.caption}>{currentStory.caption}</Text>
        )}

        {/* Interaction Buttons */}
        {!isOwner && (() => {
          const isLiked = localLikeState[currentStory.id]?.hasLiked ?? currentStory.hasLiked;
          return (
            <View style={[styles.interactionBar, { justifyContent: 'flex-start' }]}>
              <Pressable style={styles.interactionButton} onPress={handleLikeStory}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={28}
                  color={isLiked ? "#ff3040" : "#FFF"}
                />
              </Pressable>
            </View>
          );
        })()}

        {isOwner && (
          <View style={styles.interactionBar}>
            <Pressable style={styles.viewCountButton} onPress={openViewersPanel}>
              <Ionicons name="eye-outline" size={20} color="#FFF" />
              <Text style={styles.viewCountText}>{currentStory.viewCount || 0} views</Text>
              <Ionicons name="chevron-up" size={16} color="rgba(255,255,255,0.6)" style={{ marginLeft: 4 }} />
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={() => {
              pauseProgress();
              Alert.alert(
                'Delete Story',
                'Are you sure you want to delete this story? This cannot be undone.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resumeProgress(),
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      if (onDeleteStory && currentStory) {
                        const success = await onDeleteStory(currentStory.id);
                        if (success) {
                          // If last story, close modal. Otherwise go to next.
                          if (stories.length <= 1) {
                            onClose();
                          } else if (currentIndex >= stories.length - 1) {
                            setCurrentIndex(Math.max(0, currentIndex - 1));
                          } else {
                            // Stay at same index (next story shifts into place)
                            progressAnim.setValue(0);
                            resumeProgress();
                          }
                        } else {
                          resumeProgress();
                        }
                      }
                    },
                  },
                ]
              );
            }}>
              <Ionicons name="trash-outline" size={24} color="#FFF" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Viewers Bottom Sheet */}
      {showViewers && (
        <Animated.View
          style={[
            styles.viewersPanel,
            {
              paddingBottom: Math.max(insets.bottom, 20),
              transform: [{
                translateY: viewersPanelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height * 0.6, 0],
                }),
              }],
            },
          ]}
        >
          {/* Panel Handle */}
          <View style={styles.panelHandleContainer}>
            <View style={styles.panelHandle} />
          </View>

          {/* Panel Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Viewers</Text>
            <Pressable onPress={closeViewersPanel} hitSlop={12}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>

          {/* Viewers List */}
          {loadingViewers ? (
            <View style={styles.panelLoading}>
              <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Loading viewers...</Text>
            </View>
          ) : viewers.length === 0 ? (
            <View style={styles.panelEmpty}>
              <Ionicons name="eye-off-outline" size={40} color="rgba(255,255,255,0.3)" />
              <Text style={styles.panelEmptyText}>No viewers yet</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {viewers.map((viewer: any, index: number) => (
                <View key={viewer.user?._id || viewer.userId || `viewer-${index}`}>
                  {renderViewerItem({ item: viewer })}
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}

      {/* Dimmed background when panel is open */}
      {showViewers && (
        <Pressable style={styles.viewersDimBg} onPress={closeViewersPanel} />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  username: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  media: {
    width: width,
    height: height,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 10,
  },
  touchLeft: {
    flex: 3,
  },
  touchRight: {
    flex: 7,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    zIndex: 20,
  },
  caption: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interactionButton: {
    padding: 8,
  },
  replyInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  replyPlaceholder: {
    color: 'white',
  },
  viewCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  viewCountText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  // Viewers Panel
  viewersDimBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 25,
  },
  viewersPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    backgroundColor: 'rgba(30,30,30,0.97)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 30,
    overflow: 'hidden',
  },
  panelHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  panelTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  panelLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  panelEmptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  viewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  viewerName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  viewerCollege: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  likeIcon: {
    marginRight: 12,
  },
  viewerTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});
