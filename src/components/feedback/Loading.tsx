/**
 * Loading Component
 * 
 * Full screen and inline loading indicators.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { extendedColors as colors } from '@/theme/colors';
import { Text } from '../ui/Text';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary[600],
  fullScreen = false,
  message,
  style,
}) => {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text variant="body" color="secondary" style={styles.message}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text variant="bodySmall" color="secondary" style={styles.inlineMessage}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
  },

  inline: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    marginTop: 16,
    textAlign: 'center',
  },

  inlineMessage: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Loading;
