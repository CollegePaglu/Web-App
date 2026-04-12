/**
 * SafeArea Component
 * 
 * Safe area wrapper with edge control.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { extendedColors as colors } from '@/theme/colors';

export interface SafeAreaProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  edges = ['top', 'bottom'],
  backgroundColor = colors.neutral[0],
  style,
  children,
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeArea;
