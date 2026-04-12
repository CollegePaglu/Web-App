'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${digits}`, channel: 'whatsapp' }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      sessionStorage.setItem('cp_otp_phone', `+91${digits}`);
      router.push('/otp');
    } catch {
      setError('Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Welcome back 👋</h2>
      <p className={styles.subtitle}>Enter your phone number to continue.</p>

      <div className={styles.inputGroup}>
        <span className={styles.prefix}>+91</span>
        <input
          className={styles.input}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.btn} type="submit" disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Send OTP via WhatsApp'}
      </button>

      <p className={styles.hint}>
        We'll send a one-time password to verify your number.
      </p>
    </form>
  );
}
