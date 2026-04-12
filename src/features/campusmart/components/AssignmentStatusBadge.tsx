/**
 * AssignmentStatusBadge Component
 * 
 * Displays assignment status with color-coded badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssignmentStatus, ASSIGNMENT_STATUS_CONFIG } from '@/api/assignmentApi';

interface AssignmentStatusBadgeProps {
    status: AssignmentStatus;
    size?: 'small' | 'medium' | 'large';
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
    status,
    size = 'medium',
}) => {
    const config = ASSIGNMENT_STATUS_CONFIG[status] || ASSIGNMENT_STATUS_CONFIG.draft;

    const sizeStyles = {
        small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, iconSize: 10 },
        medium: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, iconSize: 14 },
        large: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, iconSize: 18 },
    };

    const { paddingHorizontal, paddingVertical, fontSize, iconSize } = sizeStyles[size];

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: config.bgColor,
                paddingHorizontal,
                paddingVertical
            }
        ]}>
            <Ionicons
                name={config.icon as any}
                size={iconSize}
                color={config.color}
                style={styles.icon}
            />
            <Text style={[styles.label, { color: config.color, fontSize }]}>
                {config.label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontWeight: '600',
    },
});

export default AssignmentStatusBadge;
