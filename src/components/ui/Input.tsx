/**
 * Input Component
 * 
 * Modern, professional text input with label, error state, and icons.
 * Premium styling inspired by landing page design.
 */

import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { extendedColors as colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      disabled = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;

    const inputContainerStyles: ViewStyle[] = [
      styles.inputContainer,
      styles[`variant_${variant}`],
      isFocused && styles.inputContainerFocused,
      hasError && styles.inputContainerError,
      disabled && styles.inputContainerDisabled,
      inputContainerStyle,
    ].filter(Boolean) as ViewStyle[];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View style={inputContainerStyles}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : undefined,
              rightIcon ? styles.inputWithRightIcon : undefined,
              inputStyle,
            ]}
            placeholderTextColor={colors.neutral[400]}
            editable={!disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              style={styles.iconRight}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {(error || helperText) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    ...typography.label,
    color: colors.neutral[800],
    marginBottom: spacing[2],
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },

  // Default variant - Beige with forest border
  variant_default: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    ...shadows.xs,
  },

  // Filled variant - Soft beige background
  variant_filled: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Outlined variant - Clean border
  variant_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.neutral[400],
  },

  inputContainerFocused: {
    borderColor: colors.primary[600],
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },

  inputContainerError: {
    borderColor: colors.error[500],
    backgroundColor: '#FEF2F2',
  },

  inputContainerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },

  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingHorizontal: spacing[4],
    paddingVertical: Platform.OS === 'ios' ? spacing[3] : spacing[2.5],
    fontSize: 16,
  },

  inputWithLeftIcon: {
    paddingLeft: spacing[1],
  },

  inputWithRightIcon: {
    paddingRight: spacing[1],
  },

  iconLeft: {
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
  },

  iconRight: {
    paddingRight: spacing[4],
    paddingLeft: spacing[2],
  },

  helperText: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing[1.5],
  },

  errorText: {
    color: colors.error[500],
    fontWeight: '500',
  },
});

export default Input;
