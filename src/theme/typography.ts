/**
 * Typography Scale
 * 
 * Modern, professional typography inspired by CollegePaglu landing page.
 * Uses Space Grotesk for bold headings and Inter for body text.
 */

import { Platform, TextStyle } from 'react-native';

// Font families - matching landing page design
export const fontFamily = {
  // Modern sans-serif for headings
  heading: 'Poppins_700Bold',
  headingMedium: 'Poppins_600SemiBold',
  headingRegular: 'Poppins_500Medium',

  // Body text
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',

  // Fallbacks
  sans: 'Poppins_400Regular',
  serifItalic: 'Poppins_400Regular',
} as const;

// Font weights
export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

// Font sizes - modern scale
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

// Line heights
export const lineHeight = {
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Letter spacing
export const letterSpacing = {
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// Typography presets - modern and professional
export const typography = {
  // Display styles (for heroes & large headings)
  display: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['6xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['6xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  // Heading styles - using Space Grotesk equivalent
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  } as TextStyle,

  h4: {
    fontFamily: fontFamily.headingMedium,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  } as TextStyle,

  h5: {
    fontFamily: fontFamily.headingMedium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.normal,
  } as TextStyle,

  h6: {
    fontFamily: fontFamily.headingMedium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.normal,
  } as TextStyle,

  // Body styles - using Inter
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.relaxed,
  } as TextStyle,

  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.relaxed,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  } as TextStyle,

  // Caption & labels
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  } as TextStyle,

  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wider,
  } as TextStyle,

  // Button text
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.normal,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.normal,
  } as TextStyle,

  // Subtitle
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.lg * lineHeight.normal,
  } as TextStyle,

  subtitleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.md * lineHeight.normal,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;

export default typography;
