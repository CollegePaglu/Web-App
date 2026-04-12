import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';

export const AssignmentsListScreen: React.FC = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();

    const handleCreate = useCallback(() => {
        console.log('🚀 Navigating to create-assignment screen...');
        router.push('/(main)/create-assignment');
    }, [router]);

    const styles = {
        container: {
            flex: 1,
            backgroundColor: colors.background, // Dynamic background
        },
        content: {
            paddingHorizontal: 20,
            paddingTop: 32,
        },
        header: {
            alignItems: 'center' as const,
            marginBottom: 28,
        },
        iconWrapper: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.surfaceHighlight, // Dynamic
            borderWidth: 3,
            borderColor: colors.primary + '40', // 25% opacity
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginBottom: 20,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
        },
        title: {
            fontSize: 30,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center' as const,
            letterSpacing: -0.5,
        },
        subtitle: {
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center' as const,
            lineHeight: 22,
            maxWidth: 300,
        },
        createButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.surface,
            borderWidth: 2.5,
            borderColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 18,
            borderRadius: 16,
            marginBottom: 32,
            gap: 14,
            justifyContent: 'center' as const,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
        },
        createButtonText: {
            fontSize: 17,
            fontWeight: '700' as const,
            color: colors.primary,
            letterSpacing: 0.2,
        },
        featuresContainer: {
            gap: 12,
            marginBottom: 24,
        },
        featureItem: {
            flexDirection: 'row' as const,
            alignItems: 'flex-start' as const,
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingHorizontal: 18,
            paddingVertical: 16,
            gap: 14,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.borderHighlight,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
        },
        featureIcon: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: colors.surfaceHighlight,
            borderWidth: 2,
            borderColor: colors.borderHighlight,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginTop: 2,
            flexShrink: 0,
        },
        featureTitle: {
            fontSize: 16,
            fontWeight: '700' as const,
            color: colors.text,
            marginBottom: 4,
            letterSpacing: -0.2,
        },
        featureDesc: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        infoBox: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.surfaceHighlight,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            gap: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        infoText: {
            fontSize: 14,
            color: colors.textSecondary,
            flex: 1,
            lineHeight: 20,
        },
        infoBold: {
            fontWeight: '700' as const,
            color: colors.primary,
        },
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Create Assignment</Text>
                    <Text style={styles.subtitle}>
                        Post your assignment and get matched with verified experts
                    </Text>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreate}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                    <Text style={styles.createButtonText}>Create New Assignment</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                        </View>
                        <View>
                            <Text style={styles.featureTitle}>Verified Experts</Text>
                            <Text style={styles.featureDesc}>All professionals are verified</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="lock-closed" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.featureTitle}>Secure Payments</Text>
                            <Text style={styles.featureDesc}>Safe until completion</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="checkmark-done" size={20} color="#F59E0B" />
                        </View>
                        <View>
                            <Text style={styles.featureTitle}>Quality Guaranteed</Text>
                            <Text style={styles.featureDesc}>Review before payment</Text>
                        </View>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={18} color={colors.primary} />
                    <Text style={styles.infoText}>View all your created assignments in the <Text style={styles.infoBold}>Orders</Text> tab</Text>
                </View>
            </View>
        </ScrollView>
    );
};
