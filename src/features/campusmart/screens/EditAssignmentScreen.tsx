/**
 * EditAssignmentScreen
 * 
 * Screen for editing an existing assignment (title, description, attachments, etc.)
 * Only available for assignments in 'open' or 'draft' status
 * Theme-aware: Supports light and dark modes
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import {
    Assignment,
    getAssignmentById,
    updateAssignment,
    uploadAttachments,
} from '@/api/assignmentApi';
import { FileUploadArea } from '../components';

interface FileItem {
    uri: string;
    type: string;
    name: string;
}

export const EditAssignmentScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const { isDark } = useTheme();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<FileItem[]>([]);

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
            // Populate form
            setTitle(data.title);
            setDescription(data.description);
            setRequirements(data.requirements.length > 0 ? data.requirements : ['']);
            setExistingAttachments(data.attachments);
        } catch (err: any) {
            console.error('Failed to fetch assignment:', err);
            setError(err.message || 'Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            Alert.alert(
                'Discard Changes?',
                'You have unsaved changes. Are you sure you want to go back?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    const hasChanges = () => {
        if (!assignment) return false;
        return (
            title !== assignment.title ||
            description !== assignment.description ||
            newFiles.length > 0 ||
            JSON.stringify(requirements.filter(r => r.trim())) !== JSON.stringify(assignment.requirements)
        );
    };

    const addRequirement = () => {
        setRequirements([...requirements, '']);
    };

    const updateRequirement = (index: number, value: string) => {
        const updated = [...requirements];
        updated[index] = value;
        setRequirements(updated);
    };

    const removeRequirement = (index: number) => {
        if (requirements.length > 1) {
            setRequirements(requirements.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Description is required');
            return;
        }

        setSaving(true);

        try {
            // Upload new files if any
            let newAttachmentUrls: string[] = [];
            if (newFiles.length > 0) {
                try {
                    newAttachmentUrls = await uploadAttachments(newFiles);
                } catch (uploadError: any) {
                    // Continue without new attachments
                    console.warn('Failed to upload new files:', uploadError);
                    Alert.alert(
                        'Upload Warning',
                        'Some files could not be uploaded due to network issues. Other changes will be saved.',
                        [{ text: 'OK' }]
                    );
                }
            }

            // Combine existing and new attachments
            const allAttachments = [...existingAttachments, ...newAttachmentUrls];

            // Update assignment
            await updateAssignment(id!, {
                title: title.trim(),
                description: description.trim(),
                requirements: requirements.filter(r => r.trim()),
                attachments: allAttachments,
            });

            Alert.alert('Success', 'Assignment updated successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            console.error('Failed to update assignment:', err);
            Alert.alert('Error', err.message || 'Failed to update assignment');
        } finally {
            setSaving(false);
        }
    };

    const removeExistingAttachment = (index: number) => {
        Alert.alert(
            'Remove Attachment',
            'Are you sure you want to remove this attachment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
                    },
                },
            ]
        );
    };

    // Dynamic styles based on theme
    const dynamicStyles = {
        input: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        },
        attachmentPreview: {
            width: 60,
            height: 60,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 8,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        },
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !assignment) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'Assignment not found'}</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchAssignment}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                borderBottomColor: colors.border
            }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Assignment</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Assignment title"
                        placeholderTextColor={colors.textTertiary}
                        maxLength={200}
                    />
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
                    <TextInput
                        style={[dynamicStyles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe what you need..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Requirements</Text>
                    {requirements.map((req, index) => (
                        <View key={index} style={styles.requirementRow}>
                            <TextInput
                                style={[dynamicStyles.input, styles.requirementInput]}
                                value={req}
                                onChangeText={(text) => updateRequirement(index, text)}
                                placeholder={`Requirement ${index + 1}`}
                                placeholderTextColor={colors.textTertiary}
                            />
                            {requirements.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => removeRequirement(index)}
                                    style={styles.removeButton}
                                >
                                    <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity onPress={addRequirement} style={styles.addButton}>
                        <Ionicons name="add" size={20} color={colors.primary} />
                        <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Requirement</Text>
                    </TouchableOpacity>
                </View>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Current Attachments ({existingAttachments.length})
                        </Text>
                        <View style={styles.existingAttachments}>
                            {existingAttachments.map((url, index) => {
                                const isPdf = url.toLowerCase().endsWith('.pdf');
                                return (
                                    <View key={index} style={styles.existingAttachment}>
                                        <View style={dynamicStyles.attachmentPreview}>
                                            <Ionicons
                                                name={isPdf ? 'document' : 'image'}
                                                size={24}
                                                color={isPdf ? '#EF4444' : colors.primary}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => removeExistingAttachment(index)}
                                            style={[styles.attachmentRemove, { backgroundColor: colors.background }]}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Add More Attachments */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Add Attachments</Text>
                    <FileUploadArea
                        files={newFiles}
                        onChange={setNewFiles}
                        maxFiles={5 - existingAttachments.length}
                    />
                </View>

                {/* Info Note */}
                <View style={[styles.infoNote, { backgroundColor: colors.surfaceHighlight }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.infoNoteText, { color: colors.textSecondary }]}>
                        You can only edit assignments that are in 'Open' or 'Draft' status.
                        Once an Alpha is assigned, editing is disabled.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementInput: {
        flex: 1,
    },
    removeButton: {
        marginLeft: 8,
        padding: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    existingAttachments: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    existingAttachment: {
        position: 'relative',
    },
    attachmentRemove: {
        position: 'absolute',
        top: -6,
        right: -6,
        borderRadius: 10,
    },
    infoNote: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    infoNoteText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 14,
        marginTop: 12,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default EditAssignmentScreen;
