/**
 * Post media: single image, gallery, or video — isolated for list performance.
 * Media uses a fixed-height slot so FlashList rows don’t resize when images decode.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  Platform,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { AppImage } from '@/components/ui/AppImage';
import { getFeedMediaSlotHeight } from '../constants/feedLayout';
import { resolvePublicMediaUrl } from '@/utils/resolvePublicMediaUrl';

const LIKE_COLOR = '#ED4956';

export interface PostCardMediaProps {
  postId: string;
  mediaUrls: string[];
  onDoubleTap: () => void;
  heartOverlayStyle: object;
  skeletonBgColor: string;
  /** Whether this post is currently visible on screen. Used to pause video when scrolled away. */
  isVisible?: boolean;
}

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|avi|webm|mkv)$/i.test(url) || /\/videos?\//i.test(url);

export const PostCardMedia = memo(function PostCardMedia({
  postId,
  mediaUrls,
  onDoubleTap,
  heartOverlayStyle,
  skeletonBgColor,
  isVisible = true,
}: PostCardMediaProps) {
  const videoRef = useRef<Video>(null);

  // Pause video when post scrolls off-screen
  useEffect(() => {
    if (!videoRef.current) return;
    if (!isVisible) {
      videoRef.current.pauseAsync().catch(() => {});
    }
  }, [isVisible]);
  const { width: screenWidth } = useWindowDimensions();
  const slotHeight = useMemo(() => getFeedMediaSlotHeight(screenWidth), [screenWidth]);

  const list = mediaUrls ?? [];

  const galleryRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCurrentImageIndex(0);
    galleryRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  }, [postId]);

  const skeletonOpacity = useSharedValue(0.5);
  const allImagesLoaded = useMemo(() => {
    const imageUrls = list.filter((u) => !isVideoUrl(u));
    return imageUrls.length === 0 || imageUrls.every((u) => loadedImages[u]);
  }, [list, loadedImages]);

  useEffect(() => {
    if (allImagesLoaded) {
      cancelAnimation(skeletonOpacity);
      return;
    }
    skeletonOpacity.value = 0.45;
    skeletonOpacity.value = withRepeat(
      withTiming(0.92, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(skeletonOpacity);
  }, [allImagesLoaded]);

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: skeletonOpacity.value,
  }));

  const markImageLoaded = useCallback((imageUrl: string) => {
    setLoadedImages((prev) => (prev[imageUrl] ? prev : { ...prev, [imageUrl]: true }));
  }, []);

  const syncIndexFromOffset = useCallback(
    (contentOffsetX: number) => {
      if (list.length <= 1) return;
      const index = Math.round(contentOffsetX / screenWidth);
      setCurrentImageIndex(Math.max(0, Math.min(index, list.length - 1)));
    },
    [list.length, screenWidth]
  );

  const handleGalleryScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [syncIndexFromOffset]
  );

  const goToPage = useCallback(
    (delta: number) => {
      if (list.length <= 1) return;
      const next = Math.max(0, Math.min(currentImageIndex + delta, list.length - 1));
      if (next === currentImageIndex) return;
      galleryRef.current?.scrollTo({ x: next * screenWidth, y: 0, animated: true });
      setCurrentImageIndex(next);
    },
    [currentImageIndex, list.length, screenWidth]
  );

  if (!list.length) return null;

  const skeletonBlock = !isVideoUrl(list[0]) && !loadedImages[list[0]];

  return (
    <View style={styles.mediaContainer}>
      {list.length === 1 ? (
        <Pressable onPress={onDoubleTap} style={{ width: '100%' }}>
          <View style={{ width: screenWidth, height: slotHeight }}>
            {skeletonBlock && (
              <Animated.View
                style={[
                  styles.singleMedia,
                  { backgroundColor: skeletonBgColor },
                  skeletonStyle,
                  { position: 'absolute', zIndex: 1, height: slotHeight, width: screenWidth },
                ]}
              />
            )}
            {isVideoUrl(list[0]) ? (
              <Video
                ref={videoRef}
                source={{ uri: resolvePublicMediaUrl(list[0]) }}
                style={[styles.singleMedia, { width: screenWidth, height: slotHeight, backgroundColor: 'black' }]}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay={false}
                isLooping
              />
            ) : (
              <AppImage
                uri={list[0]}
                style={[styles.singleMedia, { width: screenWidth, height: slotHeight }]}
                contentFit="cover"
                onLoadEnd={() => markImageLoaded(list[0])}
              />
            )}
            <Animated.View style={[styles.heartOverlay, heartOverlayStyle]} pointerEvents="none">
              <Ionicons name="heart" size={100} color={LIKE_COLOR} />
            </Animated.View>
          </View>
        </Pressable>
      ) : (
        <>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={handleGalleryScroll}
            onMomentumScrollEnd={handleGalleryScroll}
            scrollEnabled
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            directionalLockEnabled
            removeClippedSubviews={Platform.OS !== 'android'}
            style={{ height: slotHeight }}
          >
            {list.map((item, index) => (
              <Pressable
                key={`${postId}-media-${index}`}
                onPress={onDoubleTap}
                style={{ width: screenWidth, height: slotHeight }}
              >
                {!loadedImages[item] && !isVideoUrl(item) && (
                  <Animated.View
                    style={[
                      styles.galleryImage,
                      { backgroundColor: skeletonBgColor },
                      skeletonStyle,
                      {
                        position: 'absolute',
                        zIndex: 1,
                        height: slotHeight,
                        width: screenWidth,
                      },
                    ]}
                  />
                )}
                {isVideoUrl(item) ? (
                  <Video
                    ref={index === 0 ? videoRef : undefined}
                    source={{ uri: resolvePublicMediaUrl(item) }}
                    style={[styles.galleryImage, { width: screenWidth, height: slotHeight, backgroundColor: 'black' }]}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={isVisible && index === currentImageIndex}
                    isLooping
                  />
                ) : (
                  <AppImage
                    uri={item}
                    style={[styles.galleryImage, { width: screenWidth, height: slotHeight }]}
                    contentFit="cover"
                    onLoadEnd={() => markImageLoaded(item)}
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.galleryNavOverlay} pointerEvents="box-none">
            {currentImageIndex > 0 ? (
              <Pressable
                style={({ pressed }) => [styles.galleryNavBtn, styles.galleryNavLeft, pressed && styles.galleryNavPressed]}
                onPress={() => goToPage(-1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Previous media"
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </Pressable>
            ) : null}
            {currentImageIndex < list.length - 1 ? (
              <Pressable
                style={({ pressed }) => [styles.galleryNavBtn, styles.galleryNavRight, pressed && styles.galleryNavPressed]}
                onPress={() => goToPage(1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Next media"
              >
                <Ionicons name="chevron-forward" size={28} color="#fff" />
              </Pressable>
            ) : null}
          </View>
          <Animated.View style={[styles.heartOverlay, heartOverlayStyle]} pointerEvents="none">
            <Ionicons name="heart" size={100} color={LIKE_COLOR} />
          </Animated.View>
        </>
      )}

      {list.length > 1 && (
        <View style={styles.galleryIndicator}>
          <Text style={styles.galleryIndicatorText}>
            {currentImageIndex + 1}/{list.length}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  mediaContainer: {
    position: 'relative',
  },
  singleMedia: {
    backgroundColor: '#F0F0F0',
  },
  galleryImage: {
    backgroundColor: '#F0F0F0',
  },
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  galleryNavOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 2,
  },
  galleryNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    zIndex: 3,
    width: 40,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryNavLeft: {
    left: 8,
  },
  galleryNavRight: {
    right: 8,
  },
  galleryNavPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
