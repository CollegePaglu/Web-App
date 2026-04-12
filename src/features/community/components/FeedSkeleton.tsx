import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';

type FeedSkeletonProps = {
    count?: number;
};

/**
 * Placeholder rows shown while the main post feed is loading (before data arrives).
 */
export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
    const ui = useThemeColors();
    return (
        <View style={styles.container}>
            {Array.from({ length: count }, (_, i) => (
                <View key={i} style={[styles.post, { backgroundColor: ui.surface }]}>
                    <View style={styles.header}>
                        <View style={[styles.avatar, { backgroundColor: ui.surfaceHighlight }]} />
                        <View style={styles.nameCol}>
                            <View style={[styles.nameLine, { backgroundColor: ui.surfaceHighlight }]} />
                            <View style={[styles.timeLine, { backgroundColor: ui.surfaceHighlight }]} />
                        </View>
                    </View>
                    <View style={[styles.image, { backgroundColor: ui.surfaceHighlight }]} />
                    <View style={styles.actions}>
                        <View style={[styles.action, { backgroundColor: ui.surfaceHighlight }]} />
                        <View style={[styles.action, { backgroundColor: ui.surfaceHighlight }]} />
                        <View style={[styles.action, { backgroundColor: ui.surfaceHighlight }]} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
    },
    post: {
        marginBottom: 16,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    nameCol: {
        marginLeft: 12,
    },
    nameLine: {
        width: 100,
        height: 12,
        borderRadius: 6,
        marginBottom: 6,
    },
    timeLine: {
        width: 60,
        height: 10,
        borderRadius: 5,
    },
    image: {
        width: '100%',
        height: 300,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16,
    },
    action: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },
});
