/**
 * In-app society registration form.
 * Calls /society-auth/register and shows "Pending admin approval" on success.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { useToast } from '../../src/providers';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, API_ENDPOINTS } from '../../src/api';
import { useThemeColors } from '@/context/ThemeContext';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface College {
    _id: string;
    name: string;
    location: string;
}

export default function SocietyRegistrationScreen() {
    const colors = useThemeColors();
    const { showError, showSuccess } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // College Fetching
    const [colleges, setColleges] = useState<College[]>([]);
    const [isCollegesLoading, setIsCollegesLoading] = useState(false);
    const [showCollegeModal, setShowCollegeModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        collegeId: '',
        collegeName: '',
        pocName: '',
        pocEmail: '',
        pocPhone: '',
    });

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async (search = '') => {
        setIsCollegesLoading(true);
        try {
            const response = await apiClient.get(API_ENDPOINTS.COLLEGES.LIST, {
                params: { search }
            });
            setColleges(response.data.data.colleges);
        } catch (error) {
            console.error('Failed to fetch colleges', error);
            showError('Error', 'Failed to load colleges');
        } finally {
            setIsCollegesLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectCollege = (college: College) => {
        setFormData(prev => ({
            ...prev,
            collegeId: college._id,
            collegeName: college.name
        }));
        setShowCollegeModal(false);
    };

    const handleRegister = async () => {
        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.collegeId ||
            !formData.pocName ||
            !formData.pocEmail ||
            !formData.pocPhone
        ) {
            showError('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                collegeId: formData.collegeId,
                poc: {
                    name: formData.pocName,
                    email: formData.pocEmail,
                    phone: formData.pocPhone,
                },
            };

            await apiClient.post(API_ENDPOINTS.SOCIETY.REGISTER, payload);

            showSuccess('Registration Successful', 'Your society has been registered. Please wait for admin approval before logging in.');
            router.back();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Registration failed';
            showError('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeArea edges={['top', 'bottom']} style={{ ...styles.safeArea, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                        Register Society
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={[styles.iconRing, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
                            <View style={[styles.iconInner, { backgroundColor: colors.surfaceHighlight }]}>
                                <Ionicons name="people" size={36} color={colors.primary} />
                            </View>
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>Create Society Account</Text>
                        <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
                            Register your college society. An admin will verify your application before you can log in.
                        </Text>
                    </View>

                    {/* Society Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Society Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Society Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="e.g. Debate Club"
                                placeholderTextColor={colors.textTertiary}
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Society Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="society@college.edu"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="Secure password"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(text) => handleChange('password', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>College</Text>
                            <TouchableOpacity
                                style={[styles.input, styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                                onPress={() => setShowCollegeModal(true)}
                            >
                                <Text style={{ fontSize: 16, color: formData.collegeName ? colors.text : colors.textTertiary }}>
                                    {formData.collegeName || 'Select your College'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* POC Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Point of Contact</Text>
                        <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                            Person managing this society account
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="John Doe"
                                placeholderTextColor={colors.textTertiary}
                                value={formData.pocName}
                                onChangeText={(text) => handleChange('pocName', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="john@example.com"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.pocEmail}
                                onChangeText={(text) => handleChange('pocEmail', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                                placeholder="+91 98765 43210"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="phone-pad"
                                value={formData.pocPhone}
                                onChangeText={(text) => handleChange('pocPhone', text)}
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color={colors.primaryForeground} />
                                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Register Society</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.replace('/(auth)/society-login')}
                    >
                        <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
                            Already registered?{' '}
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Login here</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* College Selection Modal */}
                <Modal visible={showCollegeModal} animationType="slide" presentationStyle="pageSheet">
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select College</Text>
                            <TouchableOpacity onPress={() => setShowCollegeModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Ionicons name="search" size={20} color={colors.textTertiary} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search college..."
                                placeholderTextColor={colors.textTertiary}
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    fetchColleges(text);
                                }}
                                autoFocus
                            />
                        </View>

                        {isCollegesLoading ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                        ) : (
                            <FlatList
                                data={colleges}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.collegeItem, { borderBottomColor: colors.border }]}
                                        onPress={() => handleSelectCollege(item)}
                                    >
                                        <Text style={[styles.collegeName, { color: colors.text }]}>{item.name}</Text>
                                        <Text style={[styles.collegeLocation, { color: colors.textSecondary }]}>{item.location}</Text>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.listContent}
                            />
                        )}
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeArea>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
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
        paddingHorizontal: spacing[5],
        paddingBottom: spacing[10],
    },
    hero: {
        alignItems: 'center',
        paddingTop: spacing[2],
        marginBottom: spacing[6],
    },
    iconRing: {
        padding: spacing[2],
        borderRadius: borderRadius['3xl'],
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing[4],
    },
    iconInner: {
        width: 72,
        height: 72,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.4,
        marginBottom: spacing[2],
    },
    heroBody: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 320,
    },
    card: {
        padding: spacing[5],
        borderRadius: borderRadius['2xl'],
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing[4],
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: spacing[1],
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: spacing[4],
    },
    inputGroup: {
        marginBottom: spacing[3],
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: spacing[1],
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing[4],
        fontSize: 15,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    submitBtn: {
        height: 52,
        borderRadius: borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        marginTop: spacing[2],
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: spacing[4],
    },
    loginLinkText: {
        fontSize: 14,
    },
    // Modal
    modalContent: {
        flex: 1,
        padding: spacing[6],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[5],
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing[3],
        height: 48,
        marginBottom: spacing[4],
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing[2],
        fontSize: 16,
    },
    listContent: {
        paddingBottom: spacing[6],
    },
    collegeItem: {
        paddingVertical: spacing[4],
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    collegeName: {
        fontSize: 16,
        fontWeight: '600',
    },
    collegeLocation: {
        fontSize: 14,
        marginTop: 2,
    },
});
