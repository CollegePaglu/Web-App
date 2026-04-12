/**
 * FileUploadArea Component
 * 
 * Upload area for images and PDFs with preview and size validation
 * Theme-aware: Supports light and dark modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useThemeColors, useTheme } from '@/context/ThemeContext';

// File size limits (matching backend)
const FILE_LIMITS = {
    MAX_IMAGE_SIZE_MB: 5,
    MAX_PDF_SIZE_MB: 10,
    MAX_FILES: 5,
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    ALLOWED_DOC_TYPES: ['pdf'],
};

interface UploadedFile {
    uri: string;
    type: string;
    name: string;
    size?: number; // Size in bytes
}

interface FileUploadAreaProps {
    files: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
    maxFiles?: number;
    isUploading?: boolean;
}

// Format bytes to human readable size
const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get file size from URI
const getFileSize = async (uri: string): Promise<number> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } catch {
        return 0;
    }
};

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    files,
    onChange,
    maxFiles = FILE_LIMITS.MAX_FILES,
    isUploading = false,
}) => {
    const colors = useThemeColors();
    const { isDark } = useTheme();

    const pickImage = async () => {
        if (files.length >= maxFiles) {
            Alert.alert('Limit Reached', `You can only upload ${maxFiles} files`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: maxFiles - files.length,
        });

        if (!result.canceled && result.assets) {
            const validFiles: UploadedFile[] = [];
            const oversizedFiles: string[] = [];

            for (const asset of result.assets) {
                const size = await getFileSize(asset.uri);
                const sizeMB = size / (1024 * 1024);

                if (sizeMB > FILE_LIMITS.MAX_IMAGE_SIZE_MB) {
                    oversizedFiles.push(`${asset.fileName || 'Image'} (${formatFileSize(size)})`);
                } else {
                    validFiles.push({
                        uri: asset.uri,
                        type: asset.mimeType || 'image/jpeg',
                        name: asset.fileName || `image_${Date.now()}_${validFiles.length}.jpg`,
                        size,
                    });
                }
            }

            if (oversizedFiles.length > 0) {
                Alert.alert(
                    'File Too Large',
                    `The following images exceed the ${FILE_LIMITS.MAX_IMAGE_SIZE_MB}MB limit:\n\n${oversizedFiles.join('\n')}\n\nPlease select smaller images.`,
                    [{ text: 'OK' }]
                );
            }

            if (validFiles.length > 0) {
                onChange([...files, ...validFiles].slice(0, maxFiles));
            }
        }
    };

    const pickDocument = async () => {
        if (files.length >= maxFiles) {
            Alert.alert('Limit Reached', `You can only upload ${maxFiles} files`);
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                multiple: true,
            });

            if (!result.canceled) {
                const selectedAssets = result.assets || [];
                const validFiles: UploadedFile[] = [];
                const oversizedFiles: string[] = [];

                for (const asset of selectedAssets.slice(0, maxFiles - files.length)) {
                    const size = asset.size || await getFileSize(asset.uri);
                    const sizeMB = size / (1024 * 1024);

                    if (sizeMB > FILE_LIMITS.MAX_PDF_SIZE_MB) {
                        oversizedFiles.push(`${asset.name} (${formatFileSize(size)})`);
                    } else {
                        validFiles.push({
                            uri: asset.uri,
                            type: asset.mimeType || 'application/pdf',
                            name: asset.name || `document_${Date.now()}.pdf`,
                            size,
                        });
                    }
                }

                if (oversizedFiles.length > 0) {
                    Alert.alert(
                        'File Too Large',
                        `The following PDFs exceed the ${FILE_LIMITS.MAX_PDF_SIZE_MB}MB limit:\n\n${oversizedFiles.join('\n')}\n\nPlease select smaller files.`,
                        [{ text: 'OK' }]
                    );
                }

                if (validFiles.length > 0) {
                    onChange([...files, ...validFiles].slice(0, maxFiles));
                }
            }
        } catch (err) {
            console.error('Document picker error:', err);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    const isPdf = (file: UploadedFile) =>
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    // Dynamic styles
    const dynamicStyles = {
        uploadButton: {
            flex: 1,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: 8,
            backgroundColor: colors.surfaceHighlight,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed' as const,
            borderRadius: 12,
            paddingVertical: 16,
        },
        pdfPreview: {
            width: 80,
            height: 80,
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 8,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            padding: 4,
        },
        imagePreview: {
            width: 80,
            height: 80,
            borderRadius: 8,
            backgroundColor: colors.surfaceHighlight,
        },
        removeButton: {
            position: 'absolute' as const,
            top: -6,
            right: -6,
            backgroundColor: colors.background,
            borderRadius: 11,
        },
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Reference Attachments</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Images (max {FILE_LIMITS.MAX_IMAGE_SIZE_MB}MB) • PDFs (max {FILE_LIMITS.MAX_PDF_SIZE_MB}MB) • Up to {maxFiles} files
            </Text>

            {/* Upload Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={dynamicStyles.uploadButton}
                    onPress={pickImage}
                    disabled={isUploading || files.length >= maxFiles}
                >
                    <Ionicons name="image-outline" size={20} color={colors.primary} />
                    <Text style={[styles.buttonText, { color: colors.primary }]}>Images</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={dynamicStyles.uploadButton}
                    onPress={pickDocument}
                    disabled={isUploading || files.length >= maxFiles}
                >
                    <Ionicons name="document-outline" size={20} color="#4A9EFF" />
                    <Text style={[styles.buttonText, { color: '#4A9EFF' }]}>PDF</Text>
                </TouchableOpacity>
            </View>

            {/* File Previews */}
            {files.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.previewScroll}
                >
                    {files.map((file, index) => (
                        <View key={`${file.uri}-${index}`} style={styles.previewItem}>
                            {isPdf(file) ? (
                                <View style={dynamicStyles.pdfPreview}>
                                    <Ionicons name="document" size={28} color="#EF4444" />
                                    <Text style={[styles.pdfLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {file.name}
                                    </Text>
                                    {file.size && file.size > 0 ? (
                                        <Text style={[styles.fileSize, { color: colors.textTertiary }]}>{formatFileSize(file.size)}</Text>
                                    ) : null}
                                </View>
                            ) : (
                                <View>
                                    <Image source={{ uri: file.uri }} style={dynamicStyles.imagePreview} />
                                    {file.size && file.size > 0 ? (
                                        <Text style={[styles.imageSizeLabel, { color: colors.textSecondary }]}>{formatFileSize(file.size)}</Text>
                                    ) : null}
                                </View>
                            )}
                            <TouchableOpacity
                                style={dynamicStyles.removeButton}
                                onPress={() => removeFile(index)}
                            >
                                <Ionicons name="close-circle" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <Text style={[styles.uploadingText, { color: colors.text }]}>Uploading...</Text>
                </View>
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    previewScroll: {
        marginTop: 16,
    },
    previewItem: {
        marginRight: 12,
        position: 'relative',
    },
    pdfLabel: {
        fontSize: 9,
        marginTop: 2,
        textAlign: 'center',
    },
    fileSize: {
        fontSize: 8,
        marginTop: 2,
        textAlign: 'center',
    },
    imageSizeLabel: {
        fontSize: 8,
        textAlign: 'center',
        marginTop: 2,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    uploadingText: {
        fontSize: 14,
    },
});

export default FileUploadArea;
