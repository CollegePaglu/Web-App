import apiClient from '@/api/client';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { tokenStorage } from '@/utils/storage';
import { env } from '@/config/env';

// ============ TYPE DEFINITIONS ============

// Update Vendor interface to include ownerId
export interface Vendor {
    _id: string;
    name: string;
    description?: string;
    type: string;
    location: string;
    image?: string;
    rating: number;
    totalRatings: number;
    isAcceptingOrders: boolean;
    isActive: boolean;
    ownerId: string; // Required for mapping to Custom Orders
}

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    isAvailable: boolean;
    vendorId: string;
    image?: string;
    preparationTime?: number;
    rating?: number;
}

export interface CartItem {
    _id: string;
    productId: Product;
    name?: string;
    quantity: number;
    vendorId: string;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export interface Order {
    _id: string;
    userId: string;
    vendorId?: { _id: string; name: string; image?: string };
    items: CartItem[];
    total: number;
    totalAmount?: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'accepted';
    deliveryAddress?: string;
    pickupCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    _id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
}

// Page-level ink analysis types
export interface PageAnalysis {
    pageNumber: number;
    inkPercentage: number;
    tier: 'light' | 'medium' | 'heavy';
    price: number;
    previewBase64: string;
    inkMaskBase64: string;
}

export interface PageAnalysisResult {
    pages: PageAnalysis[];
    totalPages: number;
    totalBasePrice: number;
    analysisId: string;
}

// Page config for user selections
export interface PageConfig {
    pageNumber: number;
    selected: boolean;
    printMode: 'bw' | 'color';
    inkTier: 'light' | 'medium' | 'heavy';
    bwPrice: number;  // Price if printed B&W (from analysis)
    colorPrice: number;  // Fixed color price
    previewBase64: string;
}

// ============ LAZYPEEPS SERVICE ============

// Service methods are defined below after interfaces

export const LazyPeepsService = {
    // ============ FILE UPLOAD (Swagger: /attachments) ============

    uploadFile: async (file: DocumentPicker.DocumentPickerAsset): Promise<any> => {
        console.log('📤 Uploading file:', file.name, 'URI:', file.uri);

        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken) {
            throw new Error('Authentication required. Please log in.');
        }

        return new Promise((resolve, reject) => {
            // Create FormData
            const formData = new FormData();

            // File URI handling for React Native
            let fileUri = file.uri;
            if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
                fileUri = `file://${fileUri}`;
            }

            const fileObject = {
                uri: fileUri,
                name: file.name || 'upload.pdf',
                type: file.mimeType || 'application/pdf',
            };

            console.log('📎 File object:', JSON.stringify(fileObject));

            formData.append('file', fileObject as any);
            formData.append('folder', 'attachments');

            // Use XMLHttpRequest - most reliable for file uploads on React Native
            const xhr = new XMLHttpRequest();
            const uploadUrl = `${env.API_BASE_URL}/attachments/upload/single`;
            console.log('📤 Uploading to:', uploadUrl);

            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            // Don't set Content-Type - let XHR set it with proper boundary

            xhr.onload = () => {
                console.log('📥 Upload response status:', xhr.status);
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('📥 Upload response:', response);

                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('✅ Upload success');
                        resolve(response.data || response);
                    } else {
                        const errorMsg = response?.error?.message || response?.message || 'Upload failed';
                        console.error('❌ Upload error:', errorMsg);
                        reject(new Error(errorMsg));
                    }
                } catch (e) {
                    console.error('❌ Failed to parse response:', xhr.responseText);
                    reject(new Error('Invalid server response'));
                }
            };

            xhr.onerror = () => {
                console.error('❌ XHR Network error');
                reject(new Error('Network error during upload. Please check your connection.'));
            };

            xhr.ontimeout = () => {
                console.error('❌ XHR Timeout');
                reject(new Error('Upload timed out. Please try again.'));
            };

