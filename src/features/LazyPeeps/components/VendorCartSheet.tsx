import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVendorCart, VendorCartItem, PrintoutItem } from '../hooks/useVendorCart';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VendorCartSheetProps {
    visible: boolean;
    onClose: () => void;
    onCheckout: () => void;
}

export const VendorCartSheet: React.FC<VendorCartSheetProps> = ({
    visible,
    onClose,
    onCheckout,
}) => {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { isDark } = useTheme();

    const {
        cart,
        loading,
        updateQuantity,
        removeFromCart,
        removePrintoutFromCart,
        clearCart
    } = useVendorCart();

    const [actionLoading, setActionLoading] = useState(false);

    // Calculate snap points
    // Collapsed: ~50% of screen
    // Expanded: ~90% of screen (leaving top margin)
    const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
    const MIN_HEIGHT = SCREEN_HEIGHT * 0.5;
    const MIN_TRANSLATE_Y = SCREEN_HEIGHT - MAX_HEIGHT;
    const MAX_TRANSLATE_Y = SCREEN_HEIGHT - MIN_HEIGHT;

    // Animated value for vertical translation
    // Initial state is off-screen (SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });

    const hasItems = cart.items.length > 0;
    const hasPrintouts = cart.printouts && cart.printouts.length > 0;
    const isEmpty = !hasItems && !hasPrintouts;

    // Effect to open/close sheet
    useEffect(() => {
        if (visible) {
            // Open to default (collapsed) state
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 15 });
        } else {
            // Close sheet (slide down)
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        }
    }, [visible, MAX_TRANSLATE_Y]);

    // Pan Gesture
    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = Math.max(MIN_TRANSLATE_Y, context.value.y + event.translationY);
        })
        .onEnd(() => {
            // Snap logic
            if (translateY.value < (MIN_TRANSLATE_Y + MAX_TRANSLATE_Y) / 2) {
                // Snap to top (expanded)
                translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 15 });
            } else if (translateY.value > SCREEN_HEIGHT * 0.75) {
                // Dragged down significantly -> Close
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
                    if (finished) runOnJS(onClose)();
                });
            } else {
                // Snap to default (collapsed)
                translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 15 });
            }
        });

    // Animated styles
    const sheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [SCREEN_HEIGHT, MAX_TRANSLATE_Y],
            [0, 0.5],
            Extrapolate.CLAMP
        );
        return {
            opacity,
        };
    });

    // ... (Existing handlers: handleUpdateQuantity, handleRemoveItem, etc. - unchanged)
    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) {
            await handleRemoveItem(productId);
            return;
        }
        try {
            setActionLoading(true);
            await updateQuantity(productId, quantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            Alert.alert('Error', 'Failed to update quantity');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            setActionLoading(true);
            await removeFromCart(productId);
        } catch (error) {
            console.error('Failed to remove item:', error);
            Alert.alert('Error', 'Failed to remove item');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemovePrintout = async (printoutId: string) => {
        try {
            setActionLoading(true);
            await removePrintoutFromCart(printoutId);
        } catch (error) {
            console.error('Failed to remove printout:', error);
            Alert.alert('Error', 'Failed to remove printout');
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearCart = async () => {
        Alert.alert('Clear Cart', 'Are you sure you want to remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        await clearCart();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to clear cart');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    // Dynamic Styles
    const styles = {
        sheetContainer: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            height: SCREEN_HEIGHT, // Full height container, translated down
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
        },
        handle: {
            width: 40,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: isDark ? colors.borderHighlight : '#e0e0e0'
        },
        title: {
            fontSize: 24,
            fontWeight: '800' as const,
            color: colors.text,
            letterSpacing: -0.5
        },
        closeButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: colors.surfaceHighlight
        },
        divider: {
            height: 1,
            backgroundColor: colors.border
        },

        // Empty State
        emptyIconWrapper: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : '#FFF4ED',
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginBottom: 20
        },
        emptyText: {
            fontSize: 22,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 8
        },
        emptySubtext: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 32,
            textAlign: 'center' as const
        },

        // Sections
        sectionHeader: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 12,
            marginLeft: 8
        },

        // Cart Item
        cartItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingVertical: 12,
            paddingHorizontal: 8,
            gap: 12,
            backgroundColor: colors.surface,
            marginBottom: 8,
        },
        imageWrapper: {
            width: 60,
            height: 60,
            borderRadius: 12,
            overflow: 'hidden' as const,
            backgroundColor: colors.surfaceHighlight
        },

        itemName: {
            fontSize: 15,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 4
        },
        itemPrice: {
            fontSize: 13,
            color: colors.primary,
            fontWeight: '600' as const
        },
        itemSubtext: {
            fontSize: 12,
            color: colors.textSecondary
        },

        quantityControlWrapper: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 4,
            gap: 4
        },
        quantity: {
            fontSize: 15,
            fontWeight: '700' as const,
            color: colors.text,
            minWidth: 28,
            textAlign: 'center' as const
        },

        itemTotal: {
            fontSize: 15,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 8
        },

        // Footer
        footer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border
        },
        clearButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : '#FFF4ED',
            gap: 8
        },
        totalLabel: {
            fontSize: 16,
            fontWeight: '700' as const,
            color: colors.text
        },
        totalValue: {
            fontSize: 20,
            fontWeight: '800' as const,
            color: colors.primary
        },
    };

    const baseStyles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        handleBar: {
            paddingVertical: 12,
            alignItems: 'center',
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 16,
        },
        itemCountBadge: {
            backgroundColor: '#FF6B35',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginLeft: 8,
        },
        itemCount: {
            color: '#fff',
            fontWeight: '600',
            fontSize: 14,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        continueShopping: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: '#FF6B35',
        },
        continueShoppingText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
        itemsList: {
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        sectionContainer: {
            marginBottom: 20,
        },
        itemImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        imagePlaceholder: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemDetails: {
            flex: 1,
        },
        qtyButton: {
            padding: 4,
        },
        rowRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
        },
        removeButton: {
            padding: 4,
        },
        clearButtonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        checkoutButton: {
            borderRadius: 16,
            overflow: 'hidden',
        },
        checkoutGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 16,
        },
        checkoutButtonText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: '700',
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        summary: {
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalRow: {
            marginTop: 8,
        },
    });

    const summaryGradient = isDark ? [colors.surfaceHighlight, colors.surface] : ['#f8f9fa', '#ffffff'];

    // ... (Render Helpers: renderSnackItem, renderPrintoutItem, renderFooter - unchanged)
    const renderSnackItem = (item: VendorCartItem) => (
        <View key={item.productId} style={styles.cartItem}>
            <View style={styles.imageWrapper}>
                {item.image ? (
                    <AppImage uri={item.image} style={baseStyles.itemImage} contentFit="cover" />
                ) : (
                    <View style={[baseStyles.itemImage, baseStyles.imagePlaceholder]}>
                        <Ionicons name="fast-food" size={24} color={colors.primary} />
                    </View>
                )}
            </View>
            <View style={baseStyles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(0)}</Text>
            </View>
            <View style={styles.quantityControlWrapper}>
                <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    disabled={actionLoading}
                    style={baseStyles.qtyButton}
                >
                    <Ionicons name="remove" size={16} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={actionLoading}
                    style={baseStyles.qtyButton}
                >
                    <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
            <View style={baseStyles.rowRight}>
                <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                <TouchableOpacity
                    onPress={() => handleRemoveItem(item.productId)}
                    disabled={actionLoading}
                    style={baseStyles.removeButton}
                >
                    <Ionicons name="close-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderPrintoutItem = (item: PrintoutItem) => (
        <View key={item.id} style={styles.cartItem}>
            <View style={[styles.imageWrapper, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9' }]}>
                <View style={[baseStyles.itemImage, baseStyles.imagePlaceholder]}>
                    <Ionicons name="document-text" size={24} color="#4CAF50" />
                </View>
            </View>
            <View style={baseStyles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>Printout Request</Text>
                <Text style={styles.itemSubtext}>
                    {item.config.bwPages} B&W, {item.config.colorPages} Color
                    {item.config.binding ? ' + Binding' : ''}
                </Text>
            </View>
            <View style={baseStyles.rowRight}>
                <Text style={styles.itemTotal}>₹{item.totalCost}</Text>
                <TouchableOpacity
                    onPress={() => handleRemovePrintout(item.id)}
                    disabled={actionLoading}
                    style={baseStyles.removeButton}
                >
                    <Ionicons name="close-circle" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCart}
                disabled={actionLoading || loading || isEmpty}
            >
                <Ionicons name="trash-outline" size={18} color={isEmpty ? colors.textTertiary : colors.primary} />
                <Text style={[baseStyles.clearButtonText, { color: isEmpty ? colors.textTertiary : colors.primary }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[baseStyles.checkoutButton, (actionLoading || loading || isEmpty) && baseStyles.buttonDisabled]}
                onPress={onCheckout}
                disabled={actionLoading || loading || isEmpty}
            >
                <LinearGradient
                    colors={isEmpty ? (isDark ? [colors.surfaceHighlight, colors.surfaceHighlight] : ['#e0e0e0', '#e0e0e0']) : ['#FF6B35', '#E55A24']}
                    style={baseStyles.checkoutGradient}
                >
                    {actionLoading || loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={baseStyles.checkoutButtonText}>Proceed to Checkout</Text>
                            {!isEmpty && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />}
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
            <View style={baseStyles.modalContainer}>
                {/* Backdrop Layer */}
                <Animated.View style={[baseStyles.backdrop, backdropStyle]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                {/* Draggable Sheet */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.sheetContainer, sheetStyle, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
                        {/* Handle Bar Area - Main drag handle */}
                        <View style={baseStyles.handleBar}>
                            <View style={styles.handle} />
                        </View>

                        {/* Content Area */}
                        {/* Flex 1 to ensure it takes remaining height */}
                        <View style={{ flex: 1 }}>
                            {/* Header */}
                            <View style={baseStyles.header}>
                                <Text style={styles.title}>Your Cart</Text>
                                {!isEmpty && (
                                    <View style={baseStyles.itemCountBadge}>
                                        <Text style={baseStyles.itemCount}>
                                            {cart.items.length + (cart.printouts?.length || 0)}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={26} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            {isEmpty ? (
                                <View style={baseStyles.emptyContainer}>
                                    <View style={styles.emptyIconWrapper}>
                                        <Ionicons name="cart-outline" size={72} color={colors.primary} />
                                    </View>
                                    <Text style={styles.emptyText}>Cart is Empty</Text>
                                    <Text style={styles.emptySubtext}>Add some delicious items or printouts.</Text>
                                    <TouchableOpacity style={baseStyles.continueShopping} onPress={onClose}>
                                        <Text style={baseStyles.continueShoppingText}>Continue Shopping</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <ScrollView style={baseStyles.itemsList} showsVerticalScrollIndicator={false}>
                                        {hasItems && (
                                            <View style={baseStyles.sectionContainer}>
                                                <Text style={styles.sectionHeader}>Snacks & Food</Text>
                                                {cart.items.map(renderSnackItem)}
                                            </View>
                                        )}
                                        {hasItems && hasPrintouts && <View style={styles.divider} />}
                                        {hasPrintouts && (
                                            <View style={baseStyles.sectionContainer}>
                                                <Text style={styles.sectionHeader}>Printouts</Text>
                                                {cart.printouts?.map(renderPrintoutItem)}
                                            </View>
                                        )}
                                        {/* Spacer */}
                                        <View style={{ height: 100 }} />
                                    </ScrollView>

                                    <View style={styles.divider} />

                                    <LinearGradient colors={summaryGradient as any} style={baseStyles.summary}>
                                        <View style={[baseStyles.summaryRow, baseStyles.totalRow]}>
                                            <Text style={styles.totalLabel}>Total Amount</Text>
                                            <Text style={styles.totalValue}>₹{cart.totalAmount.toFixed(0)}</Text>
                                        </View>
                                    </LinearGradient>
                                </>
                            )}

                            {!isEmpty && renderFooter()}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
};
