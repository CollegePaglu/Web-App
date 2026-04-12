/**
 * VendorCartContext
 * 
 * Global state provider for the LazyPeeps cart.
 * Single source of truth - all components access the same cart state.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/LazyPeepsService';

// ============ TYPES ============

export interface VendorCartItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
    vendorId: string;
}

export interface PrintoutItem {
    id: string;
    fileUrl: string;
    config: {
        bwPages: number;
        colorPages: number;
        binding: boolean;
    };
    totalCost: number;
    addedAt: string;
}

export interface VendorCart {
    items: VendorCartItem[];
    vendorId: string | null;
    totalAmount: number;
    printouts?: PrintoutItem[];
}

interface VendorCartContextType {
    cart: VendorCart;
    cartCount: number;
    loading: boolean;
    error: string | null;
    addToCart: (product: Product, quantity?: number) => Promise<VendorCart>;
    updateQuantity: (productId: string, quantity: number) => Promise<VendorCart>;
    removeFromCart: (productId: string) => Promise<VendorCart>;
    clearCart: () => Promise<void>;
    addPrintoutToCart: (fileUrl: string, config: { bwPages: number; colorPages: number; binding: boolean }) => VendorCart;
    removePrintoutFromCart: (printoutId: string) => VendorCart;
}

const VENDOR_CART_STORAGE_KEY = '@vendor_cart';

const defaultCart: VendorCart = {
    items: [],
    vendorId: null,
    totalAmount: 0,
    printouts: [],
};

// ============ CONTEXT ============

const VendorCartContext = createContext<VendorCartContextType | undefined>(undefined);

// ============ PROVIDER ============

export const VendorCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<VendorCart>(defaultCart);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load cart from storage on mount
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const cachedCart = await AsyncStorage.getItem(VENDOR_CART_STORAGE_KEY);
            if (cachedCart) {
                const parsedCart = JSON.parse(cachedCart);
                setCart(parsedCart);
                console.log('🛒 Cart loaded from storage:', parsedCart.items.length, 'items');
            }
        } catch (err) {
            console.error('Failed to load vendor cart:', err);
        }
    };

    const saveCart = async (updatedCart: VendorCart) => {
        try {
            await AsyncStorage.setItem(VENDOR_CART_STORAGE_KEY, JSON.stringify(updatedCart));
        } catch (err) {
            console.error('Failed to save vendor cart:', err);
        }
    };

    const addToCart = useCallback(
        async (product: Product, quantity: number = 1): Promise<VendorCart> => {
            try {
                setLoading(true);
                setError(null);

                console.log(`🛒 Adding to cart: ${product.name}, qty=${quantity}`);

                let updatedCart = { ...cart };

                // Check if switching vendors - clear existing items
                if (cart.vendorId && cart.vendorId !== product.vendorId) {
                    console.warn('⚠️ Switching vendors - clearing previous cart');
                    updatedCart = {
                        items: [],
                        vendorId: null,
                        totalAmount: 0,
                        printouts: cart.printouts, // Keep printouts
                    };
                }

                updatedCart.vendorId = product.vendorId;

                // Check if product already in cart
                const existingIndex = updatedCart.items.findIndex(
                    item => item.productId === product._id
                );

                if (existingIndex >= 0) {
                    updatedCart.items[existingIndex].quantity += quantity;
                } else {
                    updatedCart.items.push({
                        productId: product._id,
                        productName: product.name,
                        quantity,
                        price: product.price,
                        image: product.image,
                        vendorId: product.vendorId,
                    });
                }

                // Recalculate total
                updatedCart.totalAmount = updatedCart.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ) + (updatedCart.printouts?.reduce((sum, p) => sum + p.totalCost, 0) || 0);

                setCart(updatedCart);
                await saveCart(updatedCart);

                console.log(`✅ Item added. Cart total: ₹${updatedCart.totalAmount}`);
                return updatedCart;
            } catch (err: any) {
                console.error('❌ Add to cart error:', err);
                setError(err.message || 'Failed to add to cart');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [cart]
    );

    const updateQuantity = useCallback(
        async (productId: string, quantity: number): Promise<VendorCart> => {
            try {
                setLoading(true);
                setError(null);

                const updatedCart = { ...cart };
                const itemIndex = updatedCart.items.findIndex(
                    item => item.productId === productId
                );

                if (itemIndex < 0) {
                    throw new Error('Item not found in cart');
                }

                if (quantity <= 0) {
                    updatedCart.items.splice(itemIndex, 1);
                } else {
                    updatedCart.items[itemIndex].quantity = quantity;
                }

                // Recalculate total
                updatedCart.totalAmount = updatedCart.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ) + (updatedCart.printouts?.reduce((sum, p) => sum + p.totalCost, 0) || 0);

                // Clear vendor if no items
                if (updatedCart.items.length === 0) {
                    updatedCart.vendorId = null;
                }

                setCart(updatedCart);
                await saveCart(updatedCart);

                return updatedCart;
            } catch (err: any) {
                console.error('❌ Update quantity error:', err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [cart]
    );

    const removeFromCart = useCallback(
        async (productId: string): Promise<VendorCart> => {
            try {
                setLoading(true);
                setError(null);

                const updatedCart = { ...cart };
                updatedCart.items = updatedCart.items.filter(
                    item => item.productId !== productId
                );

                // Recalculate total
                updatedCart.totalAmount = updatedCart.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ) + (updatedCart.printouts?.reduce((sum, p) => sum + p.totalCost, 0) || 0);

                if (updatedCart.items.length === 0) {
                    updatedCart.vendorId = null;
                }

                setCart(updatedCart);
                await saveCart(updatedCart);

                return updatedCart;
            } catch (err: any) {
                console.error('❌ Remove from cart error:', err);
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [cart]
    );

    const clearCart = useCallback(async () => {
        const emptyCart: VendorCart = {
            items: [],
            vendorId: null,
            totalAmount: 0,
            printouts: [],
        };
        setCart(emptyCart);
        await saveCart(emptyCart);
        console.log('✅ Cart cleared');
    }, []);

    const addPrintoutToCart = useCallback(
        (fileUrl: string, config: { bwPages: number; colorPages: number; binding: boolean }): VendorCart => {
            const bwCost = config.bwPages * 2;
            const colorCost = config.colorPages * 10;
            const bindingCost = config.binding ? 30 : 0;
            const totalCost = bwCost + colorCost + bindingCost;

            const printoutItem: PrintoutItem = {
                id: `printout-${Date.now()}`,
                fileUrl,
                config,
                totalCost,
                addedAt: new Date().toISOString(),
            };

            const updatedCart = {
                ...cart,
                printouts: [...(cart.printouts || []), printoutItem],
                totalAmount: cart.totalAmount + totalCost,
            };

            setCart(updatedCart);
            saveCart(updatedCart);

            console.log('✅ Printout added. Cost: ₹' + totalCost);
            return updatedCart;
        },
        [cart]
    );

    const removePrintoutFromCart = useCallback(
        (printoutId: string): VendorCart => {
            const printoutToRemove = cart.printouts?.find(p => p.id === printoutId);
            if (!printoutToRemove) {
                throw new Error('Printout not found');
            }

            const updatedCart = {
                ...cart,
                printouts: (cart.printouts || []).filter(p => p.id !== printoutId),
                totalAmount: cart.totalAmount - printoutToRemove.totalCost,
            };

            setCart(updatedCart);
            saveCart(updatedCart);

            console.log('✅ Printout removed');
            return updatedCart;
        },
        [cart]
    );



    const cartCount = cart.items.length + (cart.printouts?.length || 0);

    return (
        <VendorCartContext.Provider
            value={{
                cart,
                cartCount,
                loading,
                error,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                addPrintoutToCart,
                removePrintoutFromCart,
            }}
        >
            {children}
        </VendorCartContext.Provider>
    );
};

// ============ HOOK ============

export const useVendorCart = (): VendorCartContextType => {
    const context = useContext(VendorCartContext);
    if (!context) {
        throw new Error('useVendorCart must be used within a VendorCartProvider');
    }
    return context;
};

export default VendorCartContext;
