/**
 * Card Component
 * 
 * Modern, premium card with multiple variants for professional design.
 * Inspired by landing page's elegant card styling.
 */


import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ViewProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'soft' | 'ghost';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 5,
  onPress,
  style,
  children,
  ...props
}) => {
  const colors = useThemeColors();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...shadows.soft,
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.surfaceHighlight,
          borderWidth: 0,
        };
      case 'soft':
        return {
          backgroundColor: colors.surface,
          ...shadows.sm,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      default:
        return {};
    }
  };

  const cardStyles: ViewStyle[] = [
    styles.base,
    getVariantStyle(),
    { padding: spacing[padding] },
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.85}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});

export default Card;

