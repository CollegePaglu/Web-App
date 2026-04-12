/**
 * Design System Utilities
 * 
 * Helper functions for creating award-winning UI/UX
 * Includes color utilities, layout helpers, and accessibility features
 */

import { primaryGreen, neutral, accentColors, semantic } from './colors';
import { spacing, borderRadius } from './spacing';

/**
 * Color utilities
 */
export const colorUtils = {
  /**
   * Get contrasting text color (white or black)
   * Based on luminance calculation
   */
  getContrastingText: (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? neutral[900] : '#FFFFFF';
  },

  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    const opacityHex = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return color + opacityHex;
  },

  /**
   * Create gradient array for LinearGradient
   */
  createGradient: (from: string, to: string) => [from, to],
};

/**
 * Layout utilities
 */
export const layoutUtils = {
  /**
   * Get responsive spacing
   */
  getResponsiveSpacing: (baseSpacing: keyof typeof spacing, multiplier = 1) => {
    return spacing[baseSpacing] * multiplier;
  },

  /**
   * Get screen padding with insets
   */
  getScreenPadding: (insets?: { top: number; bottom: number; left: number; right: number }) => ({
    paddingTop: insets?.top || 0,
    paddingBottom: insets?.bottom || 0,
    paddingHorizontal: spacing[5],
  }),

  /**
   * Get safe area heights
   */
  getSafeAreaHeight: (screenHeight: number, insets?: { top: number; bottom: number }) => {
    return screenHeight - (insets?.top || 0) - (insets?.bottom || 0);
  },

  /**
   * Create aspect ratio style
   */
  aspectRatio: (width: number, height: number) => ({
    aspectRatio: width / height,
  }),
};

/**
 * Typography utilities
 */
export const typographyUtils = {
  /**
   * Create custom text size
   */
  createTextSize: (size: number, lineHeight = size * 1.5) => ({
    fontSize: size,
    lineHeight,
  }),

  /**
   * Scale text based on reference width
   */
  scaleText: (fontSize: number, screenWidth: number, referenceWidth = 375) => {
    return (screenWidth / referenceWidth) * fontSize;
  },
};

/**
 * Component utilities
 */
export const componentUtils = {
  /**
   * Get button height based on size
   */
  getButtonHeight: (size: 'sm' | 'md' | 'lg' | 'xl') => {
    const heights = { sm: 36, md: 44, lg: 52, xl: 60 };
    return heights[size];
  },

  /**
   * Get touch target minimum size (44x44)
   */
  getTouchTargetSize: (minSize = 44) => ({
    minWidth: minSize,
    minHeight: minSize,
  }),

  /**
   * Create card elevation
   */
  getCardElevation: (variant: 'soft' | 'medium' | 'elevated') => {
    const elevations = {
      soft: 1,
      medium: 4,
      elevated: 8,
    };
    return elevations[variant];
  },
};

/**
 * Animation utilities
 */
export const animationUtils = {
  /**
   * Create timing config
   */
  createTiming: (duration: number, delay = 0) => ({
    duration,
    delay,
  }),

  /**
   * Calculate stagger delay
   */
  getStaggerDelay: (index: number, delayPerItem = 80) => index * delayPerItem,

  /**
   * Create spring config
   */
  createSpring: (tension = 200, friction = 20) => ({
    tension,
    friction,
    useNativeDriver: true,
  }),
};

/**
 * Accessibility utilities
 */
export const a11yUtils = {
  /**
   * Get accessible label
   */
  getAccessibleLabel: (text: string, additionalInfo?: string) => {
    return additionalInfo ? `${text}, ${additionalInfo}` : text;
  },

  /**
   * Get WCAG AA compliant text
   */
  getAccessibleColor: (backgroundColor: string) => {
    return colorUtils.getContrastingText(backgroundColor);
  },

  /**
   * Create accessible button hint
   */
  getButtonHint: (action: string, context?: string) => {
    return context ? `${action} - ${context}` : action;
  },

  /**
   * Minimum touch target (accessibility)
   */
  minTouchTarget: 44,
};

/**
 * State utilities
 */
export const stateUtils = {
  /**
   * Get disabled opacity
   */
  getDisabledOpacity: () => 0.5,

  /**
   * Get press scale
   */
  getPressScale: (scale = 0.96) => scale,

  /**
   * Get focus color
   */
  getFocusColor: () => primaryGreen[500],

  /**
   * Get active color
   */
  getActiveColor: (baseColor: string) => {
    // Slightly darker version
    return baseColor;
  },
};

/**
 * Responsive utilities
 */
export const responsiveUtils = {
  /**
   * Is phone size
   */
  isPhone: (width: number) => width < 600,

  /**
   * Is tablet size
   */
  isTablet: (width: number) => width >= 600 && width < 1200,

  /**
   * Get responsive column count
   */
  getColumnCount: (width: number, itemWidth: number) => {
    return Math.floor(width / itemWidth);
  },

  /**
   * Get responsive margin
   */
  getResponsiveMargin: (width: number) => {
    if (width < 375) return spacing[3];
    if (width < 600) return spacing[4];
    return spacing[6];
  },
};

/**
 * Component presets
 */
export const presets = {
  /**
   * Card container styles
   */
  cardContainer: {
    backgroundColor: '#fcfdfb',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    overflow: 'hidden' as const,
  },

  /**
   * Input container styles
   */
  inputContainer: {
    backgroundColor: neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: neutral[200],
    minHeight: 52,
    paddingHorizontal: spacing[4],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  /**
   * Button base styles
   */
  buttonBase: {
    borderRadius: borderRadius.lg,
    minHeight: 44,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },

  /**
   * Screen container
   */
  screenContainer: {
    flex: 1,
    backgroundColor: neutral[50],
  },

  /**
   * Header styles
   */
  headerStyle: {
    backgroundColor: '#fcfdfb',
    borderBottomWidth: 1,
    borderBottomColor: neutral[200],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
};

export default {
  colorUtils,
  layoutUtils,
  typographyUtils,
  componentUtils,
  animationUtils,
  a11yUtils,
  stateUtils,
  responsiveUtils,
  presets,
};
