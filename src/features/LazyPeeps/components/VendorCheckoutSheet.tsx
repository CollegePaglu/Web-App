import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVendorCart } from '../hooks/useVendorCart';
import { LazyPeepsService } from '../services/LazyPeepsService';
import RazorpayCheckout from 'react-native-razorpay';

interface VendorCheckoutSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (orderId: string) => void;
}

export const VendorCheckoutSheet: React.FC<VendorCheckoutSheetProps> = ({ visible, onClose, onSuccess }) => {
    const { cart, clearCart } = useVendorCart();
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            Alert.alert('Error', 'Please enter a delivery address');
            return;
        }

        if (!cart.vendorId) {
            Alert.alert('Error', 'No vendor selected. Please go back and select items from a vendor.');
            return;
        }

        if (cart.items.length === 0) {
            Alert.alert('Error', 'Cart is empty');
            return;
        }

        try {
            setLoading(true);
            console.log('🛒 Checkout flow:', {
                vendorId: cart.vendorId,
                itemsCount: cart.items.length,
                totalAmount: cart.totalAmount,
                deliveryAddress,
            });

            // Step 1: Create transaction & order via checkout endpoint
            console.log('💳 Step 1: Creating transaction & order...');
            const checkoutResponse = await LazyPeepsService.checkout(cart.items, deliveryAddress, notes);
            
            // The service returns { order, paymentSession }
            const { order, paymentSession } = checkoutResponse;
            const transactionId = order._id; // Using Order ID as reference for verification
            
            console.log('✅ Order created:', order._id);
            console.log('✅ Payment Session:', paymentSession);

            if (!paymentSession || !paymentSession.id) {
                throw new Error('Failed to initiate payment session');
            }

            // Razorpay options
            const options = {
                description: `Order #${order.orderNumber}`,
                image: 'https://bukkish.com/assets/images/logo.png',
                currency: paymentSession.currency || 'INR',
                key: paymentSession.key, 
                amount: paymentSession.amount,
                name: 'LazyPeeps',
                order_id: paymentSession.id, // Razorpay Order ID
                prefill: {
                    email: 'user@example.com', // Could fetch from user profile
                    contact: '9999999999',
                    name: 'User'
                },
                theme: { color: '#FF6B35' }
            };

            // Step 2: Open Razorpay
            console.log('💰 Step 2: Opening Razorpay...');
            const data = await RazorpayCheckout.open(options);
            console.log('✔️ Payment success:', data);

            // Step 3: Verify payment
            console.log('✔️ Step 3: Verifying payment...');
            // verification expects (transactionId, paymentId, signature)
            // We pass order._id as transactionId because verifyPayment looks up by orderId/razorpay.orderId
            const isPaymentVerified = await LazyPeepsService.verifyPayment(
                paymentSession.id, // Use Razorpay Order ID for verification lookup
                data.razorpay_payment_id,
                data.razorpay_signature
            );

            if (!isPaymentVerified) {
                throw new Error('Payment verification failed');
            }
            console.log('✅ Payment verified');

            // Order is already placed and confirmed by verifyPayment
            
            // Clear cart after successful order
            try {
                await clearCart();
            } catch (clearError) {
                console.warn('Could not clear cart, but order was placed:', clearError);
            }

            onClose();

            // Show success alert
            Alert.alert(
                'Order Placed Successfully! 🎉',
                `Order #${order.orderNumber}\nTotal: ₹${order.totalAmount}\n\nDelivery Address: ${deliveryAddress}`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setDeliveryAddress('');
                        setNotes('');
                        onSuccess(order._id);
                    }
                }]
            );
        } catch (error: any) {
            console.error('❌ Checkout failed:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Checkout failed. Please try again.';
            Alert.alert('Checkout Failed', errorMessage);
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.title}>Checkout</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Delivery Address */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location" size={20} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Delivery Address</Text>
                            </View>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter your delivery address (e.g., Room 301, Hostel A)"
                                value={deliveryAddress}
                                onChangeText={setDeliveryAddress}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Order Notes */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="document-text" size={20} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
                            </View>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Any special instructions? (e.g., Extra spicy, No onions)"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Order Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items ({cart.items.length})</Text>
                                <Text style={styles.summaryValue}>₹{cart.totalAmount}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                <Text style={styles.summaryValue}>Free</Text>
                            </View>
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹{cart.totalAmount}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                            onPress={handlePlaceOrder}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.placeOrderButtonText}>Place Order</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    textArea: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#333',
        minHeight: 80,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    placeOrderButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
