import React, { useCallback } from 'react';
import { View, RefreshControl, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Post } from '../types';
import PostCard from './PostCard';
import { useFeedFlashListProps } from '../hooks/useFeedFlashListProps';

interface FeedListProps {
    posts: Post[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    onRefresh: () => void;
    onEndReached: () => void;
    onVote: (postId: string, type: 'up' | 'down') => void;
    onRemoveVote: (postId: string) => void;
    onCommentPress: (postId: string) => void;
    onUserPress: (userId: string) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const FeedList: React.FC<FeedListProps> = ({
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    onRefresh,
    onEndReached,
    onVote,
    onRemoveVote,
    onCommentPress,
    onUserPress,
    ListHeaderComponent,
}) => {
    
    const renderItem = useCallback(({ item }: { item: Post }) => (
        <PostCard
            post={item}
            onVote={onVote}
            onRemoveVote={onRemoveVote}
            onCommentPress={onCommentPress}
            onUserPress={onUserPress}
        />
    ), [onVote, onRemoveVote, onCommentPress, onUserPress]);

    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return <View style={{ height: 20 }} />;
        
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#9CA3AF" />
            </View>
        );
    }, [isLoadingMore]);

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            );
        }
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
            </View>
        );
    }, [isLoading]);

    const flashScrollProps = useFeedFlashListProps();

    return (
        <FlashList
            {...flashScrollProps}
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
            }
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    centerContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
        textAlign: 'center',
    }
});

export default FeedList;
