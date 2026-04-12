/**
 * Text Component
 * 
 * Modern typography component with professional presets and theme integration.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, TypographyVariant } from '@/theme/typography';
import { grey, colors as themeColors, accent } from '@/theme/colors';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error' | 'success' | 'warning' | 'accent' | 'mint';
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const textStyles = [
    typography[variant],
    colorStyles[color],
    { textAlign: align },
    weight && { fontWeight: weight },
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
};

const colorStyles = StyleSheet.create({
  primary: { color: grey[900] },        // Forest Deep
  secondary: { color: grey[600] },      // Forest Mid
  tertiary: { color: grey[500] },       // Sage Main
  inverse: { color: grey[0] },          // Beige Cream
  link: { color: themeColors.primary },  // Forest Main
  error: { color: themeColors.error },   // Coral Red
  success: { color: '#8FE3B0' },        // Mint Fresh
  warning: { color: themeColors.warning }, // Orange
  accent: { color: '#FF8C42' },         // Accent Orange
  mint: { color: '#8FE3B0' },           // Mint Fresh
});

export default Text;
