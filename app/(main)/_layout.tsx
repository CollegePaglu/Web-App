/**
 * Main App Layout
 * 
 * Protected routes wrapper.
 */

import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useIsAuthenticated, useAuthInitialized } from '../../src/features/auth';
import { Loading } from '../../src/components/feedback/Loading';
import { extendedColors as colors } from '../../src/theme/colors';

export default function MainLayout() {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();

  // Show loading while checking auth
  if (!isInitialized) {
    return <Loading fullScreen message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/phone-input" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.neutral[0],
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
