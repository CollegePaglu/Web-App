import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVendorCart } from '../context/VendorCartContext';

interface CartButtonProps {
    onPress: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ onPress }) => {
    const { cartCount } = useVendorCart();

    if (cartCount === 0) return null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="cart" size={24} color="#fff" />
                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {cartCount > 99 ? '99+' : cartCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#FF6B35',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FCFAF8',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    badgeText: {
        color: '#FF6B35',
        fontSize: 12,
        fontWeight: '700',
    },
});
