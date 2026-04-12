/**
 * Container Component
 * 
 * Standard screen container with optional scroll.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { extendedColors as colors } from '@/theme/colors';
import { semanticSpacing } from '@/theme/spacing';

export interface ContainerProps extends ScrollViewProps {
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  padded?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  scroll = false,
  keyboardAvoiding = true,
  padded = true,
  centered = false,
  style,
  contentStyle,
  children,
  ...scrollProps
}) => {
  const containerStyle: ViewStyle[] = [
    styles.container,
    padded && styles.padded,
    centered && styles.centered,
    style,
  ].filter(Boolean) as ViewStyle[];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.scrollContent,
        centered && styles.centeredContent,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },

  padded: {
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: semanticSpacing.screenVertical,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: semanticSpacing.screenHorizontal,
    paddingVertical: semanticSpacing.screenVertical,
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Container;
