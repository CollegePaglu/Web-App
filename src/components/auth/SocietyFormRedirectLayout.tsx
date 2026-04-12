/**
 * Shared UI for society login / registration while using the external Google Form.
 */

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeArea } from '@/components/layout/SafeArea';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useThemeColors } from '@/context/ThemeContext';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export const SOCIETY_REGISTRATION_FORM_URL = 'https://forms.gle/TgVSuHH3G6Z8s2Do9';

export interface SocietyFormRedirectLayoutProps {
    /** Navbar title */
    title: string;
    /** Main headline below the icon */
    heroLabel: string;
    onBack: () => void;
    /** Open the form URL as soon as the screen mounts */
    openOnMount?: boolean;
}

export function SocietyFormRedirectLayout({
    title,
    heroLabel,
    onBack,
    openOnMount = true,
}: SocietyFormRedirectLayoutProps) {
    const colors = useThemeColors();

    const openForm = useCallback(() => {
        Linking.openURL(SOCIETY_REGISTRATION_FORM_URL).catch((err) =>
            console.warn('Could not open society form', err),
        );
    }, []);

    useEffect(() => {
        if (openOnMount) openForm();
    }, [openForm, openOnMount]);

    return (
        <SafeArea edges={['top', 'bottom']} style={{ ...styles.safe, backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onBack}
                    style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.hero}>
                    <View
                        style={[
                            styles.iconRing,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            shadows.sm,
                        ]}
                    >
                        <View style={[styles.iconInner, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="people" size={40} color={colors.primary} />
                        </View>
                    </View>

                    <Text style={[styles.heroTitle, { color: colors.text }]}>{heroLabel}</Text>
                    <Text style={[styles.body, { color: colors.textSecondary }]}>
                        Complete society registration on our official Google Form. It should open in your browser
                        automatically—use the button below if it did not.
                    </Text>
                </View>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        shadows.soft,
                    ]}
                >
                    <View style={styles.cardMeta}>
                        <Ionicons name="logo-google" size={18} color={colors.textTertiary} />
                        <Text style={[styles.cardMetaText, { color: colors.textTertiary }]}>
                            Google Forms · College Paglu
                        </Text>
                    </View>
                    <Button
                        title="Open registration form"
                        onPress={openForm}
                        fullWidth
                        size="lg"
                        leftIcon={<Ionicons name="open-outline" size={20} color={colors.primaryForeground} />}
                    />
                </View>
            </ScrollView>
        </SafeArea>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        gap: spacing[3],
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    scrollContent: {
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[10],
    },
    hero: {
        alignItems: 'center',
        paddingTop: spacing[4],
    },
    iconRing: {
        padding: spacing[2],
        borderRadius: borderRadius['3xl'],
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing[6],
    },
    iconInner: {
        width: 88,
        height: 88,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.4,
        marginBottom: spacing[3],
        paddingHorizontal: spacing[2],
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 340,
        alignSelf: 'center',
    },
    card: {
        marginTop: spacing[8],
        padding: spacing[5],
        borderRadius: borderRadius['2xl'],
        borderWidth: StyleSheet.hairlineWidth,
        gap: spacing[4],
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    cardMetaText: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});
