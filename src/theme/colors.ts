/**
 * Design System - Colors (AWARD-WINNING PALETTE)
 * 
 * Green & Beige Theme - Contemporary, Accessible, Premium
 * Primary: Green (#22C55E) - vibrant, energetic, modern
 * Background: Beige (#FAFAF9) - warm, inviting, spacious
 * Accent: Orange, Mint, Cream - vibrant energy
 * 
 * Design Philosophy: Clean, professional, emotionally delightful
 * WCAG AAA+ contrast ratios
 * 60-30-10 color distribution rule applied
 */

// ========================================
// PRIMARY COLOR PALETTE - Green System (Darkened)
// ========================================
export const primaryGreen = {
  50: '#E8F8F0',   // Lightest green tint
  100: '#C8F0E0',  // Very light green
  200: '#A0E5CC',  // Light green
  300: '#6DD9B0',  // Soft green
  400: '#3FCC8F',  // Medium green
  500: '#1B9D6B',  // Main green (PRIMARY) - Darkened from #22C55E
  600: '#148659',  // Dark green
  700: '#0F6D48',  // Deeper green
  800: '#0A5338',  // Very dark green
  900: '#062D1F',  // Darkest green
} as const;

// ========================================
// NEUTRAL PALETTE - Beige System
// ========================================
export const neutral = {
  50: '#fcfdfb',   // Almost white beige (Society dashboard base-white)
  100: '#e3e9db',  // Very light beige (Society dashboard base-100)
  200: '#c6cbc2',  // Light beige (Society dashboard base-200, borders)
  300: '#D6D3D1',  // Soft beige
  400: '#A8A29E',  // Medium beige
  500: '#78716C',  // Main beige/taupe
  600: '#57534E',  // Dark beige
  700: '#44403C',  // Deeper beige
  800: '#292524',  // Very dark beige
  900: '#1C1917',  // Darkest beige/brown (text)
} as const;

// ========================================
// CREAM PALETTE - Soft White System (Premium)
// ========================================
export const cream = {
  50: '#fcfdfb',   // Softest cream (Society dashboard base-white)
  100: '#e3e9db',  // Light cream (Society dashboard base-100)
  200: '#c6cbc2',  // Medium cream (Society dashboard base-200)
  300: '#a8ada5',  // Deeper cream (subtle borders)
} as const;

// ========================================
// ACCENT COLORS
// ========================================
export const accentColors = {
  mint: '#A7F3D0',      // Mint green accent - success, fresh actions
  sage: '#86EFAC',      // Sage green - soft secondary
  cream: '#FEF3C7',     // Cream accent - soft highlights
  sand: '#FDE68A',      // Sand yellow - warm accents
  terracotta: '#B45309', // Warm terracotta - premium highlights
  orange: '#F59E0B',    // Orange - attention, warnings
} as const;

// ========================================
// SEMANTIC COLORS
// ========================================
export const semantic = {
  success: '#22C55E',    // Green - success actions
  warning: '#F59E0B',    // Orange - warnings
  error: '#EF4444',      // Red - errors, destructive
  info: '#3B82F6',       // Blue - informational
} as const;

// ========================================
// UI ELEMENT COLORS - Multi-Layer System
// ========================================
export const uiColors = {
  // LAYERED BACKGROUNDS (Elevation-based hierarchy)
  // Base layer - darkest warm tone for screen backgrounds
  background: '#f8f6f3',           // Warm gray-beige base (allows cards to "float")
  backgroundSubtle: '#f0ede8',     // Subtle variation for sections

  // SURFACE LAYERS (Cards, containers, modals)
  surface: '#fcfdfb',              // Standard elevated surface (cards, containers)
  surfaceElevated: '#ffffff',      // Highest elevation (modals, sheets, floating elements)
  surfaceSubtle: '#f0ede8',        // Recessed surface (input fields, secondary containers)
  surfaceTinted: '#f5f9f4',        // Interactive surface (hover, selected - subtle green tint)

  // Card-specific
  cardBackground: '#fcfdfb',       // Card surface

  // BORDERS (Multiple shades for depth)
  border: '#e8e5e0',               // Primary borders
  borderLight: '#f0ede8',          // Subtle dividers
  borderStrong: '#d4d1cc',         // Emphasized borders, input focus

  // TEXT COLORS
  textPrimary: neutral[900],       // Primary text (highest contrast)
  textSecondary: neutral[600],     // Secondary text
  textTertiary: neutral[400],      // Tertiary text (lowest priority)
  textInverse: '#ffffff',          // Inverse text (on dark backgrounds)
  textSuccess: primaryGreen[700],
  textError: '#DC2626',
  textWarning: '#92400E',

  // INTERACTIVE STATES
  link: primaryGreen[600],
  linkHover: primaryGreen[700],
  placeholder: neutral[400],

  // INPUT FIELDS
  inputBackground: '#f8f6f3',      // Matches base background (recessed feel)
  inputBorder: '#d4d1cc',          // Stronger border for definition
  inputFocus: '#e8f5e9',           // Light green tint when focused

  // STATUS COLORS
  success: semantic.success,
  error: semantic.error,
  warning: semantic.warning,
} as const;

