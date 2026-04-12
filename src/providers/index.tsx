/**
 * App Providers
 * 
 * Combines all providers into a single component.
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from './ToastProvider';
import { QueryProvider } from './QueryProvider';
import { VendorCartProvider } from '../features/LazyPeeps/context/VendorCartContext';

import { ConfigProvider } from '../context/ConfigContext';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryProvider>
          <ConfigProvider>
            <ThemeProvider>
              <VendorCartProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </VendorCartProvider>
            </ThemeProvider>
          </ConfigProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Re-export hooks
export { useTheme } from '../context/ThemeContext';
export { useToast } from './ToastProvider';
export { queryClient } from './QueryProvider';

export default AppProviders;
