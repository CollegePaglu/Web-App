/**
 * OrdersListScreen
 * 
 * List view for user's created assignments (orders)
 * Shows assignments with their status
 * Theme: Light/Green matching the app's design system
 */

import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, neutral, uiColors, shadowColors, primaryGreen } from '@/theme/colors';
import { Assignment } from '@/api/assignmentApi';
import { useAssignments } from '../hooks';
import { AssignmentStatusBadge } from '../components';

const ASSIGNMENT_TYPE_ICONS: Record<string, string> = {
    assignment: 'document-text-outline',
    project: 'folder-outline',
    presentation: 'easel-outline',
    thesis: 'book-outline',
    file: 'flask-outline',
    other: 'apps-outline',
};

import { useThemeColors } from '@/context/ThemeContext';

export const OrdersListScreen: React.FC = () => {
    const router = useRouter();
    const colors = useThemeColors();

    const styles = {
        container: {
            flex: 1,
            backgroundColor: colors.background, // Dynamic
        },
        header: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 26,
            fontWeight: '700' as const,
            color: colors.text,
            letterSpacing: -0.5,
        },
        headerSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
        },
        listContent: {
            paddingTop: 12,
            paddingBottom: 100,
            paddingHorizontal: 16,
        },
        listContentEmpty: {
            flex: 1,
        },
        orderCard: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.surface,
            marginBottom: 10,
            paddingHorizontal: 14,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.borderHighlight,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.surfaceHighlight, // Dynamic
            borderWidth: 1.5,
            borderColor: colors.primary + '30',
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginRight: 12,
        },
        infoSection: {
            flex: 1,
            marginRight: 10,
        },
        title: {
            fontSize: 15,
            fontWeight: '600' as const,
            color: colors.text,
            marginBottom: 6,
        },
        metaRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 12,
        },
        metaItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 4,
        },
        metaText: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        rightSection: {
            alignItems: 'flex-end' as const,
            gap: 8,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            paddingHorizontal: 40,
        },
        emptyIconWrapper: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.surfaceHighlight,
            borderWidth: 3,
            borderColor: colors.border,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginBottom: 20,
        },
        emptyTitle: {
            fontSize: 22,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center' as const,
            lineHeight: 20,
            marginBottom: 24,
        },
        createButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 8,
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
        },
        createButtonText: {
            fontSize: 15,
            fontWeight: '600' as const,
            color: '#FFFFFF',
        },
        footer: {
            paddingVertical: 20,
            alignItems: 'center' as const,
        },
        errorBanner: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
        },
        errorText: {
            flex: 1,
            fontSize: 13,
            color: '#EF4444',
        },
        retryText: {
            fontSize: 13,
            fontWeight: '600' as const,
            color: colors.primary,
        },
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                // Navigate to 'home' (Community) tab instead of default behavior
                router.navigate('/(main)/(tabs)/home');
                return true; // Prevent default behavior (exit/history)
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => subscription.remove();
        }, [router])
    );

    const {
        assignments,
        loading,
        refreshing,
        error,
        hasMore,
        fetchAssignments,
        refreshAssignments,
        loadMore,
    } = useAssignments();

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handlePress = useCallback((assignment: Assignment) => {
        router.push(`/(main)/assignment/${assignment.id}`);
    }, [router]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    const renderOrderCard = useCallback(({ item }: { item: Assignment }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
        >
            {/* Left Section: Icon */}
            <View style={styles.iconContainer}>
                <Ionicons
                    name={ASSIGNMENT_TYPE_ICONS[item.type] as any}
                    size={22}
                    color={colors.primary}
                />
            </View>

            {/* Middle Section: Info */}
            <View style={styles.infoSection}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="cash-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.metaText}>
                            ₹{item.budget.min.toLocaleString()} - ₹{item.budget.max.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{formatDate(item.deadline)}</Text>
                    </View>
                </View>
            </View>

            {/* Right Section: Status Badge & Arrow */}
            <View style={styles.rightSection}>
                <AssignmentStatusBadge status={item.status} size="small" />
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
        </TouchableOpacity>
    ), [handlePress, colors]); // Added colors dependency

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                    <Ionicons name="cart-outline" size={56} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptySubtitle}>
                    When you create an assignment, it will appear here as an order
                </Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/(main)/create-assignment')}
                >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create Assignment</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loading || assignments.length === 0) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const handleEndReached = () => {
        if (hasMore && !loading) {
            loadMore();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
                <Text style={styles.headerSubtitle}>
                    {assignments.length > 0
                        ? `${assignments.length} assignment${assignments.length > 1 ? 's' : ''}`
                        : 'Track your assignments'
                    }
                </Text>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchAssignments}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={assignments}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderCard}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshAssignments}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                contentContainerStyle={[
                    styles.listContent,
                    assignments.length === 0 && styles.listContentEmpty,
                ]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default OrdersListScreen;
