'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import styles from './otp.module.css';

export default function OtpPage() {
  const router = useRouter();
  const { verifyOTP, isLoading, error, clearError } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('cp_otp_phone');
    if (!savedPhone) {
      router.replace('/login');
    } else {
      setPhone(savedPhone);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await verifyOTP(phone, otp);

    if (result.success) {
      sessionStorage.removeItem('cp_otp_phone');

      if (result.needsProfileComplete || result.isNewUser) {
        router.push('/profile-setup');
      } else {
        router.push('/home');
      }
    }
  };

  const handleResend = () => {
    router.back();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Verify it's you</h2>
      <p className={styles.subtitle}>
        We sent a 6-digit code to <br />
        <strong>{phone}</strong>
      </p>

      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoFocus
          required
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.btn} type="submit" disabled={isLoading || otp.length !== 6}>
        {isLoading ? <span className={styles.spinner} /> : 'Verify & Continue'}
      </button>

      <p className={styles.hint}>
        Didn't receive the code?{' '}
        <button type="button" className={styles.linkBtn} onClick={handleResend}>
          Resend
        </button>
      </p>
    </form>
  );
}

