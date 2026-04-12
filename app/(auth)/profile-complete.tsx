/**
 * Profile completion — two steps after OTP: name (required), then optional college details.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SafeArea } from '../../src/components/layout/SafeArea';
import { Text } from '../../src/components/ui/Text';
import { Input } from '../../src/components/ui/Input';
import { userService } from '../../src/features/user';
import { useAuthStore } from '../../src/features/auth';
import type { User as AuthStoreUser } from '../../src/features/auth/types/auth.types';
import { useToast } from '../../src/providers';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#F4FBF8',
  surface: '#FFFFFF',
  mintSoft: '#E3F4EC',
  mintBorder: '#C5E6D6',
  black: '#0A0A0A',
  gray: '#5C6670',
  grayLight: '#8A939D',
  border: '#DDE8E2',
  error: '#E53935',
};

const YEAR_OPTIONS = [
  { label: '1st Year', value: 1 },
  { label: '2nd Year', value: 2 },
  { label: '3rd Year', value: 3 },
  { label: '4th Year', value: 4 },
  { label: '5th Year', value: 5 },
  { label: '6th Year', value: 6 },
];

function PagluLogoCompact({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="compactGradientPc" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#333333" />
          <Stop offset="100%" stopColor="#000000" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="40" fill="url(#compactGradientPc)" />
      <Circle cx="35" cy="45" r="6" fill="#FFFFFF" />
      <Path
        d="M 58 45 Q 65 50 72 45"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 28 60 Q 50 82 72 60"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function StepDots({ step }: { step: 0 | 1 }) {
  return (
    <View style={styles.stepDots}>
      <View style={[styles.dot, step >= 0 && styles.dotActive]} />
      <View style={styles.dotTrack} />
      <View style={[styles.dot, step >= 1 && styles.dotActive]} />
    </View>
  );
}

function YearSelector({
  value,
  onSelect,
}: {
  value: number | null;
  onSelect: (year: number) => void;
}) {
  return (
    <View style={styles.yearContainer}>
      <Text style={styles.inputLabel}>Year</Text>
      <Text style={styles.optionalHint}>Choose one if you are adding college details</Text>
      <View style={styles.yearGrid}>
        {YEAR_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.yearButton,
              value === option.value && styles.yearButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(option.value);
            }}
          >
            <Text
              style={[
                styles.yearButtonText,
                value === option.value && styles.yearButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const inputMint = {
  inputContainerStyle: {
    backgroundColor: COLORS.mintSoft,
    borderColor: COLORS.mintBorder,
    borderWidth: 1,
  },
};

export default function ProfileCompleteScreen() {
  const [step, setStep] = useState<0 | 1>(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { setUser } = useAuthStore();
  const { showError, showSuccess } = useToast();

  const buttonScale = useSharedValue(1);

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'First name is required';
    else if (firstName.trim().length < 2) next.firstName = 'At least 2 characters';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    else if (lastName.trim().length < 2) next.lastName = 'At least 2 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2College = (): boolean => {
    const next: Record<string, string> = {};
    if (!collegeName.trim()) next.collegeName = 'College name is required';
    if (!branch.trim()) next.branch = 'Branch / department is required';
    if (!year) next.year = 'Please select your year';
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const clearCollegeErrors = () => {
    setErrors((prev) => {
      const { collegeName: _c, branch: _b, year: _y, ...rest } = prev;
      return rest;
    });
  };

  const goStep2 = () => {
    if (!validateStep1()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
  };

  const finishProfile = async (payload: {
    firstName: string;
    lastName: string;
    college?: { name: string; department: string; year: number };
  }) => {
    buttonScale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 }),
    );

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await userService.completeProfile({
        firstName: payload.firstName,
        lastName: payload.lastName,
        ...(payload.college && { college: payload.college }),
      });

      if (response.data) {
        setUser(response.data as AuthStoreUser);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('Welcome!', 'You are all set');

      setTimeout(() => {
        router.replace('/(main)/(tabs)/home');
      }, 450);
    } catch (error: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : 'Failed to complete profile';
      showError('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await finishProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const handleContinueWithCollege = async () => {
    if (!validateStep2College()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await finishProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      college: {
        name: collegeName.trim(),
        department: branch.trim(),
        year: year!,
      },
    });
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const step1Valid = firstName.trim().length >= 2 && lastName.trim().length >= 2;
  const collegeComplete =
    !!collegeName.trim() && !!branch.trim() && year !== null;

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
          {step === 1 && (
            <Pressable
              style={styles.backRow}
              onPress={() => {
                Haptics.selectionAsync();
                setStep(0);
                clearCollegeErrors();
              }}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.black} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}

          <View style={[styles.logoSection, step === 1 && styles.logoSectionTight]}>
            <View style={styles.logoRing}>
              <PagluLogoCompact size={52} />
            </View>
          </View>

          <StepDots step={step} />

          <View style={styles.headerSection}>
            {step === 0 ? (
              <>
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={styles.subtitle}>
                  Your name helps friends recognize you on College Paglu
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>College details</Text>
                <Text style={styles.subtitle}>
                  Optional — add your college now, or skip and do it later from your profile
                </Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            {step === 0 ? (
              <View style={styles.form}>
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Input
                      label="First name *"
                      placeholder="First name"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      error={errors.firstName}
                      variant="filled"
                      inputContainerStyle={inputMint.inputContainerStyle}
                    />
                  </View>
                  <View style={styles.nameField}>
                    <Input
                      label="Last name *"
                      placeholder="Last name"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' }));
                      }}
                      autoCapitalize="words"
                      autoComplete="family-name"
                      error={errors.lastName}
                      variant="filled"
                      inputContainerStyle={inputMint.inputContainerStyle}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="College name"
                  placeholder="e.g., IIT Delhi, DU"
                  value={collegeName}
                  onChangeText={(text) => {
                    setCollegeName(text);
                    if (errors.collegeName) setErrors((p) => ({ ...p, collegeName: '' }));
                  }}
                  autoCapitalize="words"
                  error={errors.collegeName}
                  variant="filled"
                  inputContainerStyle={inputMint.inputContainerStyle}
                />
                <Input
                  label="Branch / department"
                  placeholder="e.g., Computer Science"
                  value={branch}
                  onChangeText={(text) => {
                    setBranch(text);
                    if (errors.branch) setErrors((p) => ({ ...p, branch: '' }));
                  }}
                  autoCapitalize="words"
                  error={errors.branch}
                  variant="filled"
                  inputContainerStyle={inputMint.inputContainerStyle}
                />
                <YearSelector
                  value={year}
                  onSelect={(y) => {
                    setYear(y);
                    if (errors.year) setErrors((p) => ({ ...p, year: '' }));
                  }}
                />
                {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
              </View>
            )}
          </View>

          {step === 0 ? (
            <Animated.View style={[styles.buttonSection, buttonStyle]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !step1Valid && styles.primaryButtonDisabled,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={goStep2}
                disabled={!step1Valid || isLoading}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.primaryButtonText, !step1Valid && styles.primaryButtonTextDisabled]}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.step2Actions}>
              <Animated.View style={[styles.buttonSection, buttonStyle]}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !collegeComplete && styles.primaryButtonDisabled,
                    isLoading && styles.primaryButtonLoading,
                  ]}
                  onPress={handleContinueWithCollege}
                  disabled={!collegeComplete || isLoading}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      !collegeComplete && styles.primaryButtonTextDisabled,
                    ]}
                  >
                    {isLoading ? 'Please wait…' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://collegepaglu.com/terms')}
              >
                Terms of Service
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
    paddingHorizontal: Math.min(24, SCREEN_WIDTH * 0.06),
    paddingBottom: 28,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
    gap: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoSectionTight: {
    paddingTop: 8,
  },
  logoRing: {
    padding: 14,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.black,
    width: 22,
    borderRadius: 4,
  },
  dotTrack: {
    width: 28,
    height: 2,
    backgroundColor: COLORS.mintBorder,
    borderRadius: 1,
  },
  headerSection: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  form: {
    marginBottom: 0,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  optionalHint: {
    fontSize: 12,
    color: COLORS.grayLight,
    marginBottom: 10,
  },
  yearContainer: {
    marginBottom: 4,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
    backgroundColor: COLORS.mintSoft,
  },
  yearButtonSelected: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.black,
  },
  yearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  yearButtonTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 8,
  },
  buttonSection: {
    marginBottom: 12,
  },
  primaryButton: {
    height: 54,
    backgroundColor: COLORS.black,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#C9D4CE',
  },
  primaryButtonLoading: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButtonTextDisabled: {
    color: '#F0F4F2',
  },
  step2Actions: {
    gap: 4,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.grayLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: COLORS.black,
    fontWeight: '600',
  },
});
