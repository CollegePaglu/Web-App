import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';

interface CartSheetProps {
    visible: boolean;
    onClose: () => void;
    onCheckout: () => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ visible, onClose, onCheckout }) => {
    const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
    const [actionLoading, setActionLoading] = useState(false);

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        try {
            setActionLoading(true);
            await updateQuantity(itemId, quantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            setActionLoading(true);
            await removeItem(itemId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearCart = async () => {
        try {
            setActionLoading(true);
            await clearCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckout = () => {
        onClose();
        onCheckout();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="bag" size={24} color="#333" />
                            <Text style={styles.title}>My Cart</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Cart Items */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                        </View>
                    ) : cart.items.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bag" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>Your cart is empty</Text>
                            <Text style={styles.emptySubtext}>
                                Add some delicious items to get started!
                            </Text>
                        </View>
                    ) : (
                        <>
                            <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
                                {cart.items.map((item) => (
                                    <CartItem
                                        key={item._id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                ))}
                            </ScrollView>

                            {/* Footer */}
                            <View style={styles.footer}>
                                {/* Clear Cart Button */}
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={handleClearCart}
                                    disabled={actionLoading}
                                >
                                    <Text style={styles.clearButtonText}>Clear Cart</Text>
                                </TouchableOpacity>

                                {/* Total and Checkout */}
                                <View style={styles.totalContainer}>
                                    <View>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <Text style={styles.totalAmount}>₹{cart.totalAmount}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.checkoutButton}
                                        onPress={handleCheckout}
                                        disabled={actionLoading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.checkoutButtonText}>Checkout</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#ffffff', // Elevated surface - sheet/modal
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    itemsContainer: {
        padding: 16,
        maxHeight: 400,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    clearButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    clearButtonText: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '600',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    checkoutButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
