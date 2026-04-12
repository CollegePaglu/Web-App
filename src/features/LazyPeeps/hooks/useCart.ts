/**
 * DEPRECATED: useCart Hook
 * 
 * This hook has been replaced by useVendorCart for snacks/food ordering.
 * 
 * Reason: Old useCart used the marketplace /cart API which doesn't support
 * vendor-specific products. The new useVendorCart:
 * - Uses local storage for cart items
 * - Places orders via /vendors/orders endpoint
 * - Supports single vendor per cart (can't mix vendors)
 * 
 * DO NOT USE - Use useVendorCart instead
 */

export const useCart = () => {
    throw new Error('useCart is deprecated. Use useVendorCart from hooks/useVendorCart.ts instead');
};
