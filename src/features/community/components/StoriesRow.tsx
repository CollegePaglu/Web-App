/**
 * StoriesRow Component - Instagram-style
 * 
 * Horizontal scrollable row of user stories.
 * Uses ScrollView instead of FlatList to avoid gesture conflicts
 * with the parent vertical FlatList.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { StoryItem } from './StoryItem';
import { UserStories, Story, CommunityUser } from '@/features/community/types';
import { useCurrentUser } from '@/features/auth';
import { useThemeColors } from '@/context/ThemeContext';

interface StoriesRowProps {
    userStories: UserStories[];
    myStories: Story[];
    isLoading?: boolean;
    onStoryPress: (userStories: UserStories, index: number) => void;
    onAddStoryPress: () => void;
    onMyStoryPress: () => void;
}

export const StoriesRow: React.FC<StoriesRowProps> = ({
    userStories,
    myStories,
    isLoading = false,
    onStoryPress,
    onAddStoryPress,
    onMyStoryPress,
}) => {
    const currentUser = useCurrentUser();
    const colors = useThemeColors();

    const hasMyStories = (myStories?.length ?? 0) > 0;

    const myUser: CommunityUser = {
        id: currentUser?._id || 'me',
        name: currentUser?.name || 'You',
        avatarUrl: currentUser?.avatar,
    };

    // Loading skeleton
    if (isLoading && (userStories?.length ?? 0) === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    scrollEventThrottle={16}
                >
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={styles.skeleton}>
                            <View style={[styles.skeletonCircle, { backgroundColor: colors.surfaceHighlight }]} />
                            <View style={[styles.skeletonText, { backgroundColor: colors.surfaceHighlight }]} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    const stories = userStories ?? [];

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
            >
                {/* Own story / Add story */}
                <StoryItem
                    user={myUser}
                    hasUnviewed={hasMyStories}
                    isOwnStory={true}
                    showAddButton={!hasMyStories}
                    onPress={hasMyStories ? onMyStoryPress : onAddStoryPress}
                />

                {/* Other users' stories */}
                {stories.length > 0 ? (
                    stories.map((item, index) => (
                        <StoryItem
                            key={item.userId}
                            user={item.user}
                            hasUnviewed={item.hasUnviewed}
                            onPress={() => onStoryPress(item, index)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No stories yet
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    list: {
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '400',
    },
    skeleton: {
        alignItems: 'center',
        marginRight: 12,
        width: 80,
    },
    skeletonCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    skeletonText: {
        width: 50,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
    },
});

export default StoriesRow;

