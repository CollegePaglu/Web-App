/**
 * PRESERVED — not used by routing while the external Google Form is in use.
 * To restore in-app registration: move this implementation back into `society-registration.tsx`
 * (or re-export from there as default).
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
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, API_ENDPOINTS } from '../../src/api';

// Reusing colors from phone-input.tsx for consistency
const COLORS = {
    background: '#FFFFFF',
    black: '#000000',
    gray: '#666666',
    lightGray: '#E0E0E0',
    inputBorder: '#E0E0E0',
    inputBg: '#FFFFFF',
    error: '#E53935',
    placeholder: '#BDBDBD',
};

interface College {
    _id: string;
    name: string;
    location: string;
}

export default function SocietyRegistrationScreen() {
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
        collegeName: '', // Display only
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
        // Basic Validation
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

            // Use centralized API client
            await apiClient.post(API_ENDPOINTS.SOCIETY.REGISTER, payload);

            showSuccess('Registration Successful', 'Please wait for admin approval.');
            router.back(); // Go back to login
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Registration failed';
            showError('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeArea edges={['top', 'bottom']} style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Register Society</Text>
                    </View>

                    <Text style={styles.subtitle}>
                        Create an account for your college society.
                    </Text>

                    {/* Society Details Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Society Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Society Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Debate Club"
                                placeholderTextColor={COLORS.placeholder}
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Society Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="society@college.edu"
                                placeholderTextColor={COLORS.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Secure password"
                                placeholderTextColor={COLORS.placeholder}
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(text) => handleChange('password', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>College</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowCollegeModal(true)}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    color: formData.collegeName ? COLORS.black : COLORS.placeholder,
                                    lineHeight: 50
                                }}>
                                    {formData.collegeName || "Select your College"}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.helperText}>
                                * Select from registered colleges
                            </Text>
                        </View>
                    </View>

                    {/* POC Details Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Point of Contact (BP)</Text>
                        <Text style={styles.sectionSubtitle}>
                            Details of the person managing this account.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor={COLORS.placeholder}
                                value={formData.pocName}
                                onChangeText={(text) => handleChange('pocName', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor={COLORS.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.pocEmail}
                                onChangeText={(text) => handleChange('pocEmail', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 98765 43210"
                                placeholderTextColor={COLORS.placeholder}
                                keyboardType="phone-pad"
                                value={formData.pocPhone}
                                onChangeText={(text) => handleChange('pocPhone', text)}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Text style={styles.buttonText}>Registering...</Text>
                            ) : (
                                <Text style={styles.buttonText}>Register Society</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* College Selection Modal */}
                <Modal
                    visible={showCollegeModal}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select College</Text>
                            <TouchableOpacity onPress={() => setShowCollegeModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={COLORS.gray} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search college..."
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    fetchColleges(text);
                                }}
                                autoFocus
                            />
                        </View>

                        {isCollegesLoading ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.black} />
                        ) : (
                            <FlatList
                                data={colleges}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.collegeItem}
                                        onPress={() => handleSelectCollege(item)}
                                    >
                                        <Text style={styles.collegeName}>{item.name}</Text>
                                        <Text style={styles.collegeLocation}>{item.location}</Text>
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
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        marginBottom: 32,
        lineHeight: 22,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.black,
        justifyContent: 'center', // for TouchableOpacity text alignment
    },
    helperText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
    },
    footer: {
        marginTop: 16,
    },
    button: {
        height: 56,
        backgroundColor: COLORS.black,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Modal Styles
    modalContent: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.black,
    },
    listContent: {
        paddingBottom: 24,
    },
    collegeItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    collegeName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    collegeLocation: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 4,
    },
});