// ========================================
// SHADOW SYSTEM (Tinted Forest Shadows)
// ========================================
export const shadowColors = {
  light: 'rgba(28, 25, 23, 0.05)',
  medium: 'rgba(28, 25, 23, 0.1)',
  heavy: 'rgba(28, 25, 23, 0.15)',
} as const;

// ========================================
// GRADIENTS
// ========================================
export const gradients = {
  primary: [primaryGreen[500], primaryGreen[600]],
  secondary: [primaryGreen[400], primaryGreen[500]],
  mint: [accentColors.mint, accentColors.sage],
  warmth: [accentColors.cream, accentColors.sand],
} as const;

// ========================================
// DEPRECATED (for backwards compatibility)
// ========================================
export const colors = {
  primary: primaryGreen[500],
  secondary: accentColors.sage,
  accent: accentColors.orange,
  tertiary: accentColors.mint,
  white: cream[50],  // Soft cream instead of harsh white
  black: neutral[900],
  transparent: 'transparent',
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
} as const;

export const grey = neutral;

export const overlay = {
  dark: 'rgba(28, 25, 23, 0.4)',
  medium: 'rgba(28, 25, 23, 0.2)',
  light: 'rgba(28, 25, 23, 0.05)',
  white: 'rgba(255, 255, 255, 0.8)',
} as const;


// ========================================
// EXTENDED COLOR PALETTES (for component compatibility)
// ========================================
export const colorPalettes = {
  neutral: neutral,
  primary: primaryGreen,
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#7F1D1D',
    900: '#7F1D1D',
  },
  success: primaryGreen,
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

export const accent = {
  primary: primaryGreen[500],
  secondary: accentColors.sage,
  tertiary: accentColors.orange,
  mint: accentColors.mint,
  lavender: '#B8A8D8',
  pink: '#F5D0E0',
  coral: '#FF7F7F',
} as const;

// ========================================
// EXTENDED COLORS (backwards compatibility)
// ========================================
export const extendedColors = {
  ...colors,
  ...colorPalettes,
} as const;

export type ColorType = typeof colors;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderHighlight: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  overlay: string;
  inputBackground: string;
  ring: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const lightTheme: ThemeColors = {
  background: neutral[50],
  surface: cream[50],
  surfaceHighlight: cream[100],
  text: neutral[900],
  textSecondary: neutral[600],
  textTertiary: neutral[400],
  textInverse: cream[50],
  border: neutral[200],
  borderHighlight: neutral[300],
  primary: primaryGreen[500],
  primaryForeground: cream[50],
  secondary: accentColors.sage,
  secondaryForeground: neutral[900],
  muted: neutral[200],
  mutedForeground: neutral[500],
  destructive: semantic.error,
  destructiveForeground: cream[50],
  overlay: overlay.medium,
  inputBackground: neutral[50],
  ring: primaryGreen[500],
  tint: accentColors.orange,
  tabIconDefault: neutral[400],
  tabIconSelected: primaryGreen[600],
};

export const darkTheme: ThemeColors = {
  background: '#000000',         // OLED Pure Black
  surface: '#121212',            // Material Dark Grey
  surfaceHighlight: '#1E1E1E',   // Slightly Lighter Grey
  text: '#FFFFFF',               // Pure White
  textSecondary: '#A3A3A3',      // Light Grey
  textTertiary: '#737373',       // Darker Grey
  textInverse: '#000000',
  border: '#262626',             // Subtle Dark Border
  borderHighlight: '#404040',
  primary: primaryGreen[500],    // Keep vibrant green
  primaryForeground: '#000000',
  secondary: accentColors.sage,
  secondaryForeground: '#FFFFFF',
  muted: '#262626',
  mutedForeground: '#A3A3A3',
  destructive: semantic.error,
  destructiveForeground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.8)',
  inputBackground: '#121212',
  ring: primaryGreen[500],
  tint: accentColors.orange,
  tabIconDefault: '#737373',
  tabIconSelected: primaryGreen[500],
};
