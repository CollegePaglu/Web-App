/**
 * Root Layout
 * 
 * Configures app providers and navigation container.
 */

import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders, useTheme } from '../src/providers';
import { useAuthStore } from '../src/features/auth';
import { extendedColors as colors } from '../src/theme/colors';
import { apiCircuitBreaker } from '../src/utils/circuitBreaker';
import { lastActiveStorage } from '../src/utils/storage';
import { env } from '../src/config/env';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { initialize, isInitialized, isAuthenticated } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Trigger auth initialization on mount
  useEffect(() => {
    // In development, reset circuit breaker on app startup to allow recovery
    if (env.IS_DEVELOPMENT) {
      const cbMetrics = apiCircuitBreaker.getMetrics();
      if (cbMetrics.state !== 'CLOSED') {
        console.log('🔄 [App Startup] Resetting circuit breaker for fresh development session');
        apiCircuitBreaker.reset();
      }
    }

    initialize();
  }, [initialize]);

  // Record last-active timestamp on every app foreground
  useEffect(() => {
    if (!isAuthenticated) return;

    // Record on initial mount
    lastActiveStorage.set();

    // Record whenever app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && useAuthStore.getState().isAuthenticated) {
        lastActiveStorage.set();
        if (env.ENABLE_DEBUG_LOGS) {
          console.log('🕐 Last active timestamp updated');
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  // Hide splash screen when both fonts and auth are ready
  useEffect(() => {
    if (isInitialized && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, fontsLoaded]);

  if (!isInitialized || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? colors.black : '#f8f6f3', // Base background (darker warm beige)
          },
          headerStyle: {
            backgroundColor: isDark ? colors.black : '#f8f6f3',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