            xhr.timeout = 90000; // 90 seconds

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    console.log(`📊 Upload progress: ${progress}%`);
                }
            };

            xhr.send(formData);
        });
    },

    // ============ INK COVERAGE ANALYSIS (Swagger: /printout/analyze) ============

    /**
     * Analyze document for ink coverage per page
     * Returns page previews, ink percentage, tier, and price
     */
    analyzeDocument: async (file: DocumentPicker.DocumentPickerAsset): Promise<PageAnalysisResult> => {
        console.log('🔍 Analyzing document for ink coverage:', file.name);

        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken) {
            throw new Error('Authentication required. Please log in.');
        }

        return new Promise((resolve, reject) => {
            const formData = new FormData();

            let fileUri = file.uri;
            if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
                fileUri = `file://${fileUri}`;
            }

            const fileObject = {
                uri: fileUri,
                name: file.name || 'document.pdf',
                type: file.mimeType || 'application/pdf',
            };

            formData.append('document', fileObject as any);

            const xhr = new XMLHttpRequest();
            const analyzeUrl = `${env.API_BASE_URL}/printout/analyze`;
            console.log('🔍 Analyzing at:', analyzeUrl);

            xhr.open('POST', analyzeUrl);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

            xhr.onload = () => {
                console.log('📥 Analysis response status:', xhr.status);
                try {
                    const response = JSON.parse(xhr.responseText);

                    if (xhr.status >= 200 && xhr.status < 300 && response.success) {
                        console.log('✅ Analysis success:', response.data?.totalPages || response.totalPages, 'pages');
                        const data = response.data || response;
                        resolve({
                            pages: data.pages || [],
                            totalPages: data.totalPages || 0,
                            totalBasePrice: data.totalBasePrice || 0,
                            analysisId: data.analysisId || '',
                        });
                    } else {
                        const errorMsg = response?.error?.message || response?.message || 'Analysis failed';
                        console.error('❌ Analysis error:', errorMsg);
                        reject(new Error(errorMsg));
                    }
                } catch (e) {
                    console.error('❌ Failed to parse analysis response');
                    reject(new Error('Invalid server response'));
                }
            };

            xhr.onerror = () => {
                console.error('❌ XHR Network error during analysis');
                reject(new Error('Network error during analysis. Please check your connection.'));
            };

            xhr.ontimeout = () => {
                console.error('❌ XHR Analysis timeout');
                reject(new Error('Analysis timed out. Please try again.'));
            };

            xhr.timeout = 120000; // 2 minutes for analysis

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    console.log(`📊 Upload for analysis: ${progress}%`);
                }
            };

            xhr.send(formData);
        });
    },

    // ============ VENDOR & PRODUCT SERVICES (Swagger: /vendors) ============

    getVendors: async (): Promise<Vendor[]> => {
        try {
            console.log('📍 Fetching vendors...');
            const response = await apiClient.get('/vendors');
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        } catch (error) {
            console.error('❌ Error fetching vendors:', error);
            return [];
        }
    },

    getVendor: async (vendorId: string): Promise<Vendor> => {
        const response = await apiClient.get(`/vendors/${vendorId}`);
        return response.data.data || response.data;
    },

    getVendorProducts: async (vendorId: string): Promise<Product[]> => {
        try {
            console.log(`🏪 Fetching products for vendor ${vendorId}...`);
            const response = await apiClient.get(`/vendors/${vendorId}/products`);
            const products = Array.isArray(response.data) ? response.data : (response.data.data || []);
            console.log(`✅ Found ${products.length} products`);
            return products;
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            return [];
        }
    },

    getAllProducts: async (): Promise<Product[]> => {
        try {
            const vendors = await LazyPeepsService.getVendors();
            const activeVendors = vendors.filter(v => v.isAcceptingOrders && v.isActive);

            const allProducts: Product[] = [];
            for (const vendor of activeVendors) {
                const products = await LazyPeepsService.getVendorProducts(vendor._id);
                allProducts.push(...products.filter(p => p.isAvailable));
            }

            console.log(`✅ Total ${allProducts.length} products found`);
            return allProducts;
        } catch (error) {
            console.error('❌ Error in getAllProducts:', error);
            return [];
        }
    },

    searchProducts: async (query: string): Promise<Product[]> => {
        const allProducts = await LazyPeepsService.getAllProducts();
        const queryLower = query.toLowerCase();
        return allProducts.filter(
            product =>
                product.name.toLowerCase().includes(queryLower) ||
                product.description?.toLowerCase().includes(queryLower) ||
                product.category.toLowerCase().includes(queryLower)
        );
    },

    // ============ CART SERVICES - DEPRECATED ============
    // NOTE: For snacks/food ordering, use useVendorCart hook which:
    // - Stores items locally in AsyncStorage  
    // - Orders via /vendors/orders (not /cart)
    // - Supports single vendor at a time
    //
    // These marketplace /cart endpoints are kept for reference only
    // and should NOT be used for vendor products
    /*
    addToCart: async (productId: string, quantity: number = 1): Promise<Cart> => {
        throw new Error('Use useVendorCart hook instead of LazyPeepsService.addToCart()');
    },

    getCart: async (): Promise<Cart> => {
        throw new Error('Use useVendorCart hook instead');
    },

    updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
        throw new Error('Use useVendorCart hook instead');
    },

    removeFromCart: async (itemId: string): Promise<Cart> => {
        throw new Error('Use useVendorCart hook instead');
    },

    clearCart: async (): Promise<Cart> => {
        throw new Error('Use useVendorCart hook instead');
    },
    */

    // getCartCount: async (): Promise<number> => {
    //     const response = await apiClient.get('/cart/count');
    //     return response.data.count || response.data.data?.count || 0;
    // },

    // ============ TRANSACTION SERVICES (Swagger: /transactions) ============
    // These handle payment flow before order creation

    checkout: async (cartItems: any[], deliveryAddress: string, notes?: string): Promise<any> => {
        try {
            console.log('💳 Initiating checkout via /transactions/checkout');
            const response = await apiClient.post('/transactions/checkout', {
                items: cartItems,
                deliveryAddress,
                notes,
            });
            console.log('✅ Checkout created:', response.data.data?.transactionId);
            return response.data.data || response.data;
        } catch (error: any) {
            console.error('❌ Checkout error:', error);
            throw new Error(error.response?.data?.error || error.message);
        }
    },

    initiatePayment: async (transactionId: string): Promise<any> => {
        try {
            console.log('💰 Initiating payment for transaction:', transactionId);
            const response = await apiClient.post('/transactions/payment/initiate', {
                transactionId,
            });
            console.log('✅ Payment initiated');
            return response.data.data || response.data;
        } catch (error: any) {
            console.error('❌ Payment initiation error:', error);
            throw new Error(error.response?.data?.error || error.message);
        }
    },

    verifyPayment: async (transactionId: string, paymentId: string, signature?: string): Promise<boolean> => {
        try {
            console.log('✔️ Verifying payment:', { transactionId, paymentId });
            const response = await apiClient.post('/transactions/payment/verify', {
                transactionId,
                paymentId,
                signature,
            });
            const isVerified = response.data.data?.verified || response.data.verified;
            console.log('✅ Payment verified:', isVerified);
            return isVerified;
        } catch (error: any) {
            console.error('❌ Payment verification error:', error);
            throw new Error(error.response?.data?.error || error.message);
        }
    },

    getTransactions: async (): Promise<Transaction[]> => {
        try {
            const response = await apiClient.get('/transactions');
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
            return [];
        }
    },

    getTransactionDetails: async (transactionId: string): Promise<Transaction> => {
        try {
            const response = await apiClient.get(`/transactions/${transactionId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error fetching transaction:', error);
            throw error;
        }
    },

    // ============ ORDER SERVICES (Swagger: /orders) ============
    // Orders are created AFTER successful payment

    placeOrder: async (vendorId: string, items: { productId: string; quantity: number }[], transactionId?: string): Promise<Order> => {
        try {
            console.log('📦 Placing order via /orders:', { vendorId, itemsCount: items.length, transactionId });
            const response = await apiClient.post('/orders', {
                vendorId,
                items,
                type: 'vendor',
                transactionId,  // Link to verified transaction
            });
            console.log('✅ Order placed:', response.data.data?._id);
            return response.data.data || response.data;
        } catch (error: any) {
            console.error('❌ Order placement error:', error);
            throw new Error(error.response?.data?.error || error.message);
        }
    },

    getMyOrders: async (): Promise<Order[]> => {
        try {
            const [vendorOrdersRes, marketOrdersRes] = await Promise.allSettled([
                apiClient.get('/vendors/orders/my'),
                apiClient.get('/orders/my/purchases')
            ]);

            let allOrders: any[] = [];

            // Process Vendor Orders (Snacks)
            if (vendorOrdersRes.status === 'fulfilled') {
                const vendorOrders = Array.isArray(vendorOrdersRes.value.data)
                    ? vendorOrdersRes.value.data
                    : (vendorOrdersRes.value.data.data || []);

                const formattedVendorOrders = vendorOrders.map((o: any) => ({
                    ...o,
                    type: 'vendor', // Explicitly set type for UI handling
                    total: o.totalAmount, // Map totalAmount to total
                    status: o.status.toLowerCase(), // Normalize status to lowercase for UI
                    items: o.items ? o.items.map((i: any) => ({
                        _id: i._id || (typeof i.productId === 'string' ? i.productId : i.productId?._id),
                        quantity: i.quantity,
                        name: i.name, // Required by OrderService
                        vendorId: o.vendorId?._id || o.vendorId,
                        productId: {
                            _id: typeof i.productId === 'string' ? i.productId : i.productId?._id,
                            name: i.name,
                            price: i.price,
                            description: '',
                            category: 'Snack',
                            isAvailable: true,
                            vendorId: o.vendorId?._id || o.vendorId,
                            image: i.image // If available
                        }
                    })) : []
                }));

                allOrders = [...allOrders, ...formattedVendorOrders];
            } else {
                console.error('❌ Error fetching vendor orders:', vendorOrdersRes.reason);
            }

            // Process Market Orders (Printouts, etc)
            if (marketOrdersRes.status === 'fulfilled') {
                const marketOrders = Array.isArray(marketOrdersRes.value.data)
                    ? marketOrdersRes.value.data
                    : (marketOrdersRes.value.data.data || []);

                // Filter relevant orders if needed, or include all
                const formattedMarketOrders = marketOrders.map((o: any) => ({
                    ...o,
                    // valid 'type' already exists (service, etc)
                    total: o.totalAmount,
                    // Map seller to vendorId structure for UI
                    vendorId: o.sellerId ? {
                        _id: o.sellerId._id,
                        name: o.sellerId.displayName || `${o.sellerId.firstName} ${o.sellerId.lastName}`,
                        image: o.sellerId.avatar
                    } : { name: 'Marketplace Seller' },
                    // Synthesize items for marketplace orders which don't have them
                    items: o.items || [{
                        _id: o._id,
                        quantity: 1,
                        name: o.title || 'Order',
                        price: o.totalAmount,
                        vendorId: o.sellerId?._id || o.sellerId,
                        productId: {
                            _id: o._id,
                            name: o.title || 'Order',
                            price: o.totalAmount,
                            category: o.type,
                            isAvailable: true,
                            vendorId: o.sellerId?._id || o.sellerId
                        }
                    }]
                }));

                allOrders = [...allOrders, ...formattedMarketOrders];
            } else {
                console.error('❌ Error fetching market orders:', marketOrdersRes.reason);
            }

            // Sort by createdAt desc
            return allOrders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } catch (error) {
            console.error('❌ Error in getMyOrders:', error);
            return [];
        }
    },

    getOrderDetails: async (orderId: string): Promise<Order> => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error fetching order:', error);
            throw error;
        }
    },

    cancelOrder: async (orderId: string): Promise<Order> => {
        try {
            console.log('❌ Cancelling order:', orderId);
            const response = await apiClient.post(`/orders/${orderId}/cancel`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            throw error;
        }
    },

    // ============ UNIFIED CHECKOUT ============
    // Handles both snacks and printout orders with Cashfree payment

    checkoutAndPay: async (cart: { vendorId: string; items: any[]; printouts?: any[] }, transactionId: string): Promise<any> => {
        try {
            const results = {
                snackOrder: null as any,
                printoutOrders: [] as any[]
            };

            // 1. Create snack order if items exist
            if (cart.items && cart.items.length > 0) {
                const snackPayload = {
                    vendorId: cart.vendorId,
                    items: cart.items,
                    transactionId,
                    paymentStatus: 'completed',
                    orderDate: new Date().toISOString()
                };

                console.log('🍔 Creating snack order:', snackPayload);
                const snackResponse = await apiClient.post('/vendors/orders', snackPayload);
                results.snackOrder = snackResponse.data.data || snackResponse.data;
                console.log('✅ Snack order created:', results.snackOrder._id);
            }

            // 2. Create printout orders using new dedicated endpoint
            if (cart.printouts && cart.printouts.length > 0) {
                for (const printout of cart.printouts) {
                    console.log('🖨️ Creating print order via /vendors/print-orders/create');

                    const printPayload = {
                        pdfUrl: printout.fileUrl,
                        printType: printout.config.colorPages > 0 ? 'color' : 'bw',
                        copies: 1,
                        pages: printout.config.bwPages + printout.config.colorPages,
                        notes: `B&W: ${printout.config.bwPages}, Color: ${printout.config.colorPages}, Binding: ${printout.config.binding ? 'Yes' : 'No'}`
                    };

                    console.log('🖨️ Print order payload:', printPayload);
                    const printResponse = await apiClient.post('/vendors/print-orders/create', printPayload);
                    results.printoutOrders.push(printResponse.data.data || printResponse.data);
                    console.log('✅ Print order created:', results.printoutOrders[results.printoutOrders.length - 1]._id);
                }
            }

            return results;
        } catch (error: any) {
            console.error('❌ Checkout failed:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Checkout failed');
        }
    },

    // ============ PRINTOUT ORDERING (NEW - Uses dedicated print order endpoint) ============
    orderPrintout: async (fileUrl: string, config: { bwPages: number; colorPages: number; binding: boolean }): Promise<any> => {
        try {
            const bwCost = config.bwPages * 2;
            const colorCost = config.colorPages * 10;
            const bindingCost = config.binding ? 30 : 0;
            const totalCost = bwCost + colorCost + bindingCost;

            console.log('🖨️ Creating print order via /vendors/print-orders/create');

            // Use the new dedicated print order endpoint
            const response = await apiClient.post('/vendors/print-orders/create', {
                pdfUrl: fileUrl,
                printType: config.colorPages > 0 ? 'color' : 'bw',
                copies: 1,
                pages: config.bwPages + config.colorPages,
                notes: `B&W: ${config.bwPages}, Color: ${config.colorPages}, Binding: ${config.binding ? 'Yes' : 'No'}`
            });

            console.log('✅ Print order created:', response.data.data?._id || response.data._id);

            return {
                _id: response.data.data?._id || response.data._id,
                orderNumber: response.data.data?.orderId || response.data.orderId,
                totalCost: response.data.data?.totalAmount || totalCost,
                status: 'pending',
            };
        } catch (error: any) {
            console.error('❌ Printout order failed:', error);
            console.error('❌ Error details:', JSON.stringify(error.response?.data || error));
            throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to place printout order');
        }
    },

    getMyPrintoutOrders: async (): Promise<any[]> => {
        try {
            console.log('📄 Fetching print orders from /vendors/print-orders/my');
            const response = await apiClient.get('/vendors/print-orders/my');
            const orders = response.data?.data || response.data || [];
            console.log(`✅ Fetched ${orders.length} print orders`);
            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            console.error('❌ Error fetching printout orders:', error);
            return [];
        }
    },
};

export default LazyPeepsService;
