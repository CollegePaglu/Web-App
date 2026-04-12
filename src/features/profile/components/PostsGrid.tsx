/**
 * PostsGrid Component
 * 
 * Instagram-style 3-column grid for posts with square thumbnails
 */

import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';
import { Post } from '@/features/community';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 2;
const COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - (GAP * (COLUMNS - 1))) / COLUMNS;

interface PostsGridProps {
    posts: Post[];
    isLoading: boolean;
    onPostPress: (post: Post) => void;
    onPostLongPress?: (post: Post) => void;
    emptyMessage?: string;
    emptyIcon?: keyof typeof Ionicons.glyphMap;
}

export const PostsGrid: React.FC<PostsGridProps> = ({
    posts,
    isLoading,
    onPostPress,
    onPostLongPress,
    emptyMessage = 'No posts yet',
    emptyIcon = 'camera-outline',
}) => {
    const colors = useThemeColors();

    const handlePress = (post: Post) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPostPress(post);
    };

    const handleLongPress = (post: Post) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPostLongPress?.(post);
    };

    const getPostThumbnail = (post: Post): string | null => {
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            return post.mediaUrls[0];
        }
        return null;
    };

    // Create grid rows
    const gridRows = useMemo(() => {
        const rows: Post[][] = [];
        for (let i = 0; i < posts.length; i += COLUMNS) {
            rows.push(posts.slice(i, i + COLUMNS));
        }
        return rows;
    }, [posts]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (posts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name={emptyIcon} size={56} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {emptyMessage}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {gridRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((post, colIndex) => {
                        const thumbnail = getPostThumbnail(post);
                        return (
                            <Animated.View
                                key={post.id}
                                entering={FadeIn.delay((rowIndex * COLUMNS + colIndex) * 50)}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => handlePress(post)}
                                    onLongPress={() => handleLongPress(post)}
                                    style={[
                                        styles.gridItem,
                                        colIndex < COLUMNS - 1 && { marginRight: GAP },
                                        rowIndex > 0 && { marginTop: GAP },
                                    ]}
                                >
                                    {thumbnail ? (
                                        <AppImage uri={thumbnail} style={styles.thumbnail} contentFit="cover" />
                                    ) : (
                                        <View style={[styles.textPost, { backgroundColor: colors.surfaceHighlight }]}>
                                            <Text
                                                style={[styles.textPostContent, { color: colors.text }]}
                                                numberOfLines={4}
                                            >
                                                {post.content || ''}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Multi-media indicator */}
                                    {post.mediaUrls && post.mediaUrls.length > 1 && (
                                        <View style={styles.multiIndicator}>
                                            <Ionicons name="copy" size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                    {/* Fill empty cells in last row */}
                    {row.length < COLUMNS && Array(COLUMNS - row.length).fill(0).map((_, i) => (
                        <View key={`empty-${i}`} style={[styles.gridItem, { marginLeft: GAP }]} />
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    /** No flex:1 — inside ScrollView it collapses to 0 height and the grid disappears. */
    container: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    gridItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    textPost: {
        width: '100%',
        height: '100%',
        padding: 8,
        justifyContent: 'center',
    },
    textPostContent: {
        fontSize: 12,
        lineHeight: 16,
    },
    multiIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    loadingContainer: {
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyContainer: {
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        fontWeight: '500',
    },
});
