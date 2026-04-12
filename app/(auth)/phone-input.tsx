import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/features/auth';
import { useToast } from '../../src/providers';
import { phoneValidation } from '../../src/utils/validation';
import { typography, fontFamily } from '../../src/theme/typography';
import { extendedColors as colors } from '../../src/theme/colors';
import { spacing, borderRadius } from '../../src/theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use theme colors directly
// Use theme colors directly
const COLORS = {
  background: colors.white, // Cream #fcfdfb
  warmBackground: colors.accent, // Soft Sage
  black: colors.black, // Charcoal
  gray: colors.neutral[600],
  lightGray: colors.secondary, // Muted Sage
  inputBorder: colors.secondary,
  inputBorderFocused: colors.primary[600], // Sage Green
  inputBg: colors.white,
  inputBgFocused: colors.white,
  success: colors.primary[600], // Sage Green (as success)
  error: colors.error[600],
  placeholder: colors.neutral[400],
  disabledButton: colors.neutral[200],
  disabledText: colors.neutral[400],
};

// Animated Paglu Logo Component
function PagluLogo({ size = 80 }: { size?: number }) {
  const breathingScale = useSharedValue(1);

  useEffect(() => {
    // Breathing animation loop
    const animate = () => {
      breathingScale.value = withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      );
    };
    animate();
    const interval = setInterval(animate, 3000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="logoGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#333333" />
            <Stop offset="100%" stopColor="#000000" />
          </RadialGradient>
        </Defs>

        {/* Face */}
        <Circle cx="50" cy="50" r="40" fill="url(#logoGradient)" />

        {/* Shine */}
        <Circle cx="35" cy="35" r="8" fill="#222222" opacity="0.3" />

        {/* Left Eye */}
        <Circle cx="35" cy="45" r="7" fill="#FFFFFF" />

        {/* Right Eye (winked) */}
        <Path
          d="M 58 45 Q 65 50 72 45"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Smile */}
        <Path
          d="M 25 60 Q 50 85 75 60"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {/* Brand text below logo */}
      <Text style={styles.logoText}>college paglu</Text>
    </Animated.View>
  );
}

