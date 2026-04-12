/**
 * VoteButtons Component
 * 
 * Premium upvote/downvote buttons with haptic feedback and smooth animations.
 * Uses react-native-reanimated for fluid transitions.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    interpolateColor,
    useDerivedValue,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { grey } from '@/theme/colors';
import { VoteType } from '@/features/community/types';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

interface VoteButtonsProps {
    upvotes: number;
    downvotes: number;
    userVote: VoteType | null;
    onVote: (type: VoteType) => void;
    onRemoveVote: () => void;
    size?: 'small' | 'medium';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VoteButtons: React.FC<VoteButtonsProps> = ({
    upvotes,
    downvotes,
    userVote,
    onVote,
    onRemoveVote,
    size = 'medium',
}) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();

    // Scale values for button press animation
    const upvoteScale = useSharedValue(1);
    const downvoteScale = useSharedValue(1);
    const upvoteRotation = useSharedValue(0);
    const downvoteRotation = useSharedValue(0);

    // Derived values for active state 
    // 0 = inactive, 1 = active
    const upvoteActive = useDerivedValue(() => {
        return withTiming(userVote === 'up' ? 1 : 0, { duration: 200 });
    }, [userVote]);

    const downvoteActive = useDerivedValue(() => {
        return withTiming(userVote === 'down' ? 1 : 0, { duration: 200 });
    }, [userVote]);

    const iconSize = size === 'small' ? 18 : 22;
    const fontSize = size === 'small' ? 12 : 14;
    const netVotes = upvotes - downvotes;

    // Trigger Haptic Feedback
    const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
        if (type === 'medium') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleUpvote = () => {
        triggerHaptic(userVote === 'up' ? 'light' : 'medium');

        // Bounce and Wiggle animation
        upvoteScale.value = withSequence(
            withSpring(1.3, { damping: 8, stiffness: 200 }),
            withSpring(1)
        );
        upvoteRotation.value = withSequence(
            withTiming(-15, { duration: 50 }),
            withTiming(15, { duration: 100 }),
            withTiming(0, { duration: 50 })
        );

        if (userVote === 'up') {
            onRemoveVote();
        } else {
            onVote('up');
        }
    };

    const handleDownvote = () => {
        triggerHaptic('light');

        downvoteScale.value = withSequence(
            withSpring(1.2, { damping: 10, stiffness: 200 }),
            withSpring(1)
        );
        downvoteRotation.value = withSequence(
            withTiming(15, { duration: 50 }),
            withTiming(-15, { duration: 100 }),
            withTiming(0, { duration: 50 })
        );

        if (userVote === 'down') {
            onRemoveVote();
        } else {
            onVote('down');
        }
    };

    // Animated Styles for Upvote Button
    const upvoteStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            upvoteActive.value,
            [0, 1],
            ['transparent', isDark ? 'rgba(255, 107, 53, 0.15)' : '#FFF4ED']
        );

        return {
            transform: [
                { scale: upvoteScale.value },
                { rotate: `${upvoteRotation.value}deg` }
            ],
            backgroundColor,
        };
    });

    // Animated Styles for Downvote Button
    const downvoteStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            downvoteActive.value,
            [0, 1],
            ['transparent', isDark ? 'rgba(107, 91, 255, 0.15)' : '#F0F0FF']
        );

        return {
            transform: [
                { scale: downvoteScale.value },
                { rotate: `${downvoteRotation.value}deg` }
            ],
            backgroundColor,
        };
    });

    const containerStyle = {
        backgroundColor: colors.surfaceHighlight,
        borderColor: colors.border,
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Upvote */}
            <AnimatedPressable
                style={[styles.button, upvoteStyle]}
                onPress={handleUpvote}
                hitSlop={8}
            >
                <Ionicons
                    name={userVote === 'up' ? 'arrow-up' : 'arrow-up-outline'}
                    size={iconSize}
                    color={userVote === 'up' ? '#FF6B35' : colors.textSecondary}
                />
            </AnimatedPressable>

            {/* Vote count with key change animation */}
            <Animated.View
                key={netVotes}
                entering={ZoomIn.duration(200)}
                exiting={ZoomOut.duration(200)}
                style={styles.countContainer}
            >
                <Text
                    style={[
                        styles.count,
                        { fontSize, color: colors.text },
                        netVotes > 0 && styles.countPositive,
                        netVotes < 0 && styles.countNegative,
                    ]}
                >
                    {netVotes}
                </Text>
            </Animated.View>

            {/* Downvote */}
            <AnimatedPressable
                style={[styles.button, downvoteStyle]}
                onPress={handleDownvote}
                hitSlop={8}
            >
                <Ionicons
                    name={userVote === 'down' ? 'arrow-down' : 'arrow-down-outline'}
                    size={iconSize}
                    color={userVote === 'down' ? '#6B5BFF' : colors.textSecondary}
                />
            </AnimatedPressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24, // Pill shape
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 1,
    },
    button: {
        padding: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countContainer: {
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    count: {
        fontWeight: '700',
        textAlign: 'center',
    },
    countPositive: {
        color: '#FF6B35',
    },
    countNegative: {
        color: '#6B5BFF',
    },
});

export default VoteButtons;
