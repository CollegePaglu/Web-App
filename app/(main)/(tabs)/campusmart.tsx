import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { AssignmentsListScreen, OrdersListScreen } from '@/features/campusmart/screens';
import { useThemeColors } from '@/context/ThemeContext';

export default function CampusmartScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'assignments' | 'orders'>('assignments');
    const colors = useThemeColors();

    const handleExit = () => {
        // Go back to Home or Lazzypeeps when exiting Campusmart context
        router.navigate('/(main)/(tabs)/home');
    };

    // Hardware back = go to Home (consistent with UI back button)
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.navigate('/(main)/(tabs)/home');
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    const containerStyle = {
        paddingTop: insets.top,
        backgroundColor: colors.background,
    };

    const headerStyle = {
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        shadowColor: colors.borderHighlight,
    };

    const bottomBarStyle = {
        paddingBottom: insets.bottom + 8,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        shadowColor: colors.borderHighlight, // Better shadow for dark mode
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Header */}
            <View style={[styles.header, headerStyle]}>
                <TouchableOpacity onPress={handleExit} style={[styles.backButton, { backgroundColor: colors.surfaceHighlight }]}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>CampusMart</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {activeTab === 'assignments' ? <AssignmentsListScreen /> : <OrdersListScreen />}
            </View>

            {/* Local Bottom Navigation Bar */}
            <View style={[styles.bottomBar, bottomBarStyle]}>
                {/* Assignments Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('assignments')}
                >
                    <Ionicons
                        name={activeTab === 'assignments' ? "document-text" : "document-text-outline"}
                        size={24}
                        color={activeTab === 'assignments' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                        styles.tabLabel,
                        { color: activeTab === 'assignments' ? colors.primary : colors.textSecondary }
                    ]}>
                        Assignments
                    </Text>
                </TouchableOpacity>

                {/* Orders Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab('orders')}
                >
                    <Ionicons
                        name={activeTab === 'orders' ? "bag-handle" : "bag-handle-outline"}
                        size={24}
                        color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                        styles.tabLabel,
                        { color: activeTab === 'orders' ? colors.primary : colors.textSecondary }
                    ]}>
                        Orders
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    content: {
        flex: 1,
    },
    tabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        marginTop: 12,
    },
    // Local Bottom Navigation Styles
    bottomBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 12,
        height: 80,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 13,
        marginTop: 6,
        fontWeight: '600',
    },
});
