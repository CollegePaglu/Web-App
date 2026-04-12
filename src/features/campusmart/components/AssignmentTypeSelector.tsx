/**
 * AssignmentTypeSelector Component
 * 
 * Grid selector for assignment types with icons
 * Theme-aware: Supports light and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssignmentType, ASSIGNMENT_TYPE_CONFIG } from '@/api/assignmentApi';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

interface AssignmentTypeSelectorProps {
    value: AssignmentType | null;
    onChange: (type: AssignmentType) => void;
}

const TYPES: AssignmentType[] = ['assignment', 'project', 'presentation', 'thesis', 'file', 'other'];

export const AssignmentTypeSelector: React.FC<AssignmentTypeSelectorProps> = ({
    value,
    onChange,
}) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Select Type</Text>
            <View style={styles.grid}>
                {TYPES.map((type) => {
                    const config = ASSIGNMENT_TYPE_CONFIG[type];
                    const isSelected = value === type;

                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.item,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border
                                },
                                isSelected && {
                                    borderColor: colors.primary,
                                    backgroundColor: isDark ? colors.surfaceHighlight : colors.surfaceHighlight,
                                },
                            ]}
                            onPress={() => onChange(type)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: colors.surfaceHighlight },
                                isSelected && {
                                    backgroundColor: isDark ? colors.surface : '#FFFFFF'
                                },
                            ]}>
                                <Ionicons
                                    name={config.icon as any}
                                    size={24}
                                    color={isSelected ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <Text style={[
                                styles.label,
                                { color: colors.text },
                                isSelected && { color: colors.primary },
                            ]}>
                                {config.label}
                            </Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                                {config.description}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    item: {
        width: '46%',
        margin: '2%',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 11,
        lineHeight: 14,
    },
});

export default AssignmentTypeSelector;
