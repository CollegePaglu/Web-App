/**
 * useOTPTimer Hook
 * 
 * Manages OTP resend countdown timer.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OTP_CONFIG } from '@/config/constants';

interface UseOTPTimerReturn {
  countdown: number;
  isResendEnabled: boolean;
  startTimer: () => void;
  resetTimer: () => void;
  formattedTime: string;
}

export const useOTPTimer = (
  duration: number = OTP_CONFIG.RESEND_COOLDOWN_SECONDS
): UseOTPTimerReturn => {
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isResendEnabled = countdown === 0;

  // Format time as MM:SS
  const formattedTime = `${Math.floor(countdown / 60)}:${(countdown % 60)
    .toString()
    .padStart(2, '0')}`;

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle countdown
  useEffect(() => {
    if (countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countdown]);

  const startTimer = useCallback(() => {
    setCountdown(duration);
  }, [duration]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCountdown(0);
  }, []);

  return {
    countdown,
    isResendEnabled,
    startTimer,
    resetTimer,
    formattedTime,
  };
};

export default useOTPTimer;
