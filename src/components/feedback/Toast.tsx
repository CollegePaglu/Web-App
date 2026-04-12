/**
 * Toast Component
 * 
 * Modern, premium toast notifications with elegant styling.
 * Matches design language with soft shadows and refined colors.
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { grey, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  onDismiss,
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;      // Green #22C55E
      case 'error':
        return colors.error;        // Red #EF4444
      case 'warning':
        return colors.warning;      // Orange #F59E0B
      case 'info':
        return colors.primary;      // Green #22C55E
      default:
        return colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => onDismiss(id)}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },

  icon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },

  title: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  message: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing[0.5],
  },

  closeButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
  },

  closeIcon: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Toast;
