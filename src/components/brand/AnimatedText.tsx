/**
 * AnimatedText - Staggered Letter Reveal Animation
 * 
 * Reveals text letter by letter with fade and slide effects.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface AnimatedTextProps {
    text: string;
    delay?: number;
    letterDelay?: number;
    duration?: number;
    style?: object;
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '600' | '700';
}

export function AnimatedText({
    text,
    delay = 0,
    letterDelay = 40,
    duration = 300,
    style,
    color = '#000000',
    fontSize = 48,
    fontWeight = 'bold',
}: AnimatedTextProps) {
    const letters = text.split('');

    return (
        <View style={[styles.container, style]}>
            {letters.map((letter, index) => (
                <AnimatedLetter
                    key={`${letter}-${index}`}
                    letter={letter}
                    delay={delay + index * letterDelay}
                    duration={duration}
                    color={color}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                />
            ))}
        </View>
    );
}

interface AnimatedLetterProps {
    letter: string;
    delay: number;
    duration: number;
    color: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold' | '600' | '700';
}

function AnimatedLetter({
    letter,
    delay,
    duration,
    color,
    fontSize,
    fontWeight,
}: AnimatedLetterProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
        );
        translateY.value = withDelay(
            delay,
            withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
        );
        scale.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
        );
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.Text
            style={[
                {
                    color,
                    fontSize,
                    fontWeight,
                    letterSpacing: 0.5,
                },
                animatedStyle,
            ]}
        >
            {letter === ' ' ? '\u00A0' : letter}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
});

export default AnimatedText;
