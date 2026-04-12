import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../services/LazyPeepsService';
import { useThemeColors } from '@/context/ThemeContext';

interface ProductDetailSheetProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
    visible,
    product,
    onClose,
    onAddToCart
}) => {
    const [quantity, setQuantity] = useState(1);
    const { width } = Dimensions.get('window');
    const colors = useThemeColors();

    if (!product) return null;

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        setQuantity(1); // Reset for next time
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header Image */}
                    <View style={styles.imageContainer}>
                        <AppImage
                            uri={product.image || 'https://via.placeholder.com/400'}
                            style={styles.image}
                            contentFit="cover"
                        />
                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                { backgroundColor: colors.background === '#000000' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }
                            ]}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <View>
                                <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
                                <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>
                            </View>
                            <Text style={[styles.price, { color: colors.primary }]}>₹{product.price}</Text>
                        </View>

                        <View style={styles.metaInfo}>
                            {product.preparationTime && (
                                <View style={[styles.metaItem, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="alarm-outline" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{product.preparationTime} min</Text>
                                </View>
                            )}
                            {product.rating && (
                                <View style={[styles.metaItem, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="star" size={16} color="#FFD700" />
                                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{product.rating.toFixed(1)}</Text>
                                </View>
                            )}
                            <View style={[
                                styles.statusBadge,
                                !product.isAvailable && styles.unavailableBadge,
                                { backgroundColor: product.isAvailable ? colors.surfaceHighlight : undefined }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    !product.isAvailable && styles.unavailableText,
                                    { color: product.isAvailable ? colors.primary : undefined }
                                ]}>
                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {product.description || 'No description available for this delicious item.'}
                        </Text>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={[styles.footer, {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border
                    }]}>
                        <View style={[styles.quantityControl, { backgroundColor: colors.surfaceHighlight }]}>
                            <TouchableOpacity
                                style={[styles.qtyButton, { backgroundColor: colors.surface }]}
                                onPress={handleDecrement}
                            >
                                <Ionicons name="remove" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.qtyButton, { backgroundColor: colors.surface }]}
                                onPress={handleIncrement}
                            >
                                <Ionicons name="add" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                !product.isAvailable && [styles.disabledButton, { backgroundColor: colors.muted }],
                                { backgroundColor: product.isAvailable ? colors.primary : colors.muted }
                            ]}
                            onPress={handleAddToCart}
                            disabled={!product.isAvailable}
                        >
                            <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>
                                Add Item - ₹{product.price * quantity}
                            </Text>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        overflow: 'hidden',
    },
    imageContainer: {
        height: 250,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
        maxWidth: 250,
    },
    category: {
        fontSize: 14,
        fontWeight: '500',
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
    },
    metaInfo: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    unavailableBadge: {
        backgroundColor: '#ffebee',
    },
    unavailableText: {
        color: '#c62828',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        paddingBottom: 40,
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 4,
    },
    qtyButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        elevation: 1,
    },
    qtyText: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 16,
    },
    addButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.7,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
