/**
 * Splash Screen
 * 
 * Animated brand intro with Paglu mascot.
 * Duration: ~9 seconds - slow, immersive intro experience.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    withSequence,
    withSpring,
    Easing,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuthStore } from '../../src/features/auth';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors - Modern College Paglu Theme
const COLORS = {
    background: '#FAF8F3', // Beige Cream - warm, inviting
    black: '#2A3F2C',      // Forest Deep - sophisticated dark
    gray: '#8BA888',       // Sage Main - soft accents
};

// Animation timing (in ms) - SLOW, immersive splash
// Animation timing (in ms) - FAST & SNAPPY (Total 2.5s)
const TIMING = {
    DROP_FALL: 400,
    PAUSE_AFTER_DROP: 50,
    TRANSFORM: 400,
    EYES_POP: 300,
    PAUSE_AFTER_EYES: 50,
    SMILE_DRAW: 300,
    PAUSE_AFTER_SMILE: 50,
    WINK: 200,
    WINK_HOLD: 300,
    TEXT_START: 1300,
    TOTAL: 2500,
};

export default function SplashScreen() {
    const [showFace, setShowFace] = useState(false);

    // Animation values
    const dropY = useSharedValue(-150);
    const dropScale = useSharedValue(0.3);
    const dropOpacity = useSharedValue(1);
    const faceScale = useSharedValue(0);
    const faceOpacity = useSharedValue(0);
    const leftEyeScale = useSharedValue(0);
    const rightEyeScale = useSharedValue(0);
    const smileProgress = useSharedValue(0);
    const winkProgress = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textY = useSharedValue(30);
    const taglineOpacity = useSharedValue(0);
    const taglineY = useSharedValue(15);

    // Face dimensions
    const FACE_SIZE = 120;
    const FACE_CENTER_Y = SCREEN_HEIGHT * 0.4;

    const { isAuthenticated } = useAuthStore(); // You might need to import useAuthStore or pass auth prop

    useEffect(() => {
        // Phase 1: Drop falls slowly with dramatic gravity
        dropY.value = withTiming(FACE_CENTER_Y - 60, {
            duration: TIMING.DROP_FALL,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth, slow gravity
        });

        dropScale.value = withSequence(
            withTiming(1, { duration: TIMING.DROP_FALL, easing: Easing.out(Easing.quad) }),
            withSpring(0.85, { damping: 6, stiffness: 150 }), // Slower bounce
            withSpring(1, { damping: 10, stiffness: 100 }),
        );

        // Phase 2: Drop transforms into face (with pause)
        const transformDelay = TIMING.DROP_FALL + TIMING.PAUSE_AFTER_DROP;

        dropOpacity.value = withDelay(
            transformDelay,
            withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
        );

        faceOpacity.value = withDelay(
            transformDelay,
            withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
        );

        faceScale.value = withDelay(
            transformDelay,
            withSequence(
                withSpring(1.15, { damping: 8, stiffness: 120 }), // Slower spring
                withSpring(1, { damping: 12, stiffness: 100 }),
            )
        );

        // Phase 3: Eyes pop in slowly with playful overshoot
        const eyesDelay = transformDelay + TIMING.TRANSFORM;

        leftEyeScale.value = withDelay(
            eyesDelay,
            withSequence(
                withSpring(1.5, { damping: 6, stiffness: 200 }), // More overshoot
                withSpring(1, { damping: 10, stiffness: 120 }),
            )
        );

        rightEyeScale.value = withDelay(
            eyesDelay + 150, // Larger stagger for more playful effect
            withSequence(
                withSpring(1.5, { damping: 6, stiffness: 200 }),
                withSpring(1, { damping: 10, stiffness: 120 }),
            )
        );

        // Phase 4: Smile draws in slowly
        const smileDelay = eyesDelay + TIMING.EYES_POP + TIMING.PAUSE_AFTER_EYES;
        smileProgress.value = withDelay(
            smileDelay,
            withTiming(1, { duration: TIMING.SMILE_DRAW, easing: Easing.out(Easing.cubic) })
        );

        // Phase 5: Left eye wink animation
        const winkDelay = smileDelay + TIMING.SMILE_DRAW + TIMING.PAUSE_AFTER_SMILE;
        winkProgress.value = withDelay(
            winkDelay,
            withSequence(
                withTiming(1, { duration: TIMING.WINK, easing: Easing.inOut(Easing.ease) }),
                withDelay(TIMING.WINK_HOLD, withTiming(1, { duration: 1 })), // Hold wink
            )
        );

        // Phase 6: Text animations with slow, elegant reveal
        textOpacity.value = withDelay(
            TIMING.TEXT_START,
            withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
        );

        textY.value = withDelay(
            TIMING.TEXT_START,
            withSpring(0, { damping: 12, stiffness: 80 }) // Slower spring
        );

        taglineOpacity.value = withDelay(
            TIMING.TEXT_START + 400, // Larger stagger
            withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
        );

        taglineY.value = withDelay(
            TIMING.TEXT_START + 400,
            withSpring(0, { damping: 12, stiffness: 80 })
        );

        // Navigate after full animation
        const timer = setTimeout(() => {
            if (isAuthenticated) {
                router.replace('/(main)/(tabs)/home');
            } else {
                router.replace('/(auth)/phone-input');
            }
        }, TIMING.TOTAL);

        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    // Animated styles
    const dropStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: dropY.value },
            { scale: dropScale.value },
        ],
        opacity: dropOpacity.value,
    }));

    const faceStyle = useAnimatedStyle(() => ({
        transform: [{ scale: faceScale.value }],
        opacity: faceOpacity.value,
    }));

    // Left eye winks (opacity fades, wink line appears)
    const leftEyeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: leftEyeScale.value }],
        opacity: interpolate(winkProgress.value, [0, 0.5], [1, 0]),
    }));

    // Right eye stays open
    const rightEyeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rightEyeScale.value }],
        opacity: rightEyeScale.value,
    }));

    // Wink line appears on LEFT side
    const winkStyle = useAnimatedStyle(() => ({
        opacity: interpolate(winkProgress.value, [0.5, 1], [0, 1]),
        transform: [{ translateY: interpolate(winkProgress.value, [0, 1], [-5, 0]) }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textY.value }],
    }));

    const taglineStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
        transform: [{ translateY: taglineY.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Ink Drop */}
            <Animated.View style={[styles.dropContainer, dropStyle]}>
                <View style={styles.drop}>
                    <View style={styles.dropInner} />
                </View>
            </Animated.View>

            {/* Face */}
            <Animated.View
                style={[
                    styles.faceContainer,
                    faceStyle,
                    { top: FACE_CENTER_Y - FACE_SIZE / 2 }
                ]}
            >
                <Svg width={FACE_SIZE} height={FACE_SIZE} viewBox="0 0 120 120">
                    {/* Face circle - white fill with black outline */}
                    <Circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="#FFFFFF"
                        stroke="#000000"
                        strokeWidth="4"
                    />

                    {/* Shine highlight */}
                    <Circle cx="40" cy="40" r="10" fill="#F0F0F0" opacity="0.6" />
                </Svg>

                {/* Eyes */}
                <Animated.View style={[styles.eye, styles.leftEye, leftEyeStyle]}>
                    <View style={styles.eyeInner} />
                </Animated.View>

                <Animated.View style={[styles.eye, styles.rightEye, rightEyeStyle]}>
                    <View style={styles.eyeInner} />
                </Animated.View>

                {/* Wink Path - now black for white face */}
                <Animated.View style={[styles.winkContainer, winkStyle]}>
                    <Svg width="40" height="20" viewBox="0 0 40 20">
                        <Path
                            d="M 5 5 Q 20 15 35 5"
                            stroke="#000000"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>

                {/* Smile - now black for white face */}
                <Animated.View style={[styles.smileContainer]}>
                    <Svg width="70" height="30" viewBox="0 0 70 30">
                        <Path
                            d="M 5 5 Q 35 35 65 5"
                            stroke="#000000"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>
            </Animated.View>

            {/* Text */}
            <View style={styles.textContainer}>
                <Animated.Text style={[styles.title, textStyle]}>
                    college paglu
                </Animated.Text>
                <Animated.Text style={[styles.tagline, taglineStyle]}>
                    made by paglus for paglus
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    dropContainer: {
        position: 'absolute',
        top: SCREEN_HEIGHT / 2,
        alignItems: 'center',
    },
    drop: {
        width: 40,
        height: 50,
        backgroundColor: COLORS.black,
        borderRadius: 20,
        // Teardrop shape
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    dropInner: {
        position: 'absolute',
        top: 8,
        left: 10,
        width: 10,
        height: 10,
        backgroundColor: '#333333',
        borderRadius: 5,
        opacity: 0.5,
    },
    faceContainer: {
        position: 'absolute',
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eye: {
        position: 'absolute',
        width: 14,
        height: 14,
        backgroundColor: '#000000',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftEye: {
        top: 44,
        left: 34,
    },
    rightEye: {
        top: 44,
        right: 34,
    },
    winkContainer: {
        position: 'absolute',
        top: 42,
        left: 20,
        width: 40,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeInner: {
        width: 4,
        height: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        marginTop: -4,
        marginLeft: -2,
    },
    smileContainer: {
        position: 'absolute',
        top: 65,
    },
    textContainer: {
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.25,
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.black,
        letterSpacing: 1,
    },
    tagline: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
});
