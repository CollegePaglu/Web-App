/**
 * Vendor Order Service
 * 
 * Handles food/snack ordering directly from vendors (not marketplace)
 * Uses /vendors/orders endpoint instead of /cart
 */

import apiClient from '@/api/client';
import { Order, OrderItem } from './LazyPeepsService';

export const VendorOrderService = {
    /**
     * Place a food/snack order directly with a vendor
     * This endpoint doesn't use cart - it's direct ordering
     */
    placeVendorOrder: async (
        vendorId: string,
        items: OrderItem[],
        options?: { deliveryAddress?: string; notes?: string }
    ): Promise<Order> => {
        try {
            console.log('🍕 Placing vendor order:', { vendorId, itemsCount: items.length });
            
            const payload: any = {
                vendorId,
                items,
            };

            // Optional delivery details (if not using transaction flow)
            if (options?.deliveryAddress) {
                payload.deliveryAddress = options.deliveryAddress;
            }
            if (options?.notes) {
                payload.notes = options.notes;
            }

            const response = await apiClient.post('/vendors/orders', payload);
            console.log('✅ Vendor order placed:', response.data._id || response.data.data?._id);
            
            return response.data.data || response.data;
        } catch (error: any) {
            console.error('❌ Vendor order error:', error);
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message;
            throw new Error(errorMsg || 'Failed to place vendor order');
        }
    },

    /**
     * Get user's vendor food/snack orders
     */
    getMyVendorOrders: async (): Promise<Order[]> => {
        try {
            const response = await apiClient.get('/vendors/orders/my');
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        } catch (error) {
            console.error('❌ Error fetching vendor orders:', error);
            return [];
        }
    },

    /**
     * Get specific vendor order details
     */
    getVendorOrderDetails: async (orderId: string): Promise<Order> => {
        try {
            const response = await apiClient.get(`/vendors/orders/${orderId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error fetching order details:', error);
            throw error;
        }
    },

    /**
     * Cancel a vendor order
     */
    cancelVendorOrder: async (orderId: string): Promise<Order> => {
        try {
            console.log('❌ Cancelling vendor order:', orderId);
            const response = await apiClient.post(`/vendors/orders/${orderId}/cancel`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            throw error;
        }
    },
};

export default VendorOrderService;
