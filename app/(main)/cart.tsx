/**
 * Cart Screen
 * 
 * Full-screen cart view for LazyPeeps
 * Shows snack items and printouts with checkout functionality
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { useVendorCart } from '@/features/LazyPeeps/context/VendorCartContext';
import { VendorCheckoutSheet } from '@/features/LazyPeeps/components/VendorCheckoutSheet';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const {
        cart,
        cartCount,
        loading,
        updateQuantity,
        removeFromCart,
        removePrintoutFromCart,
        clearCart,
    } = useVendorCart();

    const [checkoutVisible, setCheckoutVisible] = useState(false);

    const handleIncrement = async (productId: string, currentQty: number) => {
        try {
            await updateQuantity(productId, currentQty + 1);
        } catch (err) {
            console.error('Failed to increment:', err);
        }
    };

    const handleDecrement = async (productId: string, currentQty: number) => {
        try {
            if (currentQty <= 1) {
                await removeFromCart(productId);
            } else {
                await updateQuantity(productId, currentQty - 1);
            }
        } catch (err) {
            console.error('Failed to decrement:', err);
        }
    };

    const handleRemoveItem = async (productId: string) => {
        Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeFromCart(productId);
                    } catch (err) {
                        console.error('Failed to remove:', err);
                    }
                },
            },
        ]);
    };

    const handleRemovePrintout = (printoutId: string) => {
        Alert.alert('Remove Printout', 'Are you sure you want to remove this printout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    try {
                        removePrintoutFromCart(printoutId);
                    } catch (err) {
                        console.error('Failed to remove printout:', err);
                    }
                },
            },
        ]);
    };

    const handleClearCart = () => {
        Alert.alert('Clear Cart', 'Are you sure you want to clear your entire cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await clearCart();
                },
            },
        ]);
    };

    const handleCheckoutPress = () => {
        if (cartCount === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart first.');
            return;
        }
        setCheckoutVisible(true);
    };

    const isEmpty = cart.items.length === 0 && (!cart.printouts || cart.printouts.length === 0);

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Your Cart',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () =>
                        cartCount > 0 ? (
                            <TouchableOpacity onPress={handleClearCart} style={{ marginRight: 16 }}>
                                <Text style={{ color: colors.destructive, fontSize: 14 }}>Clear</Text>
                            </TouchableOpacity>
                        ) : null,
                }}
            />

            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={80} color={colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Add snacks or printouts to get started
                        </Text>
                        <TouchableOpacity
                            style={[styles.browseButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.browseButtonText}>Browse Items</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={{ paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Snack Items */}
                            {cart.items.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        🍔 Snacks ({cart.items.length})
                                    </Text>
                                    {cart.items.map((item) => (
                                        <View
                                            key={item.productId}
                                            style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        >
                                            {item.image && (
                                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                            )}
                                            <View style={styles.itemInfo}>
                                                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                                    {item.productName}
                                                </Text>
                                                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                                    ₹{item.price} each
                                                </Text>
                                            </View>
                                            <View style={styles.quantityContainer}>
                                                <TouchableOpacity
                                                    style={[styles.qtyButton, { backgroundColor: colors.surfaceHighlight }]}
                                                    onPress={() => handleDecrement(item.productId, item.quantity)}
                                                >
                                                    <Ionicons name="remove" size={18} color={colors.text} />
                                                </TouchableOpacity>
                                                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={[styles.qtyButton, { backgroundColor: colors.primary }]}
                                                    onPress={() => handleIncrement(item.productId, item.quantity)}
                                                >
                                                    <Ionicons name="add" size={18} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleRemoveItem(item.productId)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Printouts */}
                            {cart.printouts && cart.printouts.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        🖨️ Printouts ({cart.printouts.length})
                                    </Text>
                                    {cart.printouts.map((printout) => (
                                        <View
                                            key={printout.id}
                                            style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        >
                                            <View style={[styles.printoutIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                                <Ionicons name="document-text" size={24} color={colors.primary} />
                                            </View>
                                            <View style={styles.itemInfo}>
                                                <Text style={[styles.itemName, { color: colors.text }]}>Printout</Text>
                                                <Text style={[styles.printoutDetails, { color: colors.textSecondary }]}>
                                                    {printout.config.bwPages} B&W, {printout.config.colorPages} Color
                                                    {printout.config.binding ? ', Binding' : ''}
                                                </Text>
                                            </View>
                                            <Text style={[styles.itemTotal, { color: colors.primary }]}>
                                                ₹{printout.totalCost}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleRemovePrintout(printout.id)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>

                        {/* Checkout Footer */}
                        <View
                            style={[
                                styles.footer,
                                {
                                    backgroundColor: colors.surface,
                                    borderTopColor: colors.border,
                                    paddingBottom: insets.bottom + 16,
                                },
                            ]}
                        >
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                                <Text style={[styles.totalAmount, { color: colors.text }]}>₹{cart.totalAmount}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.checkoutButton,
                                    { backgroundColor: colors.primary },
                                    loading && { opacity: 0.7 },
                                ]}
                                onPress={handleCheckoutPress}
                                disabled={loading}
                            >
                                <Ionicons name="card-outline" size={20} color="#FFF" />
                                <Text style={styles.checkoutButtonText}>Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Razorpay Checkout Sheet */}
                <VendorCheckoutSheet 
                    visible={checkoutVisible} 
                    onClose={() => setCheckoutVisible(false)} 
                    onSuccess={(orderId) => {
                        setCheckoutVisible(false);
                        // Navigate to orders or home
                        router.replace('/(main)/(tabs)/lazzypeeps');
                    }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    browseButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    printoutIcon: {
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 13,
        marginTop: 2,
    },
    printoutDetails: {
        fontSize: 12,
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: '700',
        marginRight: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 10,
    },
    deleteButton: {
        padding: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 14,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '800',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
