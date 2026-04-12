import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LazyPeepsService, Order } from '../services/LazyPeepsService';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

const STATUS_COLORS: Record<string, string> = {
    pending: '#FFA500',
    accepted: '#32CD32',
    preparing: '#1E90FF',
    ready: '#9370DB',
    completed: '#008000',
    cancelled: '#FF0000',
};

const OrderCard = ({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();
    const isActive = ['pending', 'accepted', 'preparing', 'ready'].includes(order.status);

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.vendorName, { color: colors.text }]}>{order.vendorId?.name || 'Unknown Vendor'}</Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(order.createdAt).toLocaleString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] || '#999' }]}>
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Items */}
            <View style={styles.itemsContainer}>
                {order.items.map((item, index) => (
                    <Text key={index} style={[styles.itemText, { color: colors.textSecondary }]}>
                        {item.quantity}x {item.name}
                    </Text>
                ))}
            </View>

            {/* Total */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.cardFooter}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Bill</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{order.totalAmount}</Text>
            </View>

            {/* Pickup Code/Time */}
            {order.status === 'ready' && order.pickupCode && (
                <View style={[
                    styles.pickupContainer,
                    { backgroundColor: isDark ? 'rgba(74, 20, 140, 0.2)' : '#F3E5F5' }
                ]}>
                    <Text style={[
                        styles.pickupLabel,
                        { color: isDark ? '#E1BEE7' : '#4A148C' }
                    ]}>Pickup Code:</Text>
                    <Text style={[
                        styles.pickupCode,
                        { color: isDark ? '#E1BEE7' : '#4A148C' }
                    ]}>{order.pickupCode}</Text>
                </View>
            )}

            {/* Action Buttons */}
            {order.status === 'pending' && (
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.destructive }]}
                    onPress={() => onCancel(order._id)}
                >
                    <Text style={[styles.cancelText, { color: colors.destructive }]}>Cancel Order</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const PrintOrderCard = ({ order }: { order: any }) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.vendorName, { color: colors.text }]}>🖨️ Print Order</Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(order.createdAt).toLocaleString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status?.toLowerCase()] || '#999' }]}>
                    <Text style={styles.statusText}>{order.status?.toUpperCase()}</Text>
                </View>
            </View>

            {/* Details */}
            <View style={styles.itemsContainer}>
                <Text style={[styles.itemText, { color: colors.textSecondary }]}>
                    📄 {order.pages || 1} page(s) • {order.printType === 'color' ? 'Color' : 'B&W'}
                </Text>
                {order.notes && (
                    <Text style={[styles.itemText, { color: colors.textSecondary }]}>
                        📝 {order.notes}
                    </Text>
                )}
            </View>

            {/* Total */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.cardFooter}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{order.totalAmount}</Text>
            </View>

            {/* Pickup Code */}
            {order.status === 'READY' && order.pickupCode && (
                <View style={[
                    styles.pickupContainer,
                    { backgroundColor: isDark ? 'rgba(74, 20, 140, 0.2)' : '#F3E5F5' }
                ]}>
                    <Text style={[
                        styles.pickupLabel,
                        { color: isDark ? '#E1BEE7' : '#4A148C' }
                    ]}>Pickup Code:</Text>
                    <Text style={[
                        styles.pickupCode,
                        { color: isDark ? '#E1BEE7' : '#4A148C' }
                    ]}>{order.pickupCode}</Text>
                </View>
            )}
        </View>
    );
};

export const OrderService = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [printOrders, setPrintOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'snacks' | 'printouts'>('snacks');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colors = useThemeColors();

    const fetchOrders = async () => {
        try {
            const [snackData, printData] = await Promise.all([
                LazyPeepsService.getMyOrders(),
                LazyPeepsService.getMyPrintoutOrders()
            ]);
            setOrders(snackData);
            setPrintOrders(printData);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleCancelOrder = async (orderId: string) => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await LazyPeepsService.cancelOrder(orderId);
                            await fetchOrders();
                            Alert.alert("Success", "Order cancelled successfully");
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to cancel order");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading && !refreshing && orders.length === 0 && printOrders.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const currentData = activeTab === 'snacks' ? orders : printOrders;

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Your Orders</Text>

            {/* Tab Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surfaceHighlight }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'snacks' && { backgroundColor: colors.primary }]}
                    onPress={() => setActiveTab('snacks')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'snacks' ? '#fff' : colors.text }]}>
                        🍔 Snacks ({orders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'printouts' && { backgroundColor: colors.primary }]}
                    onPress={() => setActiveTab('printouts')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'printouts' ? '#fff' : colors.text }]}>
                        🖨️ Printouts ({printOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={currentData}
                keyExtractor={(item) => item._id || item.orderId}
                renderItem={({ item }) => (
                    activeTab === 'snacks'
                        ? <OrderCard order={item} onCancel={handleCancelOrder} />
                        : <PrintOrderCard order={item} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="alarm-outline" size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No {activeTab} orders yet</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Your order history will appear here</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginVertical: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    itemsContainer: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
    },
    pickupContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickupLabel: {
        fontWeight: '600',
    },
    pickupCode: {
        fontWeight: '800',
        fontSize: 18,
        letterSpacing: 2,
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

