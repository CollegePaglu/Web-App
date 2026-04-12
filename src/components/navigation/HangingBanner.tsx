/**
 * HangingBanner Component - Flag Style Connected to Center
 * 
 * Small waving flags attached to center FAB
 * Ultra-gentle animation for premium feel
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface HangingBannerProps {
    brand: 'campusmart' | 'lazzypeeps';
    side: 'left' | 'right';
}

const brandConfig = {
    campusmart: {
        colors: ['#3D5940', '#2A3F2C'], // Forest gradient
        text: 'CAMPUSMART',
    },
    lazzypeeps: {
        colors: ['#FF8C42', '#FF7F3C'], // Accent Orange gradient
        text: 'LAZYPEEPS',
    },
};

export const HangingBanner: React.FC<HangingBannerProps> = ({ brand, side }) => {
    const rotate = useSharedValue(0);
    const scaleY = useSharedValue(1);

    const config = brandConfig[brand];

    // Ultra-gentle flag wave - feels like air
    useEffect(() => {
        // Subtle rotation - ±2° for compact flags
        rotate.value = withRepeat(
            withSequence(
                withTiming(side === 'left' ? 2 : -2, {
                    duration: 3500,
                    easing: Easing.inOut(Easing.sin)
                }),
                withTiming(side === 'left' ? -1.5 : 1.5, {
                    duration: 3500,
                    easing: Easing.inOut(Easing.sin)
                })
            ),
            -1,
            true
        );

        // Barely visible vertical wave
        scaleY.value = withRepeat(
            withSequence(
                withTiming(1.006, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.994, { duration: 3200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [side]);

    const animatedStyle = useAnimatedStyle(() => {
        // Simulate transform origin by adjusting position
        const anchorOffset = side === 'left' ? -48 : 48; // Half of 96px width

        return {
            transform: [
                { translateX: anchorOffset },
                { rotate: `${rotate.value}deg` },
                { scaleY: scaleY.value },
            ],
        };
    });

    return (
        <View style={styles.container}>
            {/* Large Waving Flag */}
            <Animated.View style={[styles.flagWrapper, animatedStyle]}>
                <Svg width="96" height="52" viewBox="0 0 96 52">
                    <Defs>
                        <LinearGradient id={`grad-${brand}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={config.colors[0]} stopOpacity="1" />
                            <Stop offset="100%" stopColor={config.colors[1]} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>

                    {/* Large flag shape */}
                    <Path
                        d="M 4 4 L 92 4 Q 94 26 92 48 L 4 48 Q 2 26 4 4 Z"
                        fill={`url(#grad-${brand})`}
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth="1"
                    />
                </Svg>

                {/* Brand text */}
                <View style={styles.textContainer}>
                    <Text style={styles.brandText} numberOfLines={1}>{config.text}</Text>
                </View>
            </Animated.View>

            {/* Soft shadow */}
            <View style={styles.flagShadow} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 96, // Doubled from 48
        height: 52, // Doubled from 26
        alignItems: 'center',
        justifyContent: 'center',
    },
    flagWrapper: {
        // No transform origin needed with simulated offset
    },
    textContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    brandText: {
        color: 'white',
        fontSize: 11, // Doubled from 5.5
        fontWeight: '900',
        letterSpacing: 0.4,
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    flagShadow: {
        position: 'absolute',
        bottom: -4,
        width: 72,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
    },
});
