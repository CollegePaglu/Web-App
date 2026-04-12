/**
 * Theme - Design System
 * 
 * Centralized theme configuration combining colors, typography, and spacing.
 * Uses a minimalist black, white, and grey color palette.
 */

import { colors, grey, accent, overlay, lightTheme, darkTheme, ThemeColors } from './colors';
import { typography, fontSize, fontWeight, TypographyVariant } from './typography';
import { spacing, semanticSpacing, borderRadius, shadows } from './spacing';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: typeof typography;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  spacing: typeof spacing;
  semanticSpacing: typeof semanticSpacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

// Create theme object
export const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'light' ? lightTheme : darkTheme,
  typography,
  fontSize,
  fontWeight,
  spacing,
  semanticSpacing,
  borderRadius,
  shadows,
});

// Default themes
export const lightThemeConfig = createTheme('light');
export const darkThemeConfig = createTheme('dark');

// Re-export everything
export { colors, grey, accent, overlay, lightTheme, darkTheme };
export { typography, fontSize, fontWeight };
export type { TypographyVariant };
export { spacing, semanticSpacing, borderRadius, shadows };

export default {
  light: lightThemeConfig,
  dark: darkThemeConfig,
};

