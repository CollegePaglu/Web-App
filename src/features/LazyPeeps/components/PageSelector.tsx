import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/context/ThemeContext';
import { PageConfig } from '../services/LazyPeepsService';

interface PageSelectorProps {
    pages: PageConfig[];
    onPageToggle: (pageNumber: number) => void;
    onModeChange: (pageNumber: number, mode: 'bw' | 'color') => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onAllBW: () => void;
    onAllColor: () => void;
    analyzing?: boolean;
}

const COLOR_PRICE = 10; // Fixed color price

export const PageSelector: React.FC<PageSelectorProps> = ({
    pages,
    onPageToggle,
    onModeChange,
    onSelectAll,
    onDeselectAll,
    onAllBW,
    onAllColor,
    analyzing,
}) => {
    const colors = useThemeColors();

    const getTierColor = useCallback((tier: 'light' | 'medium' | 'heavy') => {
        switch (tier) {
            case 'light': return '#22c55e'; // green
            case 'medium': return '#f59e0b'; // amber
            case 'heavy': return '#ef4444'; // red
        }
    }, []);

    const getTierLabel = useCallback((tier: 'light' | 'medium' | 'heavy') => {
        switch (tier) {
            case 'light': return 'Light Ink';
            case 'medium': return 'Medium';
            case 'heavy': return 'Heavy';
        }
    }, []);

    if (analyzing) {
        return (
            <View style={[styles.analyzingContainer, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.analyzingText, { color: colors.text }]}>
                    Analyzing document...
                </Text>
                <Text style={[styles.analyzingSubtext, { color: colors.textSecondary }]}>
                    Calculating ink coverage per page
                </Text>
            </View>
        );
    }

    if (pages.length === 0) {
        return null;
    }

    const selectedCount = pages.filter(p => p.selected).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    📄 {pages.length} Pages Analyzed
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {selectedCount} selected
                </Text>
            </View>

            {/* Quick Actions */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={onSelectAll}
                    >
                        <Text style={[styles.actionText, { color: colors.primary }]}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={onDeselectAll}
                    >
                        <Text style={[styles.actionText, { color: colors.textSecondary }]}>Deselect All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={onAllBW}
                    >
                        <Text style={[styles.actionText, { color: colors.text }]}>All B&W</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={onAllColor}
                    >
                        <Text style={[styles.actionText, { color: colors.primary }]}>All Color</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Page Grid */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pageGrid}
            >
                {pages.map((page) => (
                    <View
                        key={page.pageNumber}
                        style={[
                            styles.pageCard,
                            {
                                backgroundColor: colors.background,
                                borderColor: page.selected ? colors.primary : colors.border,
                                opacity: page.selected ? 1 : 0.6,
                            }
                        ]}
                    >
                        {/* Page Preview */}
                        <TouchableOpacity onPress={() => onPageToggle(page.pageNumber)}>
                            {page.previewBase64 ? (
                                <AppImage
                                    uri={`data:image/png;base64,${page.previewBase64}`}
                                    style={styles.preview}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.preview, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="document" size={32} color={colors.textSecondary} />
                                </View>
                            )}

                            {/* Page Number Badge */}
                            <View style={[styles.pageNumBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.pageNumText}>{page.pageNumber}</Text>
                            </View>

                            {/* Selection Checkbox */}
                            <View style={[styles.checkbox, { borderColor: page.selected ? colors.primary : colors.border }]}>
                                {page.selected && (
                                    <Ionicons name="checkmark" size={14} color={colors.primary} />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Ink Tier Badge */}
                        <View style={[styles.tierBadge, { backgroundColor: getTierColor(page.inkTier) + '20' }]}>
                            <Text style={[styles.tierText, { color: getTierColor(page.inkTier) }]}>
                                {getTierLabel(page.inkTier)}
                            </Text>
                        </View>

                        {/* Mode Toggle */}
                        <View style={styles.modeToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.modeBtn,
                                    page.printMode === 'bw' && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => onModeChange(page.pageNumber, 'bw')}
                            >
                                <Text style={[
                                    styles.modeBtnText,
                                    { color: page.printMode === 'bw' ? '#fff' : colors.textSecondary }
                                ]}>
                                    B&W
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modeBtn,
                                    page.printMode === 'color' && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => onModeChange(page.pageNumber, 'color')}
                            >
                                <Text style={[
                                    styles.modeBtnText,
                                    { color: page.printMode === 'color' ? '#fff' : colors.textSecondary }
                                ]}>
                                    Color
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Price */}
                        <Text style={[styles.price, { color: colors.primary }]}>
                            ₹{page.printMode === 'bw' ? page.bwPrice : COLOR_PRICE}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionsScroll: {
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    pageGrid: {
        gap: 12,
        paddingRight: 16,
    },
    pageCard: {
        width: 110,
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    preview: {
        width: 90,
        height: 120,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pageNumBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageNumText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    checkbox: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tierBadge: {
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    tierText: {
        fontSize: 10,
        fontWeight: '700',
    },
    modeToggle: {
        flexDirection: 'row',
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    modeBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    modeBtnText: {
        fontSize: 11,
        fontWeight: '600',
    },
    price: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: '800',
    },
    analyzingContainer: {
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    analyzingText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    analyzingSubtext: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default PageSelector;
