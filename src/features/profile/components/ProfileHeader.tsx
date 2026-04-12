/**
 * ProfileHeader Component
 * 
 * Instagram-style profile header with avatar, name, bio, and settings
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 90;

interface ProfileHeaderProps {
    user: {
        avatar?: string | null;
        displayName?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        bio?: string;
        college?: {
            name?: string;
            department?: string;
            year?: number;
        };
    } | null;
    onSettingsPress: () => void;
    onAvatarPress?: () => void;
    onBackPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    onSettingsPress,
    onAvatarPress,
    onBackPress,
}) => {
    const colors = useThemeColors();
    const avatarScale = useSharedValue(1);

    const displayName = user?.displayName ||
        (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
        user?.name ||
        'User';

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleAvatarPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        avatarScale.value = withSequence(
            withSpring(0.95, { damping: 10 }),
            withSpring(1, { damping: 8 })
        );
        onAvatarPress?.();
    };

    const avatarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: avatarScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Back Button */}
            {onBackPress && (
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={colors.text}
                    onPress={onBackPress}
                    style={styles.backButtonIcon}
                />
            )}

            {/* Settings Button */}
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={onSettingsPress}
            >
                <Ionicons name="menu-outline" size={28} color={colors.text} />
            </TouchableOpacity>

            {/* Avatar with gradient ring */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleAvatarPress}
            >
                <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
                    <LinearGradient
                        colors={['#1B9D6B', '#22C55E', '#86EFAC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarGradient}
                    >
                        {user?.avatar ? (
                            <AppImage uri={user.avatar} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceHighlight }]}>
                                <Text style={[styles.avatarText, { color: colors.text }]}>
                                    {getInitials(displayName)}
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            {/* Username */}
            <Text style={[styles.displayName, { color: colors.text }]}>
                {displayName}
            </Text>

            {/* Bio */}
            {user?.bio && (
                <Text style={[styles.bio, { color: colors.textSecondary }]}>
                    {user.bio}
                </Text>
            )}

            {/* College Info */}
            {user?.college?.name && (
                <View style={styles.collegeRow}>
                    <Ionicons name="school-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.collegeText, { color: colors.textTertiary }]}>
                        {user.college.name}
                        {user.college.department && ` • ${user.college.department}`}
                        {user.college.year && ` • Year ${user.college.year}`}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButtonIcon: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        padding: 4,
    },
    settingsButton: {
        position: 'absolute',
        top: 8,
        right: 16,
        padding: 8,
        zIndex: 10,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatarGradient: {
        width: AVATAR_SIZE + 6,
        height: AVATAR_SIZE + 6,
        borderRadius: (AVATAR_SIZE + 6) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
        borderColor: '#000',
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    displayName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 32,
        lineHeight: 20,
    },
    collegeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    collegeText: {
        fontSize: 13,
        marginLeft: 6,
    },
});
