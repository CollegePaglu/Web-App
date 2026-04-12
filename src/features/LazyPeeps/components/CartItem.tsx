import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../services/LazyPeepsService';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    const product = item.productId;
    const itemTotal = product.price * item.quantity;

    return (
        <View style={styles.container}>
            {/* Product Image */}
            <AppImage
                uri={product.image || 'https://via.placeholder.com/80'}
                style={styles.image}
                contentFit="cover"
            />

            {/* Product Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.price}>₹{product.price}</Text>
            </View>

            {/* Quantity Controls */}
            <View style={styles.controls}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                            if (item.quantity > 1) {
                                onUpdateQuantity(item._id, item.quantity - 1);
                            } else {
                                onRemove(item._id);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        {item.quantity === 1 ? (
                            <Ionicons name="trash" size={16} color="#FF6B35" />
                        ) : (
                            <Ionicons name="remove-circle" size={16} color="#FF6B35" />
                        )}
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-circle" size={16} color="#FF6B35" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.total}>₹{itemTotal}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FCFAF8',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#666',
    },
    controls: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FCFAF8',
        borderRadius: 6,
    },
    quantity: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        minWidth: 20,
        textAlign: 'center',
    },
    total: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
        marginTop: 8,
    },
});
