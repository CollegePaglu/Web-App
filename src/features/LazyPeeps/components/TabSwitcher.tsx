import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import { TabType } from '../hooks/useLazyPeeps';

interface TabSwitcherProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    bottom?: boolean; // New prop to switch between header/bottom styles
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange, bottom = false }) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();

    if (bottom) {
        // Bottom navbar style
        return (
            <View style={[styles.bottomContainer, {
                backgroundColor: colors.surface,
                borderTopColor: colors.border
            }]}>
                <TouchableOpacity
                    style={styles.bottomTab}
                    onPress={() => onTabChange('printouts')}
                >
                    <Ionicons
                        name={activeTab === 'printouts' ? 'print' : 'print-outline'}
                        size={22}
                        color={activeTab === 'printouts' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                        styles.bottomTabText,
                        { color: activeTab === 'printouts' ? colors.primary : colors.textSecondary }
                    ]}>
                        Printouts
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomTab}
                    onPress={() => onTabChange('snaks')}
                >
                    <Ionicons
                        name={activeTab === 'snaks' ? 'bag' : 'bag-outline'}
                        size={22}
                        color={activeTab === 'snaks' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                        styles.bottomTabText,
                        { color: activeTab === 'snaks' ? colors.primary : colors.textSecondary }
                    ]}>
                        Snacks
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomTab}
                    onPress={() => onTabChange('orders')}
                >
                    <Ionicons
                        name={activeTab === 'orders' ? 'time' : 'time-outline'}
                        size={22}
                        color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                        styles.bottomTabText,
                        { color: activeTab === 'orders' ? colors.primary : colors.textSecondary }
                    ]}>
                        Orders
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Original header style (kept for backwards compatibility)
    return (
        <View style={[styles.container, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
        }]}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'printouts' && styles.activeTab]}
                onPress={() => onTabChange('printouts')}
            >
                <Ionicons name="print" size={20} color={activeTab === 'printouts' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.tabText, activeTab === 'printouts' && styles.activeTabText]}>
                    Printouts
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'snaks' && styles.activeTab]}
                onPress={() => onTabChange('snaks')}
            >
                <Ionicons name="bag" size={20} color={activeTab === 'snaks' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.tabText, activeTab === 'snaks' && styles.activeTabText]}>
                    Snacks
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
                onPress={() => onTabChange('orders')}
            >
                <Ionicons name="time" size={20} color={activeTab === 'orders' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
                    Orders
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // Header style (existing)
    container: {
        flexDirection: 'row',
        padding: 4,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Bottom navbar style
    bottomContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    bottomTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    bottomTabText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
