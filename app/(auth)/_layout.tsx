/**
 * Auth Layout
 * 
 * Stack navigator for authentication screens.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { extendedColors as colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.neutral[0],
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="splash"
        options={{
          animation: 'fade',
          contentStyle: { backgroundColor: '#F5F5F0' },
        }}
      />
      <Stack.Screen name="phone-input" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="profile-complete" />
      <Stack.Screen name="society-login" />
      <Stack.Screen name="society-registration" />
    </Stack>
  );
}
