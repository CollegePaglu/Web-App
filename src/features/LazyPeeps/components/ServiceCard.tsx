import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SnackItem } from '../hooks/useLazyPeeps';
import { extendedColors as colors, grey, uiColors, shadowColors } from '@/theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ServiceCardProps {
    item: SnackItem;
    onAdd: (item: SnackItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onAdd }) => {
    return (
        <View style={styles.cardContainer}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
                <AppImage uri={item.image} style={styles.image} contentFit="cover" />
                <View style={styles.content}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.footer}>
                        <Text style={styles.price}>₹{item.price}</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => onAdd(item)}
                        >
                            <Ionicons name="add" size={20} color={uiColors.textInverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: uiColors.surface,
        shadowColor: shadowColors.light,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    card: {
        padding: 14,
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        marginBottom: 14,
        backgroundColor: colors.neutral[100],
    },
    content: {
        gap: 6,
    },
    name: {
        color: uiColors.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    description: {
        color: uiColors.textSecondary,
        fontSize: 13,
        marginBottom: 10,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    price: {
        color: colors.primary[600],
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
});
