import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { PrintoutConfig } from '../hooks/useLazyPeeps';
import { useThemeColors } from '@/context/ThemeContext';
import { PageSelector } from './PageSelector';
import { PageConfig } from '../services/LazyPeepsService';

interface PrintoutServiceProps {
    selectedFile: DocumentPicker.DocumentPickerAsset | null;
    onFilePick: () => void;
    config: PrintoutConfig;
    onConfigChange: (key: keyof PrintoutConfig, value: number | boolean) => void;
    onOrder: () => void;
    loading?: boolean;
    uploading?: boolean;
    // Page analysis props
    analyzing?: boolean;
    pageConfigs?: PageConfig[];
    analysisError?: string | null;
    onPageToggle?: (pageNumber: number) => void;
    onPageModeChange?: (pageNumber: number, mode: 'bw' | 'color') => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onAllBW?: () => void;
    onAllColor?: () => void;
    calculatedTotal?: number;
}

export const PrintoutService: React.FC<PrintoutServiceProps> = ({
    selectedFile,
    onFilePick,
    config,
    onConfigChange,
    onOrder,
    loading,
    uploading,
    // Page analysis props
    analyzing,
    pageConfigs = [],
    analysisError,
    onPageToggle,
    onPageModeChange,
    onSelectAll,
    onDeselectAll,
    onAllBW,
    onAllColor,
    calculatedTotal,
}) => {
    const colors = useThemeColors();

    // Use calculated total from pages if available, otherwise use config-based
    const hasPageAnalysis = pageConfigs.length > 0;
    const fallbackTotal = (config.bwPages * 2) + (config.colorPages * 10) + (config.binding ? 30 : 0);
    const totalCost = calculatedTotal !== undefined ? calculatedTotal : fallbackTotal;

    // Check if any pages are selected
    const selectedPagesCount = pageConfigs.filter(p => p.selected).length;
    const canOrder = hasPageAnalysis ? selectedPagesCount > 0 : (config.bwPages > 0 || config.colorPages > 0);

    const dynamicStyles = {
        uploadArea: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        section: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        text: {
            color: colors.text,
        },
        subtext: {
            color: colors.textSecondary,
        },
        counter: {
            backgroundColor: colors.surfaceHighlight,
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* File Upload Area */}
            <TouchableOpacity
                style={[
                    styles.uploadArea,
                    dynamicStyles.uploadArea,
                    selectedFile && {
                        borderColor: colors.primary,
                        backgroundColor: colors.surfaceHighlight,
                        borderStyle: 'solid' as const
                    }
                ]}
                onPress={onFilePick}
                disabled={uploading || analyzing}
            >
                {selectedFile ? (
                    <View style={styles.fileInfo}>
                        <Ionicons name="document-text" size={40} color={colors.primary} />
                        <Text style={[styles.fileName, dynamicStyles.text]}>{selectedFile.name}</Text>
                        <Text style={[styles.fileSize, dynamicStyles.subtext]}>{(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB</Text>
                        {uploading && <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 10 }}>Uploading...</Text>}
                        {analyzing && <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 10 }}>Analyzing pages...</Text>}
                    </View>
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <Ionicons name="cloud-upload-outline" size={64} color={colors.primary} />
                        <Text style={[styles.uploadText, dynamicStyles.text]}>Tap to Upload File</Text>
                        <Text style={[styles.uploadSubtext, dynamicStyles.subtext]}>PDF, DOCX supported</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Page Selector - Shows after analysis */}
            {selectedFile && onPageToggle && onPageModeChange && onSelectAll && onDeselectAll && onAllBW && onAllColor && (
                <PageSelector
                    pages={pageConfigs}
                    onPageToggle={onPageToggle}
                    onModeChange={onPageModeChange}
                    onSelectAll={onSelectAll}
                    onDeselectAll={onDeselectAll}
                    onAllBW={onAllBW}
                    onAllColor={onAllColor}
                    analyzing={analyzing}
                />
            )}

            {/* Analysis Error Message */}
            {analysisError && (
                <View style={[styles.errorBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.destructive }]}>
                    <Ionicons name="warning" size={20} color={colors.destructive} />
                    <Text style={[styles.errorText, { color: colors.destructive }]}>
                        {analysisError}
                    </Text>
                    <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
                        Use manual settings below instead
                    </Text>
                </View>
            )}

            {/* Manual Configuration - Shows as fallback or when no page analysis */}
            {(!hasPageAnalysis || analysisError) && (
                <View style={[styles.section, dynamicStyles.section]}>
                    <Text style={[styles.sectionTitle, dynamicStyles.text]}>Print Preferences</Text>

                    <View style={styles.row}>
                        <Text style={[styles.label, dynamicStyles.text]}>B&W Pages (₹2)</Text>
                        <View style={[styles.counter, dynamicStyles.counter]}>
                            <TouchableOpacity onPress={() => onConfigChange('bwPages', Math.max(0, config.bwPages - 1))}>
                                <Ionicons name="remove-circle" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={[styles.count, dynamicStyles.text]}>{config.bwPages}</Text>
                            <TouchableOpacity onPress={() => onConfigChange('bwPages', config.bwPages + 1)}>
                                <Ionicons name="add-circle" size={28} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={[styles.label, dynamicStyles.text]}>Color Pages (₹10)</Text>
                        <View style={[styles.counter, dynamicStyles.counter]}>
                            <TouchableOpacity onPress={() => onConfigChange('colorPages', Math.max(0, config.colorPages - 1))}>
                                <Ionicons name="remove-circle" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Text style={[styles.count, dynamicStyles.text]}>{config.colorPages}</Text>
                            <TouchableOpacity onPress={() => onConfigChange('colorPages', config.colorPages + 1)}>
                                <Ionicons name="add-circle" size={28} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={[styles.label, dynamicStyles.text]}>Binding (₹30)</Text>
                        <Switch
                            value={config.binding}
                            onValueChange={(val) => onConfigChange('binding', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={'#ffffff'}
                        />
                    </View>
                </View>
            )}

            {/* Binding Option - Always show if pages are analyzed */}
            {hasPageAnalysis && !analysisError && (
                <View style={[styles.section, dynamicStyles.section]}>
                    <View style={styles.row}>
                        <Text style={[styles.label, dynamicStyles.text]}>Add Binding (₹30)</Text>
                        <Switch
                            value={config.binding}
                            onValueChange={(val) => onConfigChange('binding', val)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={'#ffffff'}
                        />
                    </View>
                </View>
            )}

            {/* Total & Action */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.totalSection}>
                    <Text style={[styles.totalLabel, dynamicStyles.subtext]}>Total Estimate</Text>
                    <Text style={[styles.totalPrice, { color: colors.primary }]}>₹{totalCost}</Text>
                    {hasPageAnalysis && (
                        <Text style={[styles.pagesInfo, dynamicStyles.subtext]}>
                            {selectedPagesCount} page{selectedPagesCount !== 1 ? 's' : ''} selected
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.orderBtn, (!selectedFile || loading || uploading || analyzing || !canOrder) && styles.disabledBtn, { backgroundColor: colors.primary }]}
                    onPress={onOrder}
                    disabled={!selectedFile || loading || uploading || analyzing || !canOrder}
                >
                    <Text style={styles.orderBtnText} numberOfLines={1}>
                        {loading ? 'Placing...' : analyzing ? 'Analyzing...' : 'Add to Cart'}
                    </Text>
                    <Ionicons name="cart" size={18} color={'#FFFFFF'} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 100,
    },
    uploadArea: {
        height: 180,
        borderRadius: 24,
        borderWidth: 3,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    fileInfo: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    fileName: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 12,
        textAlign: 'center',
    },
    fileSize: {
        fontSize: 14,
        marginTop: 6,
        fontWeight: '500',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    uploadSubtext: {
        fontSize: 14,
        marginTop: 6,
        fontWeight: '500',
    },
    section: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
    },
    count: {
        fontSize: 20,
        fontWeight: '800',
        minWidth: 32,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        gap: 12,
    },
    totalSection: {
        flex: 1,
        minWidth: 0,
    },
    totalLabel: {
        fontSize: 12,
        marginBottom: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    totalPrice: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    pagesInfo: {
        fontSize: 12,
        marginTop: 2,
    },
    orderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        flexShrink: 0,
    },
    disabledBtn: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    orderBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    errorBox: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        gap: 4,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 12,
        textAlign: 'center',
    },
});
