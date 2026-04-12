/**
 * ProfileStats Component
 * 
 * Instagram-style horizontal stats row with posts, likes, connections
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';

interface ProfileStatsProps {
    postsCount: number;
    followersCount: number;
    connectionsCount?: number;
    onPostsPress?: () => void;
    onFollowersPress?: () => void;
    onConnectionsPress?: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    postsCount,
    followersCount,
    connectionsCount,
    onPostsPress,
    onFollowersPress,
    onConnectionsPress,
}) => {
    const colors = useThemeColors();

    const formatCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    return (
        <View style={[styles.container, { borderColor: colors.border }]}>
            <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={onPostsPress}
            >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                    {formatCount(postsCount)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Posts
                </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.7}
                onPress={onFollowersPress}
            >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                    {formatCount(followersCount)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Followers
                </Text>
            </TouchableOpacity>

            {connectionsCount !== undefined && (
                <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity
                        style={styles.statItem}
                        activeOpacity={0.7}
                        onPress={onConnectionsPress}
                    >
                        <Text style={[styles.statNumber, { color: colors.text }]}>
                            {formatCount(connectionsCount)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Connections
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 24,
        marginTop: 8,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    statLabel: {
        fontSize: 13,
        marginTop: 2,
        fontWeight: '400',
    },
    divider: {
        width: 1,
        height: 32,
    },
});
