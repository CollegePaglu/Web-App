/**
 * App Entry Point
 * 
 * Handles initial routing based on auth state.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useIsAuthenticated, useAuthInitialized } from '../src/features/auth';
import { Loading } from '../src/components/feedback/Loading';
import { extendedColors as colors } from '../src/theme/colors';

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Loading fullScreen message="Starting up..." />
      </View>
    );
  }

  // Always show splash on app start
  // Splash screen handles auth redirection
  return <Redirect href="/(auth)/splash" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
});
