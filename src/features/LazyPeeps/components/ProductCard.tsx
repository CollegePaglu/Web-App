import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../services/LazyPeepsService';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onPress: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onPress }) => {
    const isAvailable = product.isAvailable;

    return (
        <TouchableOpacity
            style={[styles.container, !isAvailable && styles.disabledContainer]}
            onPress={() => onPress(product)}
            activeOpacity={0.9}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <AppImage
                    uri={product.image || 'https://via.placeholder.com/150'}
                    style={styles.image}
                    contentFit="cover"
                />
                {!isAvailable && (
                    <View style={styles.unavailableOverlay}>
                        <Text style={styles.unavailableText}>Unavailable</Text>
                    </View>
                )}
                {product.rating && (
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {product.name}
                    </Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {product.description}
                </Text>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.price}>₹{product.price}</Text>

                    {product.preparationTime && (
                        <View style={styles.timeContainer}>
                            <Ionicons name="alarm-outline" size={12} color="#666" />
                            <Text style={styles.timeText}>{product.preparationTime} min</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.addButton, !isAvailable && styles.disabledButton]}
                        onPress={() => isAvailable && onAdd(product)}
                        activeOpacity={0.7}
                        disabled={!isAvailable}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FCFAF8',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
        width: '48%', // Approx 2 columns
        marginHorizontal: '1%',
    },
    disabledContainer: {
        opacity: 0.8,
    },
    imageContainer: {
        height: 120,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    unavailableOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#333',
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    categoryBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
        height: 32, // Fixed height for 2 lines
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    timeText: {
        fontSize: 10,
        color: '#666',
    },
    addButton: {
        backgroundColor: '#FF6B35',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});
