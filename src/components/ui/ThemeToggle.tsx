import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    // Animation values
    const offset = useSharedValue(isDark ? 1 : 0);
    const scale = useSharedValue(1);

    useEffect(() => {
        offset.value = withSpring(isDark ? 1 : 0, {
            damping: 15,
            stiffness: 120,
        });
    }, [isDark]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            offset.value,
            [0, 1],
            ['#e0e0e0', '#333333']
        );
        return { backgroundColor };
    });

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value * 24 },
                { scale: scale.value }
            ],
        };
    });

    const onPressIn = () => {
        scale.value = withTiming(0.9, { duration: 100 });
    };

    const onPressOut = () => {
        scale.value = withSpring(1);
        toggleTheme();
    };

    return (
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.container}>
            <Animated.View style={[styles.track, animatedContainerStyle]}>
                <Animated.View style={[styles.circle, animatedCircleStyle]}>
                    <Ionicons
                        name={isDark ? "moon" : "sunny"}
                        size={14}
                        color={isDark ? "#FFF" : "#F59E0B"}
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    track: {
        width: 52,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 4,
    },
});