export default function PhoneInputScreen() {
  const [phone, setPhone] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { sendOTP, isLoading, error, clearError } = useAuth();
  const { showError } = useToast();

  // Input animation values
  const inputScale = useSharedValue(1);
  const inputElevation = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const inputFocused = useSharedValue(0); // 0 = not focused, 1 = focused

  const isValidPhone = phoneValidation.isValid(phone);

  // Keyboard listeners - use animated values instead of state to prevent re-renders
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      logoScale.value = withTiming(0.75, { duration: 250 });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      logoScale.value = withTiming(1, { duration: 250 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Show checkmark when valid
  useEffect(() => {
    checkmarkScale.value = withSpring(isValidPhone ? 1 : 0, { damping: 15 });
  }, [isValidPhone]);

  const handleFocus = () => {
    inputFocused.value = 1;
    inputScale.value = withTiming(1.01, { duration: 200 });
    inputElevation.value = withTiming(4, { duration: 200 });
  };

  const handleBlur = () => {
    inputFocused.value = 0;
    inputScale.value = withTiming(1, { duration: 200 });
    inputElevation.value = withTiming(1, { duration: 200 });
  };

  const shakeInput = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const handleContinue = async () => {
    clearError();

    // Validate phone
    const phoneError = phoneValidation.getErrorMessage(phone);
    if (phoneError) {
      showError('Invalid Phone', phoneError);
      shakeInput();
      return;
    }

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );

    // Send OTP
    const success = await sendOTP(phone, 'whatsapp');

    if (success) {
      router.push({
        pathname: '/(auth)/otp-verify',
        params: { phone: phoneValidation.formatForApi(phone) },
      });
    } else if (error) {
      showError('Error', error);
      shakeInput();
    }
  };

  // Format phone number with space
  const formatPhoneDisplay = (value: string) => {
    if (value.length <= 5) return value;
    return `${value.slice(0, 5)} ${value.slice(5)}`;
  };

  // Animated styles
  const inputContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: inputScale.value },
      { translateX: shakeX.value },
    ],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const countryCodeAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: inputFocused.value === 1 ? COLORS.inputBorderFocused : COLORS.inputBorder,
  }));

  const phoneInputAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: inputFocused.value === 1 ? COLORS.inputBorderFocused : COLORS.inputBorder,
    borderWidth: inputFocused.value === 1 ? 2 : 1.5,
  }));

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
          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <PagluLogo size={80} />
          </Animated.View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              Welcome to College Paglu 🎓
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Your college community awaits
            </Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <Animated.View style={[styles.inputRow, inputContainerStyle]}>
              {/* Country Code */}
              <Animated.View style={[styles.countryCode, countryCodeAnimatedStyle]}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
                <Text style={styles.chevron}>▼</Text>
              </Animated.View>

              {/* Phone Input */}
              <Animated.View style={[
                styles.phoneInputContainer,
                phoneInputAnimatedStyle,
                error && styles.phoneInputError,
              ]}>
                <TextInput
                  ref={inputRef}
                  style={styles.phoneInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor={COLORS.placeholder}
                  value={formatPhoneDisplay(phone)}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setPhone(cleaned.slice(0, 10));
                  }}
                  keyboardType="phone-pad"
                  maxLength={11} // 10 digits + 1 space
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                {/* Valid checkmark */}
                <Animated.View style={[styles.checkmark, checkmarkStyle]}>
                  <Svg width={20} height={20} viewBox="0 0 20 20">
                    <Circle cx="10" cy="10" r="10" fill={COLORS.success} />
                    <Path
                      d="M 5 10 L 8 13 L 15 6"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </Animated.View>
              </Animated.View>
            </Animated.View>

            {/* Helper text */}
            <Text style={styles.helperText}>
              We'll send you a verification code
            </Text>

            {/* Error message */}
            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}
          </View>

          {/* CTA Button */}
          <Animated.View style={[styles.buttonSection, buttonAnimatedStyle]}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                !isValidPhone && styles.ctaButtonDisabled,
                isLoading && styles.ctaButtonLoading,
              ]}
              onPress={handleContinue}
              disabled={!isValidPhone || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingSpinner}>
                  <View style={styles.spinnerDot} />
                </View>
              ) : (
                <Text style={[
                  styles.ctaButtonText,
                  !isValidPhone && styles.ctaButtonTextDisabled,
                ]}>
                  {isValidPhone ? 'Get OTP' : 'Enter Phone Number'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Society Login Link */}
          <TouchableOpacity
            style={styles.societyLoginLink}
            onPress={() => router.push('/(auth)/society-login')}
          >
            <Text style={styles.societyLoginText}>
              Login as Society
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://collegepaglu.com/terms')}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://collegepaglu.com/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 24,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoSectionCompact: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.5,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32, // Larger for impact
    fontFamily: fontFamily.serif, // Playfair Display
    color: COLORS.black,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 22,
  },

  // Input Section
  inputSection: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    gap: 6,
  },
  countryCodeFocused: {
    borderColor: COLORS.black,
  },
  flag: {
    fontSize: 20,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.gray,
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  phoneInputFocused: {
    borderWidth: 2,
    borderColor: COLORS.inputBorderFocused,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  phoneInputError: {
    borderColor: COLORS.error,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  checkmark: {
    marginLeft: 8,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.gray,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.error,
  },

  // Button Section
  buttonSection: {
    marginBottom: 24,
  },
  ctaButton: {
    height: 56,
    backgroundColor: COLORS.black,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: COLORS.disabledButton,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonLoading: {
    opacity: 0.8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaButtonTextDisabled: {
    color: COLORS.disabledText,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
  },
  spinnerDot: {
    // Placeholder for animated spinner
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: COLORS.gray,
  },

  // Social Login
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  societyLoginLink: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  societyLoginText: {
    fontSize: 18,
    fontFamily: fontFamily.serif,
    color: COLORS.black,
  },
});
