/**
 * BudgetInput Component
 * 
 * Input component for budget range (min/max)
 * Theme-aware: Supports light and dark modes
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';

interface BudgetInputProps {
    value: { min: number; max: number };
    onChange: (budget: { min: number; max: number }) => void;
    error?: string;
}

export const BudgetInput: React.FC<BudgetInputProps> = ({
    value,
    onChange,
    error,
}) => {
    const colors = useThemeColors();

    const handleMinChange = (text: string) => {
        const numValue = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
        onChange({ ...value, min: numValue });
    };

    const handleMaxChange = (text: string) => {
        const numValue = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
        onChange({ ...value, max: numValue });
    };

    const formatCurrency = (amount: number) => {
        return amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : '';
    };

    const dynamicStyles = {
        inputWrapper: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 52,
            borderWidth: 1,
            borderColor: colors.border,
        },
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Budget Range</Text>
            <View style={styles.row}>
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Minimum</Text>
                    <View style={dynamicStyles.inputWrapper}>
                        <Text style={[styles.currency, { color: colors.textTertiary }]}>₹</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            value={value.min > 0 ? value.min.toString() : ''}
                            onChangeText={handleMinChange}
                            placeholder="0"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.separator}>
                    <Text style={[styles.separatorText, { color: colors.textSecondary }]}>to</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Maximum</Text>
                    <View style={dynamicStyles.inputWrapper}>
                        <Text style={[styles.currency, { color: colors.textTertiary }]}>₹</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            value={value.max > 0 ? value.max.toString() : ''}
                            onChangeText={handleMaxChange}
                            placeholder="0"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {value.min > 0 && value.max > 0 && (
                <Text style={[styles.summary, { color: colors.primary }]}>
                    Your budget: {formatCurrency(value.min)} - {formatCurrency(value.max)}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    inputContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 6,
        marginLeft: 2,
    },
    currency: {
        fontSize: 16,
        marginRight: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    separator: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },
    separatorText: {
        fontSize: 14,
        fontWeight: '500',
    },
    error: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 8,
        marginLeft: 4,
    },
    summary: {
        fontSize: 13,
        marginTop: 8,
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default BudgetInput;
