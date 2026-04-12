import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, ZoomIn, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVendorCart } from '../hooks/useVendorCart';

interface PremiumCartSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Premium Cart Sheet - World-class UI/UX Design
 * Displays both snacks and printouts with detailed breakdowns
 * Professional animations and interactions
 */
export const PremiumCartSheet = ({ isVisible, onClose }: PremiumCartSheetProps) => {
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, updateQuantity, removePrintoutFromCart, clearCart } = useVendorCart();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isVisible) return null;

  // Calculations
  const snacksTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const printoutsTotal = cart.printouts?.reduce((sum, p) => sum + p.totalCost, 0) || 0;
  const subtotal = snacksTotal + printoutsTotal;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const delivery = snacksTotal > 0 ? 50 : 0;
  const total = subtotal + tax + delivery;

  const totalItems = cart.items.length + (cart.printouts?.length || 0);
  const hasItems = totalItems > 0;

  const handleCheckout = () => {
    if (!hasItems) {
      Alert.alert('Empty Cart', 'Please add items before checkout');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        '✅ Order Placed!',
        `${cart.items.length} snack${cart.items.length !== 1 ? 's' : ''} + ${cart.printouts?.length || 0} print request${(cart.printouts?.length || 0) !== 1 ? 's' : ''}\n\nTotal: ₹${total.toFixed(2)}\n\nProceeding to Cashfree payment...`,
        [{ text: 'OK', onPress: () => { clearCart(); onClose(); } }]
      );
    }, 1200);
  };

  return (
    <>
      {/* Dark Overlay with Blur Effect */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          onPress={onClose}
          activeOpacity={0.3}
        />
      </Animated.View>

      {/* Premium Cart Sheet */}
      <Animated.View
        entering={SlideInDown.duration(400)}
        style={[styles.sheet, { paddingBottom: insets.bottom + 16, paddingTop: 12 }]}
      >
        {/* Drag Handle */}
        <View style={styles.handleBar} />

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.cartTitle}>Shopping Cart</Text>
            {hasItems && (
              <Animated.View
                entering={ZoomIn.springify()}
                style={styles.itemCounter}
              >
                <Text style={styles.itemCountText}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </Text>
              </Animated.View>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={15}
            style={styles.closeBtn}
          >
            <Ionicons name="close-circle-outline" size={28} color="#667eea" />
          </TouchableOpacity>
        </View>

        {!hasItems ? (
          /* Empty State */
          <Animated.View
            entering={ZoomIn.delay(100)}
            style={styles.emptyContainer}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="cart-outline" size={64} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtext}>Add snacks and printouts to get started</Text>
          </Animated.View>
        ) : (
          /* Cart Contents */
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* ==================== SNACKS SECTION ==================== */}
            {cart.items.length > 0 && (
              <Animated.View
                entering={FadeIn.delay(100)}
                layout={Layout.springify()}
                style={styles.section}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionIcon}>
                      <Ionicons name="restaurant" size={18} color="#667eea" />
                    </View>
                    <Text style={styles.sectionTitle}>Snacks & Food</Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{cart.items.length}</Text>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  {cart.items.map((item, idx) => (
                    <Animated.View
                      key={item.productId}
                      entering={FadeIn.delay(50 + idx * 30)}
                      layout={Layout.springify()}
                    >
                      <View style={styles.snackItem}>
                        <View style={styles.itemImageBox}>
                          <Text style={styles.foodEmoji}>🍔</Text>
                        </View>

                        <View style={styles.snackInfo}>
                          <Text style={styles.snackName} numberOfLines={2}>
                            {item.productName}
                          </Text>
                          <View style={styles.snackPrice}>
                            <Text style={styles.priceText}>₹{item.price}</Text>
                            <Text style={styles.priceUnit}>/unit</Text>
                          </View>
                        </View>

                        <View style={styles.snackControls}>
                          <View style={styles.quantityBox}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Ionicons name="remove-sharp" size={14} color="#667eea" />
                            </TouchableOpacity>
                            <Text style={styles.qtyDisplay}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Ionicons name="add-sharp" size={14} color="#667eea" />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.snackTotal}>
                            <Text style={styles.totalPrice}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => removeFromCart(item.productId)}
                            style={styles.deleteBtn}
                            hitSlop={12}
                          >
                            <Ionicons name="close" size={16} color="#ff6b6b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>

                {/* Snacks Subtotal */}
                <View style={styles.subtotalCard}>
                  <Text style={styles.subtotalLabel}>Snacks Subtotal</Text>
                  <Text style={styles.subtotalAmount}>₹{snacksTotal.toFixed(2)}</Text>
                </View>
              </Animated.View>
            )}

            {/* ==================== PRINTOUTS SECTION ==================== */}
            {cart.printouts && cart.printouts.length > 0 && (
              <Animated.View
                entering={FadeIn.delay(200)}
                layout={Layout.springify()}
                style={styles.section}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionIcon}>
                      <MaterialCommunityIcons name="printer" size={18} color="#667eea" />
                    </View>
                    <Text style={styles.sectionTitle}>Print Requests</Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{cart.printouts.length}</Text>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  {cart.printouts.map((printout, idx) => (
                    <Animated.View
                      key={printout.id}
                      entering={FadeIn.delay(200 + idx * 30)}
                      layout={Layout.springify()}
                    >
                      <View style={styles.printItem}>
                        <View style={styles.printIconBox}>
                          <MaterialCommunityIcons
                            name="file-pdf-box"
                            size={32}
                            color="#667eea"
                          />
                        </View>

                        <View style={styles.printInfo}>
                          <Text style={styles.printTitle}>Print Order #{idx + 1}</Text>
                          <View style={styles.printSpecs}>
                            <View style={styles.specTag}>
                              <Text style={styles.specValue}>
                                {printout.config.bwPages}
                              </Text>
                              <Text style={styles.specLabel}>B&W</Text>
                            </View>

                            <View style={styles.specTag}>
                              <Text style={styles.specValue}>
                                {printout.config.colorPages}
                              </Text>
                              <Text style={styles.specLabel}>Color</Text>
                            </View>

                            {printout.config.binding && (
                              <View style={styles.specTag}>
                                <Ionicons name="book" size={12} color="#667eea" />
                                <Text style={styles.specLabel}>Binding</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.printCost}>
                          <Text style={styles.printPrice}>
                            ₹{printout.totalCost.toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removePrintoutFromCart(printout.id)}
                            style={styles.deleteBtn}
                            hitSlop={12}
                          >
                            <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>

                {/* Printouts Subtotal */}
                <View style={styles.subtotalCard}>
                  <Text style={styles.subtotalLabel}>Print Subtotal</Text>
                  <Text style={styles.subtotalAmount}>₹{printoutsTotal.toFixed(2)}</Text>
                </View>
              </Animated.View>
            )}

            {/* ==================== BILL SUMMARY ==================== */}
            <Animated.View
              entering={FadeIn.delay(300)}
              layout={Layout.springify()}
              style={styles.billSection}
            >
              <Text style={styles.billTitle}>💳 Bill Summary</Text>

              <View style={styles.billRow}>
                <View style={styles.billLabel}>
                  <Text style={styles.billLabelText}>Subtotal</Text>
                </View>
                <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
              </View>

              {snacksTotal > 0 && (
                <View style={styles.billRow}>
                  <View style={styles.billLabel}>
                    <Ionicons name="bicycle" size={14} color="#667eea" />
                    <Text style={styles.billLabelText}>Delivery</Text>
                  </View>
                  <Text style={styles.billValue}>₹{delivery.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.billRow}>
                <View style={styles.billLabel}>
                  <Text style={styles.billLabelText}>Taxes (5%)</Text>
                </View>
                <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRowTotal}>
                <Text style={styles.billTotalLabel}>Total Amount</Text>
                <Text style={styles.billTotalValue}>₹{total.toFixed(2)}</Text>
              </View>
            </Animated.View>
          </ScrollView>
        )}

        {/* ==================== CHECKOUT BUTTON ==================== */}
        {hasItems && (
          <Animated.View
            entering={SlideInDown.delay(400)}
            style={styles.footer}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutBtn}
            >
              <TouchableOpacity
                onPress={handleCheckout}
                disabled={isProcessing}
                style={styles.checkoutTouchable}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <View style={styles.checkoutContent}>
                    <View style={styles.checkoutLeft}>
                      <Ionicons name="wallet" size={22} color="#fff" />
                      <View style={styles.checkoutText}>
                        <Text style={styles.checkoutLabel}>Proceed to Payment</Text>
                        <Text style={styles.checkoutSubtext}>
                          {cart.items.length > 0 && `${cart.items.length} snack${cart.items.length !== 1 ? 's' : ''}`}
                          {cart.items.length > 0 && cart.printouts?.length ? ' + ' : ''}
                          {cart.printouts?.length > 0 && `${cart.printouts.length} print request${cart.printouts.length !== 1 ? 's' : ''}`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.checkoutRight}>
                      <Text style={styles.checkoutAmount}>₹{total.toFixed(2)}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 999,
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFAF8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 40,
    zIndex: 1000,
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  headerLeft: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  itemCounter: {
    marginTop: 4,
  },
  itemCountText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  content: {
    maxHeight: '62%',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  sectionBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 14,
  },
  snackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: '#667eea',
  },
  itemImageBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FCFAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f4ff',
  },
  foodEmoji: {
    fontSize: 28,
  },
  snackInfo: {
    flex: 1.2,
  },
  snackName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  snackPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#667eea',
  },
  priceUnit: {
    fontSize: 10,
    color: '#999',
  },
  snackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFAF8',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    marginHorizontal: 6,
    minWidth: 20,
    textAlign: 'center',
  },
  snackTotal: {
    minWidth: 45,
  },
  totalPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  deleteBtn: {
    padding: 6,
  },
  printItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: '#667eea',
  },
  printIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FCFAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f4ff',
  },
  printInfo: {
    flex: 1,
  },
  printTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  printSpecs: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  specTag: {
    backgroundColor: '#FCFAF8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#667eea',
  },
  specLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
  },
  printCost: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  printPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtotalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  subtotalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#667eea',
  },
  billSection: {
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  billLabelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  billValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#e0e0e0',
    marginVertical: 14,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#667eea',
  },
  footer: {
    paddingVertical: 12,
  },
  checkoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutTouchable: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  checkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkoutText: {
    flex: 1,
  },
  checkoutLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  checkoutSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  checkoutRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  checkoutAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
});
