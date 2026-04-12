/**
 * Society login route: opens the official Society Registration Google Form (`SocietyFormRedirectLayout`).
 * Full previous in-app email/password implementation is preserved below as line comments (same as `society-login.legacy.tsx`).
 */
import React from 'react';
import { router } from 'expo-router';
import { SocietyFormRedirectLayout } from '@/components/auth/SocietyFormRedirectLayout';

export default function SocietyLoginScreen() {
    return (
        <SocietyFormRedirectLayout
            title="Society Login"
            heroLabel="Society access"
            onBack={() => router.back()}
            openOnMount
        />
    );
}

// =============================================================================
// PRESERVED — upstream themed email/password login (commented out; do not delete)
// =============================================================================

// import React, { useState } from 'react';
// import {
//     View,
//     StyleSheet,
//     TextInput,
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView,
//     TouchableOpacity,
//     ActivityIndicator,
// } from 'react-native';
// import { router } from 'expo-router';
// import { SafeArea } from '../../src/components/layout/SafeArea';
// import { Text } from '../../src/components/ui/Text';
// import { useToast } from '../../src/providers';
// import { Ionicons } from '@expo/vector-icons';
// import { apiClient, API_ENDPOINTS } from '../../src/api';
// import { useThemeColors } from '@/context/ThemeContext';
// import { spacing, borderRadius, shadows } from '@/theme/spacing';
//
// export default function SocietyLoginScreen() {
//     const colors = useThemeColors();
//     const { showError, showSuccess, showInfo } = useToast();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//
//     const handleLogin = async () => {
//         if (!email || !password) {
//             showError('Missing Fields', 'Please enter your email and password.');
//             return;
//         }
//
//         setIsLoading(true);
//         try {
//             const response = await apiClient.post(API_ENDPOINTS.SOCIETY.LOGIN, {
//                 email: email.trim().toLowerCase(),
//                 password,
//             });
//
//             const { society, tokens } = response.data.data;
//
//             // Society dashboard login is handled separately —
//             // for now just inform them login is successful and redirect
//             showSuccess('Login Successful', `Welcome back, ${society.name}!`);
//
//             // TODO: Store society tokens and navigate to society dashboard
//             // For now go back since the society dashboard is a separate web app
//             router.back();
//         } catch (error: any) {
//             const status = error.response?.status;
//             const msg = error.response?.data?.message || 'Login failed';
//
//             if (status === 403 || msg.toLowerCase().includes('pending')) {
//                 showInfo('Pending Approval', 'Your society registration is pending admin approval. Please wait for verification.');
//             } else {
//                 showError('Login Failed', msg);
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <SafeArea edges={['top', 'bottom']} style={{ ...styles.safeArea, backgroundColor: colors.background }}>
//             <KeyboardAvoidingView
//                 style={styles.keyboardView}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             >
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <TouchableOpacity
//                         onPress={() => router.back()}
//                         style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
//                         activeOpacity={0.85}
//                     >
//                         <Ionicons name="arrow-back" size={22} color={colors.text} />
//                     </TouchableOpacity>
//                     <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
//                         Society Login
//                     </Text>
//                 </View>
//
//                 <ScrollView
//                     contentContainerStyle={styles.scrollContent}
//                     keyboardShouldPersistTaps="handled"
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {/* Hero */}
//                     <View style={styles.hero}>
//                         <View style={[styles.iconRing, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
//                             <View style={[styles.iconInner, { backgroundColor: colors.surfaceHighlight }]}>
//                                 <Ionicons name="people" size={36} color={colors.primary} />
//                             </View>
//                         </View>
//                         <Text style={[styles.heroTitle, { color: colors.text }]}>Welcome Back</Text>
//                         <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
//                             Log in to your society account to manage posts and engage with your community.
//                         </Text>
//                     </View>
//
//                     {/* Login Card */}
//                     <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.soft]}>
//                         <View style={styles.inputGroup}>
//                             <Text style={[styles.label, { color: colors.textSecondary }]}>Society Email</Text>
//                             <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
//                                 <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
//                                 <TextInput
//                                     style={[styles.input, { color: colors.text }]}
//                                     placeholder="society@college.edu"
//                                     placeholderTextColor={colors.textTertiary}
//                                     keyboardType="email-address"
//                                     autoCapitalize="none"
//                                     autoCorrect={false}
//                                     value={email}
//                                     onChangeText={setEmail}
//                                 />
//                             </View>
//                         </View>
//
//                         <View style={styles.inputGroup}>
//                             <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
//                             <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
//                                 <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
//                                 <TextInput
//                                     style={[styles.input, { color: colors.text }]}
//                                     placeholder="Enter password"
//                                     placeholderTextColor={colors.textTertiary}
//                                     secureTextEntry={!showPassword}
//                                     value={password}
//                                     onChangeText={setPassword}
//                                 />
//                                 <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
//                                     <Ionicons
//                                         name={showPassword ? 'eye-off-outline' : 'eye-outline'}
//                                         size={20}
//                                         color={colors.textTertiary}
//                                     />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//
//                     {/* Info Banner */}
//                     <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
//                         <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
//                         <Text style={[styles.infoText, { color: colors.primary }]}>
//                             New societies require admin approval before login is enabled.
//                         </Text>
//                     </View>
//
//                     {/* Login Button */}
//                     <TouchableOpacity
//                         style={[styles.submitBtn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.7 }]}
//                         onPress={handleLogin}
//                         disabled={isLoading}
//                         activeOpacity={0.85}
//                     >
//                         {isLoading ? (
//                             <ActivityIndicator color={colors.primaryForeground} />
//                         ) : (
//                             <>
//                                 <Ionicons name="log-in-outline" size={20} color={colors.primaryForeground} />
//                                 <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Login</Text>
//                             </>
//                         )}
//                     </TouchableOpacity>
//
//                     <TouchableOpacity
//                         style={styles.registerLink}
//                         onPress={() => router.replace('/(auth)/society-registration')}
//                     >
//                         <Text style={[styles.registerLinkText, { color: colors.textSecondary }]}>
//                             Don't have an account?{' '}
//                             <Text style={{ color: colors.primary, fontWeight: '600' }}>Register Society</Text>
//                         </Text>
//                     </TouchableOpacity>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//         </SafeArea>
//     );
// }
//
// const styles = StyleSheet.create({
//     safeArea: { flex: 1 },
//     keyboardView: { flex: 1 },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: spacing[4],
//         paddingVertical: spacing[2],
//         gap: spacing[3],
//     },
//     backBtn: {
//         width: 44,
//         height: 44,
//         borderRadius: borderRadius.lg,
//         borderWidth: StyleSheet.hairlineWidth,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     headerTitle: {
//         flex: 1,
//         fontSize: 20,
//         fontWeight: '700',
//         letterSpacing: -0.3,
//     },
//     scrollContent: {
//         paddingHorizontal: spacing[5],
//         paddingBottom: spacing[10],
//     },
//     hero: {
//         alignItems: 'center',
//         paddingTop: spacing[4],
//         marginBottom: spacing[6],
//     },
//     iconRing: {
//         padding: spacing[2],
//         borderRadius: borderRadius['3xl'],
//         borderWidth: StyleSheet.hairlineWidth,
//         marginBottom: spacing[4],
//     },
//     iconInner: {
//         width: 72,
//         height: 72,
//         borderRadius: borderRadius['2xl'],
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     heroTitle: {
//         fontSize: 24,
//         fontWeight: '700',
//         textAlign: 'center',
//         letterSpacing: -0.4,
//         marginBottom: spacing[2],
//     },
//     heroBody: {
//         fontSize: 15,
//         lineHeight: 22,
//         textAlign: 'center',
//         maxWidth: 320,
//     },
//     card: {
//         padding: spacing[5],
//         borderRadius: borderRadius['2xl'],
//         borderWidth: StyleSheet.hairlineWidth,
//         marginBottom: spacing[4],
//     },
//     inputGroup: {
//         marginBottom: spacing[4],
//     },
//     label: {
//         fontSize: 13,
//         fontWeight: '600',
//         marginBottom: spacing[1],
//     },
//     inputContainer: {
//         height: 48,
//         borderWidth: 1,
//         borderRadius: borderRadius.lg,
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: spacing[3],
//     },
//     inputIcon: {
//         marginRight: spacing[2],
//     },
//     input: {
//         flex: 1,
//         fontSize: 15,
//         height: '100%',
//     },
//     eyeBtn: {
//         paddingLeft: spacing[2],
//     },
//     infoBanner: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: spacing[2],
//         padding: spacing[3],
//         borderRadius: borderRadius.lg,
//         borderWidth: 1,
//         marginBottom: spacing[4],
//     },
//     infoText: {
//         flex: 1,
//         fontSize: 13,
//         lineHeight: 18,
//         fontWeight: '500',
//     },
//     submitBtn: {
//         height: 52,
//         borderRadius: borderRadius.xl,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: spacing[2],
//     },
//     submitText: {
//         fontSize: 16,
//         fontWeight: '700',
//     },
//     registerLink: {
//         alignItems: 'center',
//         marginTop: spacing[4],
//     },
//     registerLinkText: {
//         fontSize: 14,
//     },
// });

// =============================================================================
// PRESERVED — entire `society-login.legacy.tsx` (commented out; do not delete)
// =============================================================================

// /**
//  * PRESERVED — not used by routing while the external Google Form is in use.
//  * To restore in-app society login: move this implementation back into `society-login.tsx`
//  * (or re-export from there as default).
//  *
//  * Society Login Screen — Email/Password authentication for Society POCs.
//  */
//
// import React, { useState } from 'react';
// import {
//     View,
//     StyleSheet,
//     TextInput,
//     TouchableOpacity,
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView,
//     Keyboard,
//     ActivityIndicator,
//     TouchableWithoutFeedback,
//     Linking,
// } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import Animated, {
//     useSharedValue,
//     useAnimatedStyle,
//     withTiming,
//     withSequence,
//     withSpring,
// } from 'react-native-reanimated';
// import { SafeArea } from '../../src/components/layout/SafeArea';
// import { Text } from '../../src/components/ui/Text';
// import { useToast } from '../../src/providers';
// import { apiClient, API_ENDPOINTS } from '../../src/api';
// import { userStorage } from '../../src/utils/storage';
// import { tokenStorage } from '../../src/utils/storage';
// import { colors } from '../../src/theme/colors';
//
// // Brand colors
// const COLORS = {
//     background: '#FFFFFF',
//     black: '#000000',
//     gray: '#666666',
//     lightGray: '#E0E0E0',
//     inputBorder: '#E0E0E0',
//     inputBorderFocused: '#000000',
//     inputBg: '#FFFFFF',
//     error: '#E53935',
//     placeholder: '#BDBDBD',
//     disabledButton: '#E0E0E0',
//     disabledText: '#999999',
// };
//
// export default function SocietyLoginScreen() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//
//     const { showError, showSuccess } = useToast();
//
//     // Animations
//     const buttonScale = useSharedValue(1);
//     const shakeX = useSharedValue(0);
//
//     const shakeInput = () => {
//         shakeX.value = withSequence(
//             withTiming(-8, { duration: 50 }),
//             withTiming(8, { duration: 50 }),
//             withTiming(-8, { duration: 50 }),
//             withTiming(8, { duration: 50 }),
//             withTiming(0, { duration: 50 }),
//         );
//     };
//
//     const handleLogin = async () => {
//         if (!email || !password) {
//             showError('Error', 'Please fill in all fields');
//             shakeInput();
//             return;
//         }
//
//         setIsLoading(true);
//
//         // Button animation
//         buttonScale.value = withSequence(
//             withTiming(0.97, { duration: 100 }),
//             withTiming(1, { duration: 150 }),
//         );
//
//         try {
//             const response = await apiClient.post(API_ENDPOINTS.SOCIETY.LOGIN, {
//                 email,
//                 password,
//             });
//
//             const { society, tokens } = response.data.data;
//
//             // Store tokens and user data
//             await tokenStorage.setTokens(tokens);
//             // Map society to user format for storage
//             const societyUser = {
//                 _id: society._id || society.id,
//                 name: society.name,
//                 email: society.email,
//                 phone: society.poc?.phone || '', // Map POC phone
//                 role: 'society',
//                 avatar: society.avatar,
//                 collegeId: society.collegeId,
//                 isVerified: society.isVerified,
//                 isProfileComplete: true, // Societies are pre-verified/complete
//                 createdAt: society.createdAt || new Date().toISOString(),
//                 updatedAt: society.updatedAt || new Date().toISOString(),
//             };
//
//             await userStorage.setUser(societyUser as any);
//
//             showSuccess('Success', `Welcome back, ${society.name}!`);
//
//             // Redirect to Web Dashboard
//             const redirectUrl = `https://society.collegepaglu.com?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
//
//             const supported = await Linking.canOpenURL(redirectUrl);
//             if (supported) {
//                 await Linking.openURL(redirectUrl);
//             } else {
//                 showError('Error', "Could not open web dashboard");
//             }
//
//         } catch (error: any) {
//             console.error('Society login error:', error);
//             const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
//             showError('Login Failed', message);
//             shakeInput();
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const inputContainerStyle = useAnimatedStyle(() => ({
//         transform: [{ translateX: shakeX.value }],
//     }));
//
//     const buttonAnimatedStyle = useAnimatedStyle(() => ({
//         transform: [{ scale: buttonScale.value }],
//     }));
//
//     return (
//         <SafeArea edges={['top', 'bottom']} style={styles.safeArea}>
//             <KeyboardAvoidingView
//                 style={styles.keyboardView}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             >
//                 <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                     <ScrollView
//                         contentContainerStyle={styles.scrollContent}
//                         showsVerticalScrollIndicator={false}
//                     >
//                         {/* Header */}
//                         <View style={styles.header}>
//                             <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//                                 <Ionicons name="arrow-back" size={24} color={COLORS.black} />
//                             </TouchableOpacity>
//                             <Text style={styles.headerTitle}>Society Login</Text>
//                         </View>
//
//                         <View style={styles.content}>
//                             <View style={styles.iconContainer}>
//                                 <Ionicons name="people-circle-outline" size={80} color={COLORS.black} />
//                             </View>
//
//                             <Text style={styles.title}>Welcome Back!</Text>
//                             <Text style={styles.subtitle}>
//                                 Login to manage your society events and updates
//                             </Text>
//
//                             <Animated.View style={[styles.form, inputContainerStyle]}>
//                                 {/* Email Input */}
//                                 <View style={styles.inputContainer}>
//                                     <Text style={styles.label}>Official Email</Text>
//                                     <TextInput
//                                         style={styles.input}
//                                         placeholder="society@college.edu"
//                                         placeholderTextColor={COLORS.placeholder}
//                                         value={email}
//                                         onChangeText={setEmail}
//                                         autoCapitalize="none"
//                                         keyboardType="email-address"
//                                     />
//                                 </View>
//
//                                 {/* Password Input */}
//                                 <View style={styles.inputContainer}>
//                                     <Text style={styles.label}>Password</Text>
//                                     <View style={styles.passwordContainer}>
//                                         <TextInput
//                                             style={styles.passwordInput}
//                                             placeholder="Enter password"
//                                             placeholderTextColor={COLORS.placeholder}
//                                             value={password}
//                                             onChangeText={setPassword}
//                                             secureTextEntry={!showPassword}
//                                         />
//                                         <TouchableOpacity
//                                             style={styles.eyeIcon}
//                                             onPress={() => setShowPassword(!showPassword)}
//                                         >
//                                             <Ionicons
//                                                 name={showPassword ? 'eye-off-outline' : 'eye-outline'}
//                                                 size={20}
//                                                 color={COLORS.gray}
//                                             />
//                                         </TouchableOpacity>
//                                     </View>
//                                 </View>
//
//                                 <TouchableOpacity style={styles.forgotPassword}>
//                                     <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//                                 </TouchableOpacity>
//
//                                 {/* Login Button */}
//                                 <Animated.View style={[buttonAnimatedStyle]}>
//                                     <TouchableOpacity
//                                         style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
//                                         onPress={handleLogin}
//                                         disabled={isLoading}
//                                     >
//                                         {isLoading ? (
//                                             <ActivityIndicator color="#FFFFFF" />
//                                         ) : (
//                                             <Text style={styles.loginButtonText}>Login</Text>
//                                         )}
//                                     </TouchableOpacity>
//                                 </Animated.View>
//                             </Animated.View>
//                         </View>
//                     </ScrollView>
//                 </TouchableWithoutFeedback>
//                 {/* Register Link */}
//                 <View style={styles.footer}>
//                     <Text style={styles.footerText}>New to College Paglu?</Text>
//                     <TouchableOpacity onPress={() => router.push('/(auth)/society-registration')}>
//                         <Text style={styles.footerLink}>Register Society</Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </SafeArea>
//     );
// }
//
// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     keyboardView: {
//         flex: 1,
//     },
//     scrollContent: {
//         flexGrow: 1,
//         padding: 24,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 32,
//     },
//     backButton: {
//         marginRight: 16,
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: COLORS.black,
//     },
//     content: {
//         flex: 1,
//     },
//     iconContainer: {
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: '700',
//         color: COLORS.black,
//         marginBottom: 8,
//         textAlign: 'center',
//     },
//     subtitle: {
//         fontSize: 16,
//         color: COLORS.gray,
//         textAlign: 'center',
//         marginBottom: 40,
//         lineHeight: 24,
//     },
//     form: {
//         gap: 20,
//     },
//     inputContainer: {
//         gap: 8,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: '500',
//         color: COLORS.black,
//     },
//     input: {
//         height: 56,
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         fontSize: 16,
//         color: COLORS.black,
//         backgroundColor: COLORS.inputBg,
//     },
//     passwordContainer: {
//         height: 56,
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         backgroundColor: COLORS.inputBg,
//     },
//     passwordInput: {
//         flex: 1,
//         fontSize: 16,
//         color: COLORS.black,
//         height: '100%',
//     },
//     eyeIcon: {
//         padding: 8,
//     },
//     forgotPassword: {
//         alignSelf: 'flex-end',
//     },
//     forgotPasswordText: {
//         fontSize: 14,
//         color: COLORS.black,
//         fontWeight: '500',
//     },
//     loginButton: {
//         height: 56,
//         backgroundColor: COLORS.black,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 8,
//         elevation: 4,
//     },
//     loginButtonDisabled: {
//         backgroundColor: COLORS.disabledButton,
//         shadowOpacity: 0,
//         elevation: 0,
//     },
//     loginButtonText: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: '#FFFFFF',
//     },
//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingVertical: 24,
//         gap: 8,
//     },
//     footerText: {
//         fontSize: 14,
//         color: COLORS.gray,
//     },
//     footerLink: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: COLORS.black,
//         textDecorationLine: 'underline',
//     },
// });
