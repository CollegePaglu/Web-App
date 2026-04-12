/**
 * useAppState Hook
 * 
 * Monitors app state changes (active, background, inactive).
 */

import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateOptions {
  onForeground?: () => void;
  onBackground?: () => void;
  onChange?: (state: AppStateStatus) => void;
}

export const useAppState = (options?: UseAppStateOptions) => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousState = appStateRef.current;

      // Detect foreground transition
      if (
        previousState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        options?.onForeground?.();
      }

      // Detect background transition
      if (
        previousState === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        options?.onBackground?.();
      }

      // General change callback
      options?.onChange?.(nextAppState);

      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [options?.onForeground, options?.onBackground, options?.onChange]);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
};

export default useAppState;
