/**
 * useVendorCart Hook
 * 
 * Re-exports the useVendorCart hook from VendorCartContext.
 * This provides backwards compatibility with existing imports.
 */

export { useVendorCart, VendorCartProvider } from '../context/VendorCartContext';
export type { VendorCart, VendorCartItem, PrintoutItem } from '../context/VendorCartContext';
