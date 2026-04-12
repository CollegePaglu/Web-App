/**
 * Support Screen
 * 
 * Help & Support with FAQs and Contact Agent options
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'community' | 'campusmart' | 'assignment' | 'lazypeeps';
}

const FAQS: FAQ[] = [
    // 👥 COMMUNITY MODULE FAQs
    {
        id: '1',
        question: 'How do I post in the community?',
        answer: 'Go to Community → Create Post → Add content → Publish.',
        category: 'community',
    },
    {
        id: '2',
        question: 'Why was my post removed?',
        answer: 'Posts violating guidelines (spam, abusive content, promotions) are removed.',
        category: 'community',
    },
    {
        id: '3',
        question: 'How do I report inappropriate content?',
        answer: 'Click on "Report" under the post.',
        category: 'community',
    },
    {
        id: '4',
        question: 'I am facing issues submitting a complaint in Community.',
        answer: 'Please try refreshing the page or clearing cache. If the issue continues, raise a support ticket.',
        category: 'community',
    },
    // 🛍 CAMPUSMART FAQs
    {
        id: '5',
        question: 'My order is not visible. What should I do?',
        answer: 'Check "My Orders", refresh app, log out & log in again. If still missing, raise a ticket with order ID.',
        category: 'campusmart',
    },
    {
        id: '6',
        question: 'I uploaded an assignment but it is not showing.',
        answer: 'Ensure file size is within limit. Supported formats: PDF, DOCX. Check internet connection. If not resolved, re-upload or contact support.',
        category: 'campusmart',
    },
    {
        id: '7',
        question: 'My payment was deducted but order failed.',
        answer: 'Payment refunds are processed within 5–7 working days. Share transaction ID in ticket.',
        category: 'campusmart',
    },
    {
        id: '8',
        question: 'How can I cancel my order?',
        answer: 'Orders can be canceled before confirmation. Go to Order → Cancel.',
        category: 'campusmart',
    },
    {
        id: '9',
        question: 'I received wrong or incomplete order.',
        answer: 'Report within 24 hours via Order → Report Issue.',
        category: 'campusmart',
    },
    // 📚 ASSIGNMENT / ACADEMIC SUPPORT FAQs
    {
        id: '10',
        question: 'Alpha has not delivered my assignment.',
        answer: 'Check delivery timeline. If delayed beyond committed time, raise a ticket.',
        category: 'assignment',
    },
    {
        id: '11',
        question: 'Can I request revision?',
        answer: 'Yes, within 48 hours of delivery.',
        category: 'assignment',
    },
    {
        id: '12',
        question: 'What if I am not satisfied with the assignment?',
        answer: 'Request revision first. If still not satisfied, escalate via support.',
        category: 'assignment',
    },
    // 💤 LAZYPEEPS FAQs
    {
        id: '13',
        question: 'How does LazyPeeps work?',
        answer: 'You submit a task → A verified student accepts → Task completed → Payment processed.',
        category: 'lazypeeps',
    },
    {
        id: '14',
        question: 'How is pricing calculated?',
        answer: 'Based on task complexity, urgency, and distance (if physical).',
        category: 'lazypeeps',
    },
    {
        id: '15',
        question: 'What if the task is not completed?',
        answer: 'You can report the issue. Refund policy applies after review.',
        category: 'lazypeeps',
    },
    {
        id: '16',
        question: 'Can I become a LazyPeeps task performer?',
        answer: 'Yes. Apply via "Become a Contributor" section.',
        category: 'lazypeeps',
    },
];

const SUPPORT_WHATSAPP = '918595051170';

export default function SupportScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleContactAgent = () => {
        const message = encodeURIComponent('Hi, I need help with CollegePaglu app.');
        Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`)
            .catch(() => {
                Alert.alert('Error', 'Could not open WhatsApp');
            });
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Help & Support',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
                {/* FAQs Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Frequently Asked Questions
                    </Text>

                    {/* Community FAQs */}
                    <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                        👥 Community
                    </Text>
                    {FAQS.filter(f => f.category === 'community').map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => toggleFaq(faq.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons
                                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* CampusMart FAQs */}
                    <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                        🛍️ CampusMart
                    </Text>
                    {FAQS.filter(f => f.category === 'campusmart').map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => toggleFaq(faq.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons
                                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Assignment FAQs */}
                    <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                        📚 Assignment Support
                    </Text>
                    {FAQS.filter(f => f.category === 'assignment').map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => toggleFaq(faq.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons
                                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* LazyPeeps FAQs */}
                    <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                        💤 LazyPeeps
                    </Text>
                    {FAQS.filter(f => f.category === 'lazypeeps').map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => toggleFaq(faq.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons
                                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contact Support Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Contact Support
                    </Text>

                    <TouchableOpacity
                        style={[styles.contactItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={handleContactAgent}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#25D366' }]}>
                            <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.contactContent}>
                            <Text style={[styles.contactTitle, { color: colors.text }]}>
                                Contact Agent
                            </Text>
                            <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                                Chat with us on WhatsApp
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appVersion, { color: colors.textTertiary }]}>
                        CollegePaglu v1.0.0
                    </Text>
                    <Text style={[styles.copyright, { color: colors.textTertiary }]}>
                        Made with ❤️ for students
                    </Text>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
    },
    faqItem: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactContent: {
        flex: 1,
        marginLeft: 16,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    appVersion: {
        fontSize: 13,
    },
    copyright: {
        fontSize: 12,
        marginTop: 4,
    },
});
