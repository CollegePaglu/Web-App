/**
 * OTP Verification Screen - Complete Redesign
 * 
 * 6-digit OTP verification with animations.
 * Features: animated boxes, shake on error, success animation.
 */

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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { useAuth, useOTPTimer } from '../../src/features/auth';
import { useToast } from '../../src/providers';
import { otpValidation, phoneValidation } from '../../src/utils/validation';
import { OTP_CONFIG } from '../../src/config/constants';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = OTP_CONFIG.LENGTH;

// Colors
const COLORS = {
  background: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#E0E0E0',
  inputBorder: '#E0E0E0',
  inputBorderFocused: '#000000',
  inputBg: '#FAFAFA',
  inputBgFocused: '#FFFFFF',
  inputBgFilled: '#F5F5F5',
  success: '#4CAF50',
  successBg: '#E8F5E9',
  error: '#E53935',
  errorBg: '#FFEBEE',
};

// Compact Paglu Logo
function PagluLogoCompact({ size = 60 }: { size?: number }) {
  const breathingScale = useSharedValue(1);

  useEffect(() => {
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
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="compactGradient" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#333333" />
            <Stop offset="100%" stopColor="#000000" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="40" fill="url(#compactGradient)" />
        <Circle cx="35" cy="45" r="6" fill="#FFFFFF" />
        <Path d="M 58 45 Q 65 50 72 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M 28 60 Q 50 82 72 60" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

// Single OTP Display Box (visual only — not a TextInput)
interface OTPBoxProps {
  value: string;
  isFocused: boolean;
  hasError: boolean;
  isSuccess: boolean;
  index: number;
}

function OTPBox({
  value,
  isFocused,
  hasError,
  isSuccess,
  index,
}: OTPBoxProps) {
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (value) {
      // Pop animation on digit entry
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 12 }),
      );
    }
  }, [value]);

  useEffect(() => {
    if (hasError) {
      // Shake animation on error
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [hasError]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shakeX.value },
    ],
  }));

  return (
    <Animated.View style={[styles.otpBoxWrapper, animatedStyle]}>
      <View
        style={[
          styles.otpBox,
          isFocused && styles.otpBoxFocused,
          value && styles.otpBoxFilled,
          hasError && styles.otpBoxError,
          isSuccess && styles.otpBoxSuccess,
        ]}
      >
        <Text style={styles.otpDigit}>{value}</Text>
      </View>
      {isFocused && !value && (
        <View style={styles.cursor} />
      )}
      {isSuccess && value && (
        <View style={styles.successCheckmark}>
          <Svg width={12} height={12} viewBox="0 0 12 12">
            <Path
              d="M 2 6 L 5 9 L 10 3"
              stroke={COLORS.success}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>
      )}
    </Animated.View>
  );
}

