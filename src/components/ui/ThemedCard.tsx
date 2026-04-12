/**
 * ThemedCard - Example themed component
 * 
 * Demonstrates usage of the black/white/grey theme system.
 * Uses useTheme() hook for theme-aware styling.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemedCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    onPress?: () => void;
    variant?: 'default' | 'elevated' | 'outlined';
    children?: React.ReactNode;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
    title,
    subtitle,
    description,
    onPress,
    variant = 'default',
    children,
}) => {
    const { theme } = useTheme();
    const { colors } = theme;

    // Dynamic styles based on theme and variant
    const getCardStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            padding: 16,
            marginVertical: 8,
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                    backgroundColor: colors.background.tertiary,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border.default,
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: colors.card.background,
                    borderWidth: 1,
                    borderColor: colors.card.border,
                };
        }
    };

    const CardContent = (
        <View style={getCardStyle()}>
            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                {title}
            </Text>

            {/* Subtitle */}
            {subtitle && (
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                    {subtitle}
                </Text>
            )}

            {/* Divider */}
            {(description || children) && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}

            {/* Description */}
            {description && (
                <Text style={[styles.description, { color: colors.text.tertiary }]}>
                    {description}
                </Text>
            )}

            {/* Custom children */}
            {children}
        </View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    pressed && { opacity: 0.8 },
                ]}
            >
                {CardContent}
            </Pressable>
        );
    }

    return CardContent;
};

/**
 * ThemedButton - Example themed button
 */
interface ThemedButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
}) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const getButtonStyle = (pressed: boolean): ViewStyle => {
        const base: ViewStyle = {
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        };

        if (disabled) {
            return {
                ...base,
                backgroundColor: colors.button.disabled,
            };
        }

        switch (variant) {
            case 'secondary':
                return {
                    ...base,
                    backgroundColor: pressed ? colors.button.secondaryPressed : colors.button.secondary,
                    borderWidth: 1,
                    borderColor: colors.button.secondaryBorder,
                };
            case 'ghost':
                return {
                    ...base,
                    backgroundColor: pressed ? colors.button.ghostPressed : colors.button.ghost,
                };
            default:
                return {
                    ...base,
                    backgroundColor: pressed ? colors.button.primaryPressed : colors.button.primary,
                };
        }
    };

    const getTextStyle = (): TextStyle => {
        if (disabled) {
            return { color: colors.button.disabledText };
        }

        switch (variant) {
            case 'secondary':
                return { color: colors.button.secondaryText };
            case 'ghost':
                return { color: colors.button.ghostText };
            default:
                return { color: colors.button.primaryText };
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => getButtonStyle(pressed)}
        >
            <Text style={[styles.buttonText, getTextStyle()]}>{label}</Text>
        </Pressable>
    );
};

/**
 * ThemedInput - Example themed text input placeholder
 */
interface ThemedTextProps {
    variant?: 'primary' | 'secondary' | 'tertiary';
    children: React.ReactNode;
    style?: TextStyle;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    variant = 'primary',
    children,
    style,
}) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const getColor = () => {
        switch (variant) {
            case 'secondary':
                return colors.text.secondary;
            case 'tertiary':
                return colors.text.tertiary;
            default:
                return colors.text.primary;
        }
    };

    return (
        <Text style={[{ color: getColor() }, style]}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ThemedCard;
