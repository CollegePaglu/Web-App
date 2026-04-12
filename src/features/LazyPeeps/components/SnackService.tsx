import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLazyPeeps } from '../hooks/useLazyPeeps';
import { useVendorCart } from '../hooks/useVendorCart';
import { ProductCard } from './ProductCard';
import { VendorCartSheet } from './VendorCartSheet';
import { VendorCheckoutSheet } from './VendorCheckoutSheet';
import { ProductDetailSheet } from './ProductDetailSheet';
import { Product } from '../services/LazyPeepsService';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

interface SnackServiceProps {
    onAddToCart: (product: Product, quantity: number) => Promise<any>;
}

export const SnackService: React.FC<SnackServiceProps> = ({ onAddToCart }) => {
    // Hooks
    const {
        products,
        categories,
        searchQuery,
        selectedCategory,
        handleSearch,
        handleCategorySelect,
        handleRefresh,
        refreshing,
        loading
    } = useLazyPeeps();

    const colors = useThemeColors();
    const { isDark } = useTheme();

    // Local State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // Handlers
    const handleAddToCart = async (product: Product, quantity: number = 1) => {
        try {
            await onAddToCart(product, quantity);
            Alert.alert('✅ Added to Cart', `${product.name} added successfully`);
        } catch (error: any) {
            Alert.alert('❌ Error', error.message || 'Failed to add to cart');
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    // Dynamic Styles
    const dynamicStyles = {
        container: {
            backgroundColor: colors.background,
        },
        centerContainer: {
            backgroundColor: colors.background,
        },
        loadingText: {
            color: colors.textSecondary,
        },
        title: {
            color: colors.text,
        },
        subtitle: {
            color: colors.textSecondary,
        },
        searchContainer: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
        },
        searchIcon: {
            color: colors.textSecondary,
        },
        searchInput: {
            color: colors.text,
        },
        categoryChip: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        activeCategoryChip: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryText: {
            color: colors.textSecondary,
        },
        activeCategoryText: {
            color: '#fff',
        },
        emptyText: {
            color: colors.textSecondary,
        }
    };

    if (loading && !refreshing && products.length === 0) {
        return (
            <View style={[styles.centerContainer, dynamicStyles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading delicious snacks...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, dynamicStyles.title]}>Hungry? 😋</Text>
                <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Order from your favorite campus spots</Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, dynamicStyles.searchInput]}
                    placeholder="Search for snacks, meals..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor={colors.textTertiary}
                />
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            dynamicStyles.categoryChip,
                            selectedCategory === null && dynamicStyles.activeCategoryChip
                        ]}
                        onPress={() => handleCategorySelect(null)}
                    >
                        <Text style={[
                            styles.categoryText,
                            dynamicStyles.categoryText,
                            selectedCategory === null && dynamicStyles.activeCategoryText
                        ]}>All</Text>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                dynamicStyles.categoryChip,
                                selectedCategory === cat && dynamicStyles.activeCategoryChip
                            ]}
                            onPress={() => handleCategorySelect(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                dynamicStyles.categoryText,
                                selectedCategory === cat && dynamicStyles.activeCategoryText
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Product Grid */}
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onAdd={(p) => handleAddToCart(p, 1)}
                        onPress={handleProductPress}
                    />
                )}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                            {searchQuery ? `No snacks found for "${searchQuery}"` : 'No snacks available right now.'}
                        </Text>
                    </View>
                }
            />

            {/* Modals */}
            <ProductDetailSheet
                visible={detailVisible}
                product={selectedProduct}
                onClose={() => setDetailVisible(false)}
                onAddToCart={handleAddToCart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    categoriesContainer: {
        marginBottom: 16,
    },
    categoriesList: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryText: {
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for cart button
    },
    row: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
