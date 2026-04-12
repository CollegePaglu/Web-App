import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useLazyPeeps } from './hooks/useLazyPeeps';
import { useVendorCart } from './context/VendorCartContext';
import { VendorCheckoutSheet } from './components/VendorCheckoutSheet';

import { TabSwitcher } from './components/TabSwitcher';
import { PrintoutService } from './components/PrintoutService';
import { SnackService } from './components/SnackService';
import { OrderService } from './components/OrderService';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

export const LazyPeepsView = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colors = useThemeColors();
    const { isDark } = useTheme();

    // Hook for main logic
    const {
        activeTab,
        handleTabChange,
        selectedFile,
        handleFilePick,
        printConfig,
        handlePrintConfigChange,
        handleOrderPrintout,
        loading,
        uploading,
        // Page analysis
        analyzing,
        pageConfigs,
        analysisError,
        handlePageToggle,
        handlePageModeChange,
        handleSelectAllPages,
        handleDeselectAllPages,
        handleAllBW,
        handleAllColor,
        calculateTotalFromPages,
    } = useLazyPeeps({
        onPrintoutAdded: () => router.push('/(main)/cart')
    });

    // Cart State Management
    const { cartCount, addToCart, clearCart } = useVendorCart();
    const [checkoutVisible, setCheckoutVisible] = useState(false);

    const handleOpenCart = () => {
        router.push('/(main)/cart');
    };

    const handleOrderSuccess = async (orderId: string) => {
        await clearCart();
        setCheckoutVisible(false);
        Alert.alert('🎉 Order Placed!', `Your order #${orderId.slice(-6)} has been placed successfully!`);
        // Optional: Switch to Orders tab
        handleTabChange('orders');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'printouts':
                return (
                    <PrintoutService
                        selectedFile={selectedFile}
                        onFilePick={handleFilePick}
                        config={printConfig}
                        onConfigChange={handlePrintConfigChange}
                        onOrder={handleOrderPrintout}
                        loading={loading}
                        uploading={uploading}
                        // Page analysis props
                        analyzing={analyzing}
                        pageConfigs={pageConfigs}
                        analysisError={analysisError}
                        onPageToggle={handlePageToggle}
                        onPageModeChange={handlePageModeChange}
                        onSelectAll={handleSelectAllPages}
                        onDeselectAll={handleDeselectAllPages}
                        onAllBW={handleAllBW}
                        onAllColor={handleAllColor}
                        calculatedTotal={calculateTotalFromPages()}
                    />
                );
            case 'snaks':
                return <SnackService onAddToCart={addToCart} />;
            case 'orders':
                return <OrderService />;
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Ambience - Only show light gradient in light mode */}
            {!isDark && (
                <LinearGradient
                    colors={['#F0F2EF', '#FAFBF9', '#FFFFFF']}
                    style={StyleSheet.absoluteFillObject}
                />
            )}

            {!isDark && (
                <>
                    <View style={[styles.glow, { top: -100, left: -50, backgroundColor: 'rgba(75, 84, 68, 0.03)' }]} />
                    <View style={[styles.glow, { bottom: -100, right: -50, backgroundColor: 'rgba(198, 203, 194, 0.04)' }]} />
                </>
            )}

            {/* Header - Simplified without tabs */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top,
                    backgroundColor: isDark ? colors.surface : colors.primary,
                    borderBottomColor: colors.border,
                    shadowColor: colors.borderHighlight
                }
            ]} >
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={() => router.navigate('/(main)/(tabs)/home')}
                        style={[styles.iconBtn, { backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(255, 255, 255, 0.15)' }]}
                    >
                        <Ionicons name="arrow-back" size={22} color={isDark ? colors.text : '#FFFFFF'} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: isDark ? colors.text : '#FFFFFF' }]}>LazyPeeps</Text>

                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(255, 255, 255, 0.15)' }]}
                        onPress={handleOpenCart}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="cart" size={24} color={isDark ? colors.text : "#FFFFFF"} />
                        {cartCount > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderContent()}
            </View>

            {/* Bottom Tab Navigator */}
            <View style={{ paddingBottom: insets.bottom }}>
                <TabSwitcher
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    bottom={true}
                />
            </View>

            <VendorCheckoutSheet
                visible={checkoutVisible}
                onClose={() => setCheckoutVisible(false)}
                onSuccess={handleOrderSuccess}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.4,
    },
    header: {
        paddingBottom: 12,
        borderBottomWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
});
