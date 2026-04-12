/**
 * CreateAssignmentScreen
 * 
 * Full form for creating new assignment requests
 * Theme-aware: Supports light and dark modes
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, useTheme } from '@/context/ThemeContext';
import {
    AssignmentTypeSelector,
    BudgetInput,
    FileUploadArea
} from '../components';
import { useCreateAssignment } from '../hooks';

// Simple date picker component using Modal
const SimpleDatePicker = ({
    visible,
    onClose,
    onSelect,
    currentDate,
    colors,
    isDark,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    currentDate: Date | null;
    colors: any;
    isDark: boolean;
}) => {
    const [day, setDay] = useState(currentDate?.getDate()?.toString() || '');
    const [month, setMonth] = useState(currentDate ? (currentDate.getMonth() + 1).toString() : '');
    const [year, setYear] = useState(currentDate?.getFullYear()?.toString() || new Date().getFullYear().toString());

    const handleConfirm = () => {
        const d = parseInt(day) || 1;
        const m = parseInt(month) || 1;
        const y = parseInt(year) || new Date().getFullYear();

        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2024) {
            Alert.alert('Invalid Date', 'Please enter a valid date');
            return;
        }

        const selectedDate = new Date(y, m - 1, d);
        if (selectedDate < new Date()) {
            Alert.alert('Invalid Date', 'Deadline must be in the future');
            return;
        }

        onSelect(selectedDate);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[datePickerStyles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[datePickerStyles.container, { backgroundColor: colors.surface }]}>
                    <Text style={[datePickerStyles.title, { color: colors.text }]}>Select Deadline</Text>
                    <View style={datePickerStyles.inputRow}>
                        <View style={datePickerStyles.inputGroup}>
                            <Text style={[datePickerStyles.label, { color: colors.textSecondary }]}>Day</Text>
                            <TextInput
                                style={[datePickerStyles.input, {
                                    backgroundColor: colors.surfaceHighlight,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={day}
                                onChangeText={setDay}
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="DD"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                        <View style={datePickerStyles.inputGroup}>
                            <Text style={[datePickerStyles.label, { color: colors.textSecondary }]}>Month</Text>
                            <TextInput
                                style={[datePickerStyles.input, {
                                    backgroundColor: colors.surfaceHighlight,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={month}
                                onChangeText={setMonth}
                                keyboardType="number-pad"
                                maxLength={2}
                                placeholder="MM"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                        <View style={datePickerStyles.inputGroup}>
                            <Text style={[datePickerStyles.label, { color: colors.textSecondary }]}>Year</Text>
                            <TextInput
                                style={[datePickerStyles.input, {
                                    backgroundColor: colors.surfaceHighlight,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={year}
                                onChangeText={setYear}
                                keyboardType="number-pad"
                                maxLength={4}
                                placeholder="YYYY"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                    </View>
                    <View style={datePickerStyles.buttonRow}>
                        <TouchableOpacity
                            style={[datePickerStyles.cancelButton, {
                                backgroundColor: colors.surfaceHighlight,
                                borderColor: colors.border
                            }]}
                            onPress={onClose}
                        >
                            <Text style={[datePickerStyles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[datePickerStyles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={handleConfirm}
                        >
                            <Text style={datePickerStyles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const datePickerStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 6,
    },
    input: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 18,
        textAlign: 'center',
        borderWidth: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export const CreateAssignmentScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colors = useThemeColors();
    const { isDark } = useTheme();
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [newRequirement, setNewRequirement] = useState('');

    const {
        formData,
        files,
        errors,
        isSubmitting,
        setType,
        setTitle,
        setDescription,
        setDeadline,
        setBudget,
        setFiles,
        addRequirement,
        removeRequirement,
        submit,
    } = useCreateAssignment();

    const handleBack = () => {
        router.back();
    };

    const handleAddRequirement = () => {
        if (newRequirement.trim()) {
            addRequirement(newRequirement.trim());
            setNewRequirement('');
        }
    };

    const handleSubmit = async () => {
        console.log('📝 handleSubmit called, formData:', formData);
        try {
            const assignment = await submit();
            console.log('✅ Assignment created:', assignment);
            if (assignment) {
                const uploadWarning = (assignment as any)._uploadWarning;
                const message = uploadWarning
                    ? `Your assignment has been created!\n\n${uploadWarning}`
                    : 'Your assignment request has been created. We will assign an Alpha soon.';

                Alert.alert(
                    'Success!',
                    message,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                console.log('⚠️ Validation failed, check form errors');
                Alert.alert(
                    'Validation Error',
                    'Please check the form for errors:\n• Title must be at least 5 characters\n• Description must be at least 20 characters\n• Deadline and budget are required',
                    [{ text: 'OK' }]
                );
            }
        } catch (err: any) {
            console.error('❌ Assignment creation failed:', err);
            Alert.alert('Error', err.message || 'Failed to create assignment');
        }
    };

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleSelectDate = (date: Date) => {
        setDeadline(date);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select deadline';
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Dynamic styles
    const dynamicStyles = {
        input: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        },
        requirementItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            backgroundColor: colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        dateButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: colors.border,
        },
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                backgroundColor: colors.surface,
                borderBottomColor: colors.border
            }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Assignment</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Assignment Type */}
                <AssignmentTypeSelector
                    value={formData.type}
                    onChange={setType}
                />
                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

                {/* Title */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Title</Text>
                    <TextInput
                        style={[dynamicStyles.input, errors.title && styles.inputError]}
                        value={formData.title}
                        onChangeText={setTitle}
                        placeholder="e.g., Data Structures Assignment"
                        placeholderTextColor={colors.textTertiary}
                        maxLength={200}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                    <TextInput
                        style={[dynamicStyles.input, styles.textArea, errors.description && styles.inputError]}
                        value={formData.description}
                        onChangeText={setDescription}
                        placeholder="Describe what you need help with..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                </View>

                {/* Requirements */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Requirements (optional)</Text>
                    <View style={styles.requirementInputRow}>
                        <TextInput
                            style={[dynamicStyles.input, styles.requirementInput]}
                            value={newRequirement}
                            onChangeText={setNewRequirement}
                            placeholder="Add a requirement..."
                            placeholderTextColor={colors.textTertiary}
                            onSubmitEditing={handleAddRequirement}
                        />
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={handleAddRequirement}
                        >
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    {formData.requirements.map((req, index) => (
                        <View key={index} style={dynamicStyles.requirementItem}>
                            <View style={styles.requirementTextContainer}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeRequirement(index)}>
                                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Attachments */}
                <FileUploadArea
                    files={files}
                    onChange={setFiles}
                    maxFiles={5}
                    isUploading={isSubmitting}
                />

                {/* Deadline */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Deadline</Text>
                    <TouchableOpacity
                        style={[dynamicStyles.dateButton, errors.deadline && styles.inputError]}
                        onPress={showDatePicker}
                    >
                        <View style={styles.dateContent}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Text style={[
                                styles.dateText,
                                { color: formData.deadline ? colors.text : colors.textTertiary }
                            ]}>
                                {formatDate(formData.deadline)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                    {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
                </View>

                <SimpleDatePicker
                    visible={isDatePickerVisible}
                    onClose={hideDatePicker}
                    onSelect={handleSelectDate}
                    currentDate={formData.deadline}
                    colors={colors}
                    isDark={isDark}
                />

                {/* Budget */}
                <BudgetInput
                    value={formData.budget}
                    onChange={setBudget}
                    error={errors.budget}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Creating...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Create Assignment</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 60,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    requirementInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    requirementInput: {
        flex: 1,
    },
    addButton: {
        width: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    requirementTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    requirementText: {
        fontSize: 14,
    },
    dateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateText: {
        fontSize: 16,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
        marginLeft: 4,
    },
});

export default CreateAssignmentScreen;
