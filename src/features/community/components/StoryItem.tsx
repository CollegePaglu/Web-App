/**
 * StoryItem Component - Instagram-style
 * 
 * Circular avatar with gradient ring for stories.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommunityUser } from '@/features/community/types';
import { useThemeColors } from '@/context/ThemeContext';

interface StoryItemProps {
    user: CommunityUser;
    hasUnviewed: boolean;
    isOwnStory?: boolean;
    showAddButton?: boolean;
    onPress: () => void;
    size?: 'small' | 'large';
}

// Instagram gradient colors
const GRADIENT_COLORS = ['#DE0046', '#F7A34B'];
const VIEWED_GRADIENT = ['#C7C7C7', '#A8A8A8'];

export const StoryItem: React.FC<StoryItemProps> = ({
    user,
    hasUnviewed,
    isOwnStory = false,
    showAddButton = false,
    onPress,
    size = 'small',
}) => {
    const colors = useThemeColors();

    const dimensions = size === 'large' ? 80 : 72;
    const avatarSize = size === 'large' ? 68 : 64;
    const ringWidth = 3;

    const gradientColors = hasUnviewed ? GRADIENT_COLORS : VIEWED_GRADIENT;

    if (!user) return null;

    const userName = user.name || 'User';
    const firstLetter = userName.charAt(0).toUpperCase();
    const displayName = isOwnStory ? 'Your story' : userName.split(' ')[0];

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
            accessibilityLabel={isOwnStory ? 'Your story' : `${userName}'s story`}
        >
            {/* Gradient ring */}
            <LinearGradient
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradientRing,
                    {
                        width: dimensions,
                        height: dimensions,
                        borderRadius: dimensions / 2
                    },
                ]}
            >
                {/* White inner border */}
                <View
                    style={[
                        styles.innerBorder,
                        {
                            width: dimensions - ringWidth * 2,
                            height: dimensions - ringWidth * 2,
                            borderRadius: (dimensions - ringWidth * 2) / 2,
                            backgroundColor: colors.surface,
                        },
                    ]}
                >
                    {/* Avatar */}
                    {user.avatarUrl ? (
                        <AppImage
                            uri={user.avatarUrl}
                            style={[
                                styles.avatar,
                                {
                                    width: avatarSize,
                                    height: avatarSize,
                                    borderRadius: avatarSize / 2
                                },
                            ]}
                            contentFit="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.avatarPlaceholder,
                                {
                                    width: avatarSize,
                                    height: avatarSize,
                                    borderRadius: avatarSize / 2,
                                    backgroundColor: colors.surfaceHighlight,
                                },
                            ]}
                        >
                            <Text style={[styles.avatarText, { color: colors.textSecondary }]}>
                                {firstLetter}
                            </Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Add button for own story */}
            {isOwnStory && showAddButton && (
                <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                </View>
            )}

            {/* Username */}
            <Text
                style={[styles.username, { color: colors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {displayName}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 12,
        width: 80,
    },
    gradientRing: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerBorder: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    avatar: {
        backgroundColor: '#E0E0E0',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '600',
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    username: {
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
        width: '100%',
        fontWeight: '400',
    },
});

export default StoryItem;
