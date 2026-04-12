/**
 * AssignmentCard Component
 * 
 * Card displaying assignment summary for list view
 * Theme-aware: Supports light and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Assignment, ASSIGNMENT_TYPE_CONFIG } from '@/api/assignmentApi';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { useThemeColors } from '@/context/ThemeContext';

interface AssignmentCardProps {
    assignment: Assignment;
    onPress: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
    assignment,
    onPress,
}) => {
    const colors = useThemeColors();
    const typeConfig = ASSIGNMENT_TYPE_CONFIG[assignment.type] || ASSIGNMENT_TYPE_CONFIG.other;

    // Calculate days until deadline
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const isUrgent = daysLeft <= 2 && daysLeft >= 0;

    const formatDeadline = () => {
        if (isOverdue) return `${Math.abs(daysLeft)} days overdue`;
        if (daysLeft === 0) return 'Due today';
        if (daysLeft === 1) return 'Due tomorrow';
        return `${daysLeft} days left`;
    };

    const formatBudget = () => {
        if (assignment.agreedPrice) {
            return `₹${assignment.agreedPrice.toLocaleString('en-IN')}`;
        }
        return `₹${assignment.budget.min.toLocaleString('en-IN')} - ₹${assignment.budget.max.toLocaleString('en-IN')}`;
    };

    const getDeadlineColor = () => {
        if (isOverdue) return colors.destructive;
        if (isUrgent) return '#F59E0B'; // Warning orange
        return colors.textSecondary;
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.typeContainer}>
                    <Ionicons
                        name={typeConfig.icon as any}
                        size={16}
                        color={colors.primary}
                    />
                    <Text style={[styles.typeLabel, { color: colors.primary }]}>{typeConfig.label}</Text>
                </View>
                <AssignmentStatusBadge status={assignment.status} size="small" />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {assignment.title}
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {assignment.description}
            </Text>

            {/* Footer Row */}
            <View style={styles.footer}>
                {/* Deadline */}
                <View style={styles.footerItem}>
                    <Ionicons
                        name="time-outline"
                        size={14}
                        color={getDeadlineColor()}
                    />
                    <Text style={[styles.footerText, { color: getDeadlineColor() }]}>
                        {formatDeadline()}
                    </Text>
                </View>

                {/* Budget */}
                <View style={styles.footerItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.primary} />
                    <Text style={[styles.footerText, { color: colors.primary, fontWeight: '600' }]}>
                        {formatBudget()}
                    </Text>
                </View>
            </View>

            {/* Attachments indicator */}
            {assignment.attachments.length > 0 && (
                <View style={[styles.attachmentIndicator, { borderTopColor: colors.border }]}>
                    <Ionicons name="attach" size={12} color={colors.textTertiary} />
                    <Text style={[styles.attachmentText, { color: colors.textTertiary }]}>
                        {assignment.attachments.length} file{assignment.attachments.length > 1 ? 's' : ''}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
        lineHeight: 22,
    },
    description: {
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
    },
    attachmentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    attachmentText: {
        fontSize: 11,
    },
});

export default AssignmentCard;
