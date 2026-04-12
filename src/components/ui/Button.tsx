/**
 * Button Component
 * 
 * Modern, professional button with premium styling inspired by landing page.
 * Includes multiple variants, sizes, and loading states.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { extendedColors as colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'mint';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    !isDisabled && styles[`shadow_${variant}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={['primary', 'danger', 'accent'].includes(variant) ? colors.neutral[0] : colors.primary[600]}
        />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: spacing[1] }}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <View style={{ marginLeft: spacing[1] }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

// Need to import View for icon margins
import { View } from 'react-native';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing[2],
    transition: 'all 0.2s ease',
  },

  // Primary - Forest Main with premium feel
  variant_primary: {
    backgroundColor: colors.primary[600],
  },
  shadow_primary: {
    ...shadows.md,
  },

  // Secondary - Sage with subtle elevation
  variant_secondary: {
    backgroundColor: colors.neutral[500],
  },
  shadow_secondary: {
    ...shadows.sm,
  },

  // Outline - Forest border with transparent background
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  shadow_outline: {},

  // Ghost - No background, text only
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  shadow_ghost: {},

  // Danger - Coral Red for destructive actions
  variant_danger: {
    backgroundColor: colors.error[500],
  },
  shadow_danger: {
    ...shadows.md,
  },

  // Accent - Vibrant Orange for CTAs
  variant_accent: {
    backgroundColor: colors.warning[500],
  },
  shadow_accent: {
    ...shadows.lg,
  },

  // Mint - Fresh green for positive actions
  variant_mint: {
    backgroundColor: colors.success[400],
  },
  shadow_mint: {
    ...shadows.md,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 52,
  },
  size_xl: {
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[10],
    minHeight: 60,
  },

  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },

  // Text base
  text: {
    ...typography.button,
    textAlign: 'center',
  },

  // Text variants
  text_primary: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  text_secondary: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  text_outline: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  text_ghost: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  text_danger: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  text_accent: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
  text_mint: {
    color: colors.neutral[0],
    fontWeight: '600',
  },

  // Text sizes
  textSize_sm: {
    ...typography.buttonSmall,
  },
  textSize_md: {
    ...typography.button,
  },
  textSize_lg: {
    ...typography.button,
  },
  textSize_xl: {
    ...typography.button,
  },

  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;
