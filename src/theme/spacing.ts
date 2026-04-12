/**
 * Spacing Scale
 * 
 * Consistent spacing values for margins, paddings, and gaps.
 * Based on 4px base unit for professional, polished design.
 */

// Base spacing unit (4px)
const BASE = 4;

export const spacing = {
  0: 0,
  0.5: BASE * 0.5, // 2
  1: BASE * 1, // 4
  1.5: BASE * 1.5, // 6
  2: BASE * 2, // 8
  2.5: BASE * 2.5, // 10
  3: BASE * 3, // 12
  3.5: BASE * 3.5, // 14
  4: BASE * 4, // 16
  5: BASE * 5, // 20
  6: BASE * 6, // 24
  7: BASE * 7, // 28
  8: BASE * 8, // 32
  9: BASE * 9, // 36
  10: BASE * 10, // 40
  11: BASE * 11, // 44
  12: BASE * 12, // 48
  14: BASE * 14, // 56
  16: BASE * 16, // 64
  20: BASE * 20, // 80
  24: BASE * 24, // 96
  28: BASE * 28, // 112
  32: BASE * 32, // 128
  36: BASE * 36, // 144
  40: BASE * 40, // 160
  44: BASE * 44, // 176
  48: BASE * 48, // 192
  52: BASE * 52, // 208
  56: BASE * 56, // 224
  60: BASE * 60, // 240
  64: BASE * 64, // 256
  72: BASE * 72, // 288
  80: BASE * 80, // 320
  96: BASE * 96, // 384
} as const;

// Semantic spacing - professional, polished values
export const semanticSpacing = {
  // Screen padding - balanced, modern
  screenHorizontal: spacing[5], // 20px
  screenVertical: spacing[6], // 24px

  // Component spacing
  componentGap: spacing[4], // 16px
  sectionGap: spacing[9], // 36px
  sectionPadding: spacing[8], // 32px

  // Input padding - comfortable, modern
  inputHorizontal: spacing[4], // 16px
  inputVertical: spacing[3], // 12px
  inputRadius: 12, // modern rounded

  // Button padding - professional
  buttonHorizontal: spacing[6], // 24px
  buttonVertical: spacing[3], // 12px
  buttonRadius: 12, // modern rounded

  // Card padding - premium spacing
  cardPadding: spacing[5], // 20px
  cardRadius: 16, // modern, professional

  // List item spacing
  listItemGap: spacing[4], // 16px
  listItemPadding: spacing[4], // 16px

  // Modal padding
  modalPadding: spacing[6], // 24px
  modalRadius: 20,

  // Divider spacing
  dividerVertical: spacing[4], // 16px
  dividerHorizontal: spacing[4], // 16px
} as const;

// Border radius - modern design system
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  full: 9999,
} as const;

// Shadow presets - professional, premium elevation
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Soft shadow - subtle, modern
  xs: {
    shadowColor: '#0F6D48', // Darkened green - tinted shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  // Small shadow - light elevation
  sm: {
    shadowColor: '#0F6D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // Soft shadow - professional cards
  soft: {
    shadowColor: '#0F6D48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  // Medium shadow - prominent elements
  md: {
    shadowColor: '#0F6D48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  // Large shadow - premium cards, modals
  lg: {
    shadowColor: '#0F6D48',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  // Extra large - floating elements, modals
  xl: {
    shadowColor: '#0F6D48',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
  },
  // Glow effect - accent elements
  glow: {
    shadowColor: '#FF8C42', // Accent Orange glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export default spacing;
