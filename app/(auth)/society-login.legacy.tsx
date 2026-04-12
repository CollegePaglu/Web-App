/**
 * PRESERVED — not used by routing while the external Google Form is in use.
 * To restore in-app society login: move this implementation back into `society-login.tsx`
 * (or re-export from there as default).
 *
 * Society Login Screen — Email/Password authentication for Society POCs.
 */

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { useToast } from '../../src/providers';
import { apiClient, API_ENDPOINTS } from '../../src/api';
import { userStorage } from '../../src/utils/storage';
import { tokenStorage } from '../../src/utils/storage';
import { colors } from '../../src/theme/colors';

// Brand colors
const COLORS = {
    background: '#FFFFFF',
    black: '#000000',
    gray: '#666666',
    lightGray: '#E0E0E0',
    inputBorder: '#E0E0E0',
    inputBorderFocused: '#000000',
    inputBg: '#FFFFFF',
    error: '#E53935',
    placeholder: '#BDBDBD',
    disabledButton: '#E0E0E0',
    disabledText: '#999999',
};

export default function SocietyLoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { showError, showSuccess } = useToast();

    // Animations
    const buttonScale = useSharedValue(1);
    const shakeX = useSharedValue(0);

    const shakeInput = () => {
        shakeX.value = withSequence(
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(0, { duration: 50 }),
        );
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showError('Error', 'Please fill in all fields');
            shakeInput();
            return;
        }

        setIsLoading(true);

        // Button animation
        buttonScale.value = withSequence(
            withTiming(0.97, { duration: 100 }),
            withTiming(1, { duration: 150 }),
        );

        try {
            const response = await apiClient.post(API_ENDPOINTS.SOCIETY.LOGIN, {
                email,
                password,
            });

            const { society, tokens } = response.data.data;

            // Store tokens and user data
            await tokenStorage.setTokens(tokens);
            // Map society to user format for storage
            const societyUser = {
                _id: society._id || society.id,
                name: society.name,
                email: society.email,
                phone: society.poc?.phone || '', // Map POC phone
                role: 'society',
                avatar: society.avatar,
                collegeId: society.collegeId,
                isVerified: society.isVerified,
                isProfileComplete: true, // Societies are pre-verified/complete
                createdAt: society.createdAt || new Date().toISOString(),
                updatedAt: society.updatedAt || new Date().toISOString(),
            };

            await userStorage.setUser(societyUser as any);

            showSuccess('Success', `Welcome back, ${society.name}!`);

            // Redirect to Web Dashboard
            const redirectUrl = `https://society.collegepaglu.com?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

            const supported = await Linking.canOpenURL(redirectUrl);
            if (supported) {
                await Linking.openURL(redirectUrl);
            } else {
                showError('Error', "Could not open web dashboard");
            }

        } catch (error: any) {
            console.error('Society login error:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            showError('Login Failed', message);
            shakeInput();
        } finally {
            setIsLoading(false);
        }
    };

    const inputContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    return (
        <SafeArea edges={['top', 'bottom']} style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Society Login</Text>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="people-circle-outline" size={80} color={COLORS.black} />
                            </View>

                            <Text style={styles.title}>Welcome Back!</Text>
                            <Text style={styles.subtitle}>
                                Login to manage your society events and updates
                            </Text>

                            <Animated.View style={[styles.form, inputContainerStyle]}>
                                {/* Email Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Official Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="society@college.edu"
                                        placeholderTextColor={COLORS.placeholder}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Enter password"
                                            placeholderTextColor={COLORS.placeholder}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={20}
                                                color={COLORS.gray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                {/* Login Button */}
                                <Animated.View style={[buttonAnimatedStyle]}>
                                    <TouchableOpacity
                                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                        onPress={handleLogin}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Login</Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
                {/* Register Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to College Paglu?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/society-registration')}>
                        <Text style={styles.footerLink}>Register Society</Text>
                    </TouchableOpacity>
                </View>
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
        flexGrow: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.black,
    },
    content: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.black,
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.inputBg,
    },
    passwordContainer: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.inputBg,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '500',
    },
    loginButton: {
        height: 56,
        backgroundColor: COLORS.black,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonDisabled: {
        backgroundColor: COLORS.disabledButton,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        textDecorationLine: 'underline',
    },
});
