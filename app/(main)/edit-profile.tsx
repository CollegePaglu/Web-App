/**
 * Edit Profile Screen
 * 
 * Allows users to update their profile details.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { Button } from '../../src/components/ui/Button';
import { useAuth, useCurrentUser } from '../../src/features/auth';
import { userService } from '../../src/features/user';
import { spacing } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { AppImage } from '../../src/components/ui/AppImage';

// Basic Input Component tailored for this screen
const ProfileInput = ({ label, value, onChangeText, placeholder, multiline = false, numberOfLines = 1, keyboardType = 'default', maxLength = undefined, textAlignVertical = 'center' }: any) => {
    const colors = useThemeColors();
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>{label}</Text>
            <TextInput
                style={{
                    backgroundColor: colors.inputBackground,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                    minHeight: multiline ? 80 : 48,
                    textAlignVertical: textAlignVertical as any,
                }}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );
};

export default function EditProfileScreen() {
    const user = useCurrentUser();
    const { refreshUser } = useAuth();
    const colors = useThemeColors();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        collegeName: '',
        collegeDept: '',
        collegeYear: '',
        rollNumber: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const handlePhotoUpload = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your photo.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsUploadingPhoto(true);
                await userService.uploadAvatar(result.assets[0].uri);
                await refreshUser();
                Alert.alert('Success', 'Profile photo updated successfully!');
            }
        } catch (error: any) {
            console.error('Photo upload error:', error);
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to upload photo');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // Load initial data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                collegeName: user.college?.name || '',
                collegeDept: user.college?.department || '',
                collegeYear: user.college?.year ? String(user.college.year) : '',
                rollNumber: user.college?.rollNumber || '',
            });
        }
    }, [user]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            Alert.alert('Error', 'First name and last name are required');
            return;
        }

        try {
            setIsSubmitting(true);

            await userService.updateProfile({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                bio: formData.bio.trim(),
                college: {
                    name: formData.collegeName.trim(),
                    department: formData.collegeDept.trim(),
                    year: parseInt(formData.collegeYear) || undefined,
                    rollNumber: formData.rollNumber.trim(),
                }
            });

            await refreshUser();
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerStyle = {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    };

    return (
        <SafeArea edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={headerStyle}>
                <View style={styles.headerLeft}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.text}
                        onPress={() => router.back()}
                    />
                    <Text variant="h3" style={{ marginLeft: 16, color: colors.text }}>Edit Profile</Text>
                </View>
                <Button
                    title="Save"
                    size="sm"
                    onPress={handleSave}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ backgroundColor: colors.primary }}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1, backgroundColor: colors.background }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.avatarSection}>
                        <TouchableOpacity activeOpacity={0.8} onPress={handlePhotoUpload} disabled={isUploadingPhoto}>
                            <View style={[styles.avatarContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                {user?.avatar ? (
                                    <AppImage uri={user.avatar} style={styles.avatar} contentFit="cover" />
                                ) : (
                                    <Ionicons name="person" size={40} color={colors.textTertiary} />
                                )}
                                {isUploadingPhoto && (
                                    <View style={styles.avatarLoadingOverlay}>
                                        <ActivityIndicator color="#ffffff" />
                                    </View>
                                )}
                                <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                                    <Ionicons name="camera" size={14} color="#ffffff" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
                            Update Profile Picture
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text variant="h4" style={{ marginBottom: 16, color: colors.textSecondary }}>Personal Info</Text>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <ProfileInput
                                    label="First Name"
                                    value={formData.firstName}
                                    onChangeText={(text: string) => handleChange('firstName', text)}
                                    placeholder="First Name"
                                />
                            </View>
                            <View style={[styles.halfInput, { marginLeft: 12 }]}>
                                <ProfileInput
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChangeText={(text: string) => handleChange('lastName', text)}
                                    placeholder="Last Name"
                                />
                            </View>
                        </View>

                        <ProfileInput
                            label="Bio"
                            value={formData.bio}
                            onChangeText={(text: string) => handleChange('bio', text)}
                            placeholder="Tell us about yourself..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text variant="h4" style={{ marginBottom: 16, color: colors.textSecondary }}>College Details</Text>

                        <ProfileInput
                            label="College Name"
                            value={formData.collegeName}
                            onChangeText={(text: string) => handleChange('collegeName', text)}
                            placeholder="College Name"
                        />

                        <ProfileInput
                            label="Department / Branch"
                            value={formData.collegeDept}
                            onChangeText={(text: string) => handleChange('collegeDept', text)}
                            placeholder="e.g. Computer Science"
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <ProfileInput
                                    label="Year"
                                    value={formData.collegeYear}
                                    onChangeText={(text: string) => handleChange('collegeYear', text)}
                                    placeholder="1-5"
                                    keyboardType="numeric"
                                    maxLength={1}
                                />
                            </View>
                            <View style={[styles.halfInput, { marginLeft: 12 }]}>
                                <ProfileInput
                                    label="Roll Number"
                                    value={formData.rollNumber}
                                    onChangeText={(text: string) => handleChange('rollNumber', text)}
                                    placeholder="Roll No"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.footerSpace} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeArea>
    );
}

const styles = StyleSheet.create({
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    section: {
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
    },
    halfInput: {
        flex: 1,
    },
    footerSpace: {
        height: 40,
    },
});
