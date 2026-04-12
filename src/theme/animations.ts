/**
 * Animation System
 * 
 * Micro-interactions and transitions for award-winning feel
 * Includes spring animations, entrance animations, and haptic feedback
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Spring animation presets
 * Calibrated for natural, responsive feel
 */
export const springAnimations = {
  // Gentle, responsive - best for most interactions
  gentle: {
    tension: 200,
    friction: 20,
    mass: 1,
    overshootClamping: false,
  },
  
  // Snappy, energetic - for buttons, toggles
  snappy: {
    tension: 300,
    friction: 20,
    mass: 0.8,
    overshootClamping: false,
  },
  
  // Bouncy, playful - for celebratory actions
  bouncy: {
    tension: 150,
    friction: 12,
    mass: 1,
    overshootClamping: false,
  },
  
  // Stiff, precise - for critical interactions
  stiff: {
    tension: 400,
    friction: 30,
    mass: 1,
    overshootClamping: true,
  },
  
  // Molasses, smooth - for modal entrances
  molasses: {
    tension: 80,
    friction: 25,
    mass: 1.2,
    overshootClamping: true,
  },
} as const;

/**
 * Animation durations (ms)
 * Micro-interactions: 150-200ms
 * Transitions: 300-400ms
 * Page transitions: 400-600ms
 */
export const animationDurations = {
  // Micro-interactions
  tap: 100,
  micro: 150,
  microPlus: 200,
  
  // Component transitions
  transition: 300,
  transitionPlus: 400,
  
  // Screen transitions
  page: 400,
  pagePlus: 500,
  
  // Animations
  animation: 600,
  animationPlus: 800,
  
  // Loader animations
  loader: 1000,
  loaderPlus: 1500,
} as const;

/**
 * Easing functions
 */
export const easings = {
  // Linear
  linear: 'linear',
  
  // Entrance/exit - ease out
  easeOut: 'ease-out',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // Entrance - ease in
  easeIn: 'ease-in',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  
  // Smooth transition
  easeInOut: 'ease-in-out',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInOutQuad: 'cubic-bezier(0.45, 0.03, 0.515, 0.955)',
} as const;

/**
 * Micro-interaction presets
 */
export const microInteractions = {
  /**
   * Button press
   * Quick, responsive feedback
   */
  buttonPress: {
    scale: 0.96,
    duration: 150,
    haptic: 'light' as const,
  },
  
  /**
   * Like/favorite animation
   * Celebratory, engaging
   */
  likeAnimation: {
    scale: 1.3,
    rotate: 360,
    duration: 400,
    haptic: 'impact' as const,
  },
  
  /**
   * Bounce entrance
   * Energetic, attention-grabbing
   */
  bounceEntrance: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 500,
    spring: springAnimations.bouncy,
  },
  
  /**
   * Fade and slide entrance
   * Professional, smooth
   */
  fadeSlideEntrance: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
    duration: 400,
    easing: easings.easeOutCubic,
  },
  
  /**
   * Skeleton shimmer
   * Smooth, non-distracting loading
   */
  skeletonShimmer: {
    from: { translateX: -width },
    to: { translateX: width },
    duration: 1500,
    loop: true,
    easing: easings.linear,
  },
  
  /**
   * Success checkmark
   * Confirmation, celebration
   */
  successCheckmark: {
    scale: 1.2,
    rotate: 360,
    duration: 600,
    haptic: 'success' as const,
  },
  
  /**
   * Pull to refresh
   * Engaging, discoverable
   */
  pullToRefresh: {
    threshold: 80,
    rotate: { from: 0, to: 360 },
    duration: 1000,
    loop: true,
  },
  
  /**
   * Error shake
   * Attention, urgency
   */
  errorShake: {
    from: { translateX: -10 },
    to: { translateX: 10 },
    duration: 100,
    repeat: 3,
    haptic: 'error' as const,
  },
} as const;

/**
 * List/FlatList entrance animations
 * Staggered for professional feel
 */
export const listAnimations = {
  /**
   * Fade and slide in with stagger
   */
  staggeredFadeIn: {
    from: { opacity: 0, translateY: 20, scale: 0.95 },
    to: { opacity: 1, translateY: 0, scale: 1 },
    duration: 400,
    stagger: 80,
    easing: easings.easeOutCubic,
  },
  
  /**
   * Scale in with stagger
   */
  staggeredScale: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 300,
    stagger: 60,
    spring: springAnimations.snappy,
  },
  
  /**
   * Slide from left with stagger
   */
  staggeredSlideLeft: {
    from: { translateX: -50, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: 400,
    stagger: 80,
    easing: easings.easeOutCubic,
  },
} as const;

/**
 * Page transition presets
 */
export const pageTransitions = {
  /**
   * Slide from right (stack navigation)
   */
  slideFromRight: {
    from: { translateX: width },
    to: { translateX: 0 },
    duration: 300,
    easing: easings.easeOutCubic,
  },
  
  /**
   * Slide from bottom (modal)
   */
  slideFromBottom: {
    from: { translateY: height },
    to: { translateY: 0 },
    duration: 400,
    spring: springAnimations.molasses,
    backdrop: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 250,
    },
  },
  
  /**
   * Fade transition
   */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 250,
    easing: easings.linear,
  },
  
  /**
   * Zoom entrance
   */
  zoomIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 300,
    spring: springAnimations.snappy,
  },
} as const;

/**
 * Haptic feedback patterns
 * Maps to device haptic engine
 */
export const hapticFeedback = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
  selection: 'selection',
  impact: 'impact',
} as const;

/**
 * Animation config for Reanimated
 * Ready to use with react-native-reanimated
 */
export const reanimatedAnimations = {
  /**
   * Spring animation config
   */
  spring: (config = springAnimations.gentle) => ({
    damping: config.friction * 2,
    mass: config.mass,
    overshootClamping: config.overshootClamping,
    restSpeedThreshold: 2,
    restDisplacementThreshold: 2,
  }),
  
  /**
   * Timing animation config
   */
  timing: (duration: number, easing = easings.linear) => ({
    duration,
    easing: easing as any,
  }),
} as const;

export default {
  springAnimations,
  animationDurations,
  easings,
  microInteractions,
  listAnimations,
  pageTransitions,
  hapticFeedback,
  reanimatedAnimations,
};
