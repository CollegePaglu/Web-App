/**
 * Skeleton Component
 * 
 * Modern loading placeholder with smooth shimmer effect.
 * Premium design with elegant animations.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { extendedColors as colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: br = borderRadius.md,
  style,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: br,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 3,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? '60%' : '100%'}
        height={16}
        style={{ marginBottom: index < lines - 1 ? spacing[3] : 0 }}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 48,
  style,
}) => <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <SkeletonAvatar />
    <View style={styles.cardContent}>
      <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="40%" height={14} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200], // Soft beige for subtle placeholder
  },

  card: {
    flexDirection: 'row',
    padding: spacing[4],
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[3],
  },

  cardContent: {
    flex: 1,
    marginLeft: spacing[4],
    justifyContent: 'center',
  },
});

export default Skeleton;
