/**
 * AssignmentDetailScreen
 * 
 * Detailed view of a single assignment
 * Theme-aware: Supports light and dark modes
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import { AppImage } from '@/components/ui/AppImage';
import {
    Assignment,
    getAssignmentById,
    deleteAssignment,
    updateAssignmentStatus,
    ASSIGNMENT_TYPE_CONFIG,
    ASSIGNMENT_STATUS_CONFIG,
} from '@/api/assignmentApi';
import { AssignmentStatusBadge } from '../components';

export const AssignmentDetailScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const { isDark } = useTheme();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchAssignment();
        }
    }, [id]);

    const fetchAssignment = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAssignmentById(id!);
            setAssignment(data);
        } catch (err: any) {
            console.error('Failed to fetch assignment:', err);
            setError(err.message || 'Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleCancel = async () => {
        Alert.alert(
            'Cancel Assignment',
            'Are you sure you want to cancel this assignment? This cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateAssignmentStatus(id!, 'cancelled');
                            fetchAssignment();
                            Alert.alert('Success', 'Assignment has been cancelled');
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to cancel');
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Assignment',
            'Are you sure you want to delete this assignment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAssignment(id!);
                            router.back();
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        router.push(`/edit-assignment/${id}` as any);
    };

    const openAttachment = (url: string) => {
        Linking.openURL(url);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatBudget = () => {
        if (!assignment) return '';
        if (assignment.agreedPrice) {
            return `₹${assignment.agreedPrice.toLocaleString('en-IN')}`;
        }
        return `₹${assignment.budget.min.toLocaleString('en-IN')} - ₹${assignment.budget.max.toLocaleString('en-IN')}`;
    };

    // Dynamic styles based on theme
    const dynamicStyles = {
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: colors.text,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: isDark ? 'transparent' : 'rgba(0,0,0,0.05)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: isDark ? 0 : 2,
        },
        detailCard: {
            width: '48%' as any,
            margin: '1%' as any,
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 16,
            alignItems: 'flex-start' as const,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: isDark ? 'transparent' : 'rgba(0,0,0,0.05)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: isDark ? 0 : 1,
        },
        typeTag: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 6,
            backgroundColor: colors.surfaceHighlight,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        pdfPreview: {
            width: 80,
            height: 80,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        },
        deliverableItem: {
            width: 80,
            height: 80,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        },
        errorIconWrapper: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.surfaceHighlight,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginBottom: 16,
        },
    };

    if (loading) {
        return (
            <View style={[dynamicStyles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !assignment) {
        return (
            <View style={[dynamicStyles.container, styles.centered]}>
                <View style={dynamicStyles.errorIconWrapper}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
                </View>
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'Assignment not found'}</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchAssignment}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const typeConfig = ASSIGNMENT_TYPE_CONFIG[assignment.type];
    const canCancel = ['open', 'draft'].includes(assignment.status);
    const canDelete = ['draft', 'open', 'cancelled'].includes(assignment.status);
    const canEdit = ['open', 'draft'].includes(assignment.status);

    return (
        <View style={dynamicStyles.container}>
            {/* Header */}
            <View style={[dynamicStyles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={dynamicStyles.headerTitle}>Assignment Details</Text>
                {canEdit ? (
                    <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                        <Ionicons name="create-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 32 }} />
                )}
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Status & Type */}
                <View style={styles.statusRow}>
                    <View style={dynamicStyles.typeTag}>
                        <Ionicons name={typeConfig.icon as any} size={16} color={colors.primary} />
                        <Text style={[styles.typeText, { color: colors.primary }]}>{typeConfig.label}</Text>
                    </View>
                    <AssignmentStatusBadge status={assignment.status} size="medium" />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>{assignment.title}</Text>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Description</Text>
                    <View style={dynamicStyles.card}>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{assignment.description}</Text>
                    </View>
                </View>

                {/* Requirements */}
                {assignment.requirements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Requirements</Text>
                        <View style={dynamicStyles.card}>
                            {assignment.requirements.map((req, index) => (
                                <View key={index} style={styles.requirementItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                    <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Attachments */}
                {assignment.attachments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            Attachments ({assignment.attachments.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {assignment.attachments.map((url, index) => {
                                const isPdf = url.toLowerCase().endsWith('.pdf');
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.attachmentItem}
                                        onPress={() => openAttachment(url)}
                                    >
                                        {isPdf ? (
                                            <View style={dynamicStyles.pdfPreview}>
                                                <Ionicons name="document" size={24} color="#EF4444" />
                                                <Text style={[styles.pdfText, { color: colors.textSecondary }]}>PDF</Text>
                                            </View>
                                        ) : (
                                            <AppImage uri={url} style={[styles.attachmentImage, { borderColor: colors.border }]} contentFit="cover" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Details Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Details</Text>
                    <View style={styles.detailsGrid}>
                        <View style={dynamicStyles.detailCard}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Deadline</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(assignment.deadline)}</Text>
                        </View>
                        <View style={dynamicStyles.detailCard}>
                            <Ionicons name="cash-outline" size={20} color={colors.primary} />
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Budget</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{formatBudget()}</Text>
                        </View>
                        <View style={dynamicStyles.detailCard}>
                            <Ionicons name="time-outline" size={20} color="#F59E0B" />
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(assignment.createdAt)}</Text>
                        </View>
                        {/* Alpha info - only shown when completed (for delivery) */}
                        {assignment.alpha && (
                            <>
                                {assignment.status === 'completed' ? (
                                    <>
                                        <View style={dynamicStyles.detailCard}>
                                            <Ionicons name="person-outline" size={20} color={colors.primary} />
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assigned Alpha</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>{assignment.alpha.name}</Text>
                                        </View>
                                        {assignment.alpha.phone && (
                                            <View style={dynamicStyles.detailCard}>
                                                <Ionicons name="call-outline" size={20} color="#8B5CF6" />
                                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Alpha Contact</Text>
                                                <Text style={[styles.detailValue, { color: colors.text }]}>{assignment.alpha.phone}</Text>
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View style={dynamicStyles.detailCard}>
                                        <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Alpha Assigned</Text>
                                        <Text style={[styles.detailValue, { color: colors.textTertiary, fontStyle: 'italic' }]}>
                                            🔒 Details after completion
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Deliverables (if submitted) */}
                {assignment.deliverables.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Deliverables</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {assignment.deliverables.map((url, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.attachmentItem}
                                    onPress={() => openAttachment(url)}
                                >
                                    <View style={dynamicStyles.deliverableItem}>
                                        <Ionicons name="document-attach" size={24} color={colors.primary} />
                                        <Text style={[styles.deliverableText, { color: colors.primary }]}>File {index + 1}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    {canCancel && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                            <Text style={styles.cancelButtonText}>Cancel Assignment</Text>
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.deleteButtonText, { color: colors.textSecondary }]}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
    },
    editButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
    },
    attachmentItem: {
        marginRight: 12,
    },
    attachmentImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        borderWidth: 1,
    },
    pdfText: {
        fontSize: 10,
        marginTop: 4,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    detailLabel: {
        fontSize: 12,
        marginTop: 8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    deliverableText: {
        fontSize: 10,
        marginTop: 4,
    },
    actions: {
        marginTop: 16,
        gap: 12,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
        borderRadius: 12,
        paddingVertical: 14,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    deleteButtonText: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AssignmentDetailScreen;