export default function OTPVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otpValue, setOtpValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);
  const { verifyOTP, sendOTP, isLoading, error, clearError } = useAuth();
  const { showError, showSuccess } = useToast();
  const { countdown, isResendEnabled, startTimer, formattedTime } = useOTPTimer();

  // Derive the per-digit array from the single string
  const otp = Array.from({ length: OTP_LENGTH }, (_, i) => otpValue[i] || '');

  // Animation values
  const containerShake = useSharedValue(0);
  const submitButtonScale = useSharedValue(1);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  // Focus the hidden input on mount
  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, []);

  const handleOtpChange = (text: string) => {
    clearError();
    setHasError(false);

    // Only keep digits
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtpValue(digits);
    setFocusedIndex(Math.min(digits.length, OTP_LENGTH - 1));

    // Haptic feedback
    if (digits.length > otpValue.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Auto-submit when all digits are filled via paste
    if (digits.length === OTP_LENGTH && text.length >= OTP_LENGTH) {
      // Small delay to let UI update before verifying
      setTimeout(() => handleVerify(digits), 150);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && otpValue.length > 0) {
      // React Native handles backspace in onChangeText, but we update focus index
      setFocusedIndex(Math.max(0, otpValue.length - 2));
    }
  };

  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  const triggerErrorAnimation = () => {
    setHasError(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    containerShake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    // Clear OTP after shake
    setTimeout(() => {
      setOtpValue('');
      setHasError(false);
      setFocusedIndex(0);
      hiddenInputRef.current?.focus();
    }, 400);
  };

  const handleVerify = async (otpOverride?: string) => {
    const fullOtp = otpOverride || otpValue;

    const otpError = otpValidation.getErrorMessage(fullOtp, OTP_LENGTH);
    if (otpError) {
      showError('Invalid OTP', otpError);
      triggerErrorAnimation();
      return;
    }

    if (!phone) {
      showError('Error', 'Phone number is missing');
      return;
    }

    // Button press animation
    submitButtonScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );

    const result = await verifyOTP(phone, fullOtp);

    if (result.success) {
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('Welcome!', 'You have successfully logged in');

      // Delay navigation to show success state
      setTimeout(() => {
        if (result.needsProfileComplete) {
          router.replace('/(auth)/profile-complete');
        } else {
          router.replace('/(main)/(tabs)/home');
        }
      }, 800);
    } else if (error) {
      showError('Verification Failed', error);
      triggerErrorAnimation();
    }
  };

  const handleResend = async () => {
    if (!phone || !isResendEnabled) return;

    const success = await sendOTP(phone);
    if (success) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showSuccess('OTP Sent', 'A new verification code has been sent');
      startTimer();
      setOtpValue('');
      setHasError(false);
      setFocusedIndex(0);
      hiddenInputRef.current?.focus();
    } else if (error) {
      showError('Error', error);
    }
  };

  const handleEditNumber = () => {
    router.back();
  };

  const formattedPhone = phone ? phoneValidation.format(phone) : '';
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: containerShake.value }],
  }));

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M 15 19 L 8 12 L 15 5"
                stroke={COLORS.black}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <PagluLogoCompact size={60} />
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Verify Your Number</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.phoneNumber}>{formattedPhone}</Text>
              <TouchableOpacity onPress={handleEditNumber}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your number
            </Text>
          </View>

          {/* Hidden TextInput that captures all keyboard and paste input */}
          <TextInput
            ref={hiddenInputRef}
            value={otpValue}
            onChangeText={handleOtpChange}
            onKeyPress={handleKeyPress}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            style={styles.hiddenInput}
            caretHidden
          />

          {/* OTP Visual Boxes — tap anywhere to focus the hidden input */}
          <TouchableOpacity activeOpacity={1} onPress={focusHiddenInput}>
            <Animated.View style={[styles.otpContainer, containerStyle]}>
              {otp.map((digit, index) => (
                <OTPBox
                  key={index}
                  value={digit}
                  isFocused={focusedIndex === index && !isSuccess}
                  hasError={hasError}
                  isSuccess={isSuccess}
                  index={index}
                />
              ))}
            </Animated.View>
          </TouchableOpacity>

          {/* Status Messages */}
          {error && !hasError && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {isSuccess && (
            <View style={styles.successMessage}>
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Circle cx="8" cy="8" r="8" fill={COLORS.success} />
                <Path d="M 4 8 L 7 11 L 12 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
              </Svg>
              <Text style={styles.successText}>Verified successfully!</Text>
            </View>
          )}

          {/* Submit Button - hidden after success */}
          {!isSuccess && (
            <Animated.View style={[styles.buttonSection, submitButtonStyle]}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isOtpComplete && !isLoading && styles.submitButtonActive,
                  isLoading && styles.submitButtonLoading,
                ]}
                onPress={() => handleVerify()}
                disabled={!isOtpComplete || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Text style={[styles.submitButtonText, styles.submitButtonTextActive]}>Submitting...</Text>
                ) : (
                  <Text style={[
                    styles.submitButtonText,
                    isOtpComplete && styles.submitButtonTextActive,
                  ]}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {isResendEnabled ? (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>Resend in {formattedTime}</Text>
            )}
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

  // Back Button
  backButton: {
    marginTop: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  // Header
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginRight: 12,
  },
  editLink: {
    fontSize: 14,
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },

  // OTP Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  otpBoxWrapper: {
    position: 'relative',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.black,
    textAlign: 'center' as const,
  },
  cursor: {
    position: 'absolute' as const,
    bottom: 14,
    left: '50%' as any,
    marginLeft: -1,
    width: 2,
    height: 24,
    backgroundColor: COLORS.black,
  },
  hiddenInput: {
    position: 'absolute' as const,
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBoxFocused: {
    borderColor: COLORS.inputBorderFocused,
    backgroundColor: COLORS.inputBgFocused,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.inputBgFilled,
  },
  otpBoxError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  otpBoxSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successBg,
  },
  successCheckmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.successBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Status Messages
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.success,
  },

  // Button
  buttonSection: {
    marginBottom: 24,
  },
  submitButton: {
    height: 56,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: COLORS.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonLoading: {
    backgroundColor: COLORS.black,
    opacity: 0.8,
  },
  submitButtonSuccess: {
    backgroundColor: COLORS.black,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
  },
  submitButtonTextActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Resend Section
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  resendTimer: {
    fontSize: 14,
    color: COLORS.gray,
  },

});
