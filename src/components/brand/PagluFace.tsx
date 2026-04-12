/**
 * PagluFace - Animated Brand Mascot
 * 
 * Animated ink drop face with eyes, smile, and wink.
 * Used in Splash and Login screens.
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface PagluFaceProps {
    size?: number;
    animate?: boolean;
    compact?: boolean;
    onAnimationComplete?: () => void;
}

// Animation timing constants (in ms)
const TIMING = {
    DROP_FALL: 800,
    DROP_BOUNCE: 200,
    TRANSFORM: 700,
    EYES_POP: 400,
    SMILE_DRAW: 600,
    WINK: 300,
    WINK_HOLD: 200,
};

// Animation delays (cumulative from start)
const DELAYS = {
    DROP: 0,
    TRANSFORM: 800,
    EYES: 1500,
    SMILE: 2200,
    WINK: 2800,
};

export function PagluFace({
    size = 120,
    animate = true,
    compact = false,
    onAnimationComplete,
}: PagluFaceProps) {
    // Animation values
    const dropY = useSharedValue(animate ? -200 : 0);
    const dropScale = useSharedValue(animate ? 0.3 : 1);
    const faceScale = useSharedValue(animate ? 0 : 1);
    const eyesScale = useSharedValue(animate ? 0 : 1);
    const smileProgress = useSharedValue(animate ? 0 : 1);
    const rightEyeWink = useSharedValue(0); // 0 = open, 1 = winked
    const breathingScale = useSharedValue(1);

    // Notify when animation completes
    const notifyComplete = useCallback(() => {
        onAnimationComplete?.();
    }, [onAnimationComplete]);

    // Start animation sequence
    useEffect(() => {
        if (!animate) {
            // Start breathing animation for compact mode
            if (compact) {
                startBreathing();
            }
            return;
        }

        // Phase 1: Drop falls with gravity
        dropY.value = withTiming(0, {
            duration: TIMING.DROP_FALL,
            easing: Easing.bezier(0.33, 0, 0.67, 1), // ease-in (gravity acceleration)
        });

        dropScale.value = withSequence(
            withTiming(1, { duration: TIMING.DROP_FALL }),
            // Bounce effect
            withSpring(0.9, { damping: 8, stiffness: 200 }),
            withSpring(1, { damping: 15, stiffness: 200 }),
        );

        // Phase 2: Transform to circle face
        faceScale.value = withDelay(
            DELAYS.TRANSFORM,
            withSpring(1, {
                damping: 15,
                stiffness: 200,
                overshootClamping: false,
            })
        );

        // Phase 3: Eyes pop in
        eyesScale.value = withDelay(
            DELAYS.EYES,
            withSequence(
                withSpring(1.3, { damping: 10, stiffness: 300 }),
                withSpring(1, { damping: 12, stiffness: 200 }),
            )
        );

        // Phase 4: Smile draws
        smileProgress.value = withDelay(
            DELAYS.SMILE,
            withTiming(1, {
                duration: TIMING.SMILE_DRAW,
                easing: Easing.out(Easing.ease),
            })
        );

        // Phase 5: Wink animation
        rightEyeWink.value = withDelay(
            DELAYS.WINK,
            withSequence(
                withTiming(1, { duration: TIMING.WINK, easing: Easing.out(Easing.ease) }),
                withDelay(TIMING.WINK_HOLD, withTiming(1, { duration: 1 })), // Keep winked
            )
        );

        // Notify completion after full animation
        const totalDuration = DELAYS.WINK + TIMING.WINK + TIMING.WINK_HOLD + 500;
        const timer = setTimeout(() => {
            runOnJS(notifyComplete)();
            // Start breathing after animation completes
            startBreathing();
        }, totalDuration);

        return () => clearTimeout(timer);
    }, [animate]);

    const startBreathing = () => {
        breathingScale.value = withSequence(
            withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        );
        // Loop breathing
        const interval = setInterval(() => {
            breathingScale.value = withSequence(
                withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            );
        }, 3000);
        return () => clearInterval(interval);
    };

    // Animated styles
    const dropAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: dropY.value },
            { scale: dropScale.value },
        ],
        opacity: interpolate(faceScale.value, [0, 0.5], [1, 0]),
    }));

    const faceAnimatedStyle = useAnimatedStyle(() => ({
        opacity: faceScale.value,
        transform: [
            { scale: faceScale.value * breathingScale.value },
        ],
    }));

    const eyesAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: eyesScale.value }],
        opacity: eyesScale.value,
    }));

    // SVG dimensions
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    const faceRadius = size * 0.4;
    const eyeRadius = size * 0.06;
    const eyeY = center - faceRadius * 0.15;
    const leftEyeX = center - faceRadius * 0.35;
    const rightEyeX = center + faceRadius * 0.35;

    // Smile path (bezier curve for open mouth smile)
    const smileWidth = faceRadius * 0.7;
    const smileY = center + faceRadius * 0.2;
    const smilePath = `M ${center - smileWidth} ${smileY} Q ${center} ${smileY + faceRadius * 0.5} ${center + smileWidth} ${smileY}`;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Drop animation (before transform) */}
            {animate && (
                <Animated.View style={[styles.dropContainer, dropAnimatedStyle]}>
                    <View style={[styles.drop, {
                        width: size * 0.2,
                        height: size * 0.25,
                        borderRadius: size * 0.1,
                        backgroundColor: '#000000',
                    }]} />
                </Animated.View>
            )}

            {/* Face with eyes and smile */}
            <Animated.View style={[styles.faceContainer, faceAnimatedStyle]}>
                <Svg width={size} height={size} viewBox={viewBox}>
                    {/* Face circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={faceRadius}
                        fill="#000000"
                    />

                    {/* Eyes group */}
                    <G>
                        {/* Left eye */}
                        <Circle
                            cx={leftEyeX}
                            cy={eyeY}
                            r={eyeRadius}
                            fill="#FFFFFF"
                        />

                        {/* Right eye (or wink line) */}
                        <Circle
                            cx={rightEyeX}
                            cy={eyeY}
                            r={eyeRadius}
                            fill="#FFFFFF"
                        />
                    </G>

                    {/* Smile */}
                    <Path
                        d={smilePath}
                        stroke="#FFFFFF"
                        strokeWidth={size * 0.04}
                        strokeLinecap="round"
                        fill="none"
                    />
                </Svg>

                {/* Wink overlay - covers right eye when winked */}
                <Animated.View
                    style={[
                        styles.winkOverlay,
                        {
                            top: eyeY - eyeRadius,
                            left: rightEyeX - eyeRadius * 1.5,
                            width: eyeRadius * 3,
                            height: eyeRadius * 2,
                        },
                    ]}
                >
                    {/* Wink arc drawn as a curved line */}
                    <Svg width={eyeRadius * 3} height={eyeRadius * 2} viewBox={`0 0 ${eyeRadius * 3} ${eyeRadius * 2}`}>
                        <Path
                            d={`M 0 ${eyeRadius} Q ${eyeRadius * 1.5} ${eyeRadius * 2} ${eyeRadius * 3} ${eyeRadius}`}
                            stroke="#FFFFFF"
                            strokeWidth={3}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drop: {
        // Teardrop shape approximation
    },
    faceContainer: {
        position: 'absolute',
    },
    winkOverlay: {
        position: 'absolute',
    },
});

export default PagluFace;
