/**
 * Toast Provider
 * 
 * Global toast notification system.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, ToastData, ToastType } from '@/components/feedback/Toast';
import { generateId } from '@/utils/helpers';

interface ToastContextValue {
  showToast: (options: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  hideToast: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 3;

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Clear timeout
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: Omit<ToastData, 'id'>) => {
      const id = generateId();
      const duration = options.duration ?? DEFAULT_DURATION;

      const newToast: ToastData = {
        ...options,
        id,
        duration,
      };

      setToasts((prev) => {
        // Remove oldest if at max
        const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...updated, newToast];
      });

      // Auto dismiss
      if (duration > 0) {
        const timeout = setTimeout(() => {
          hideToast(id);
        }, duration);
        timeoutsRef.current.set(id, timeout);
      }
    },
    [hideToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 5000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  const hideAll = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    hideAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={hideToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

export default ToastProvider;
