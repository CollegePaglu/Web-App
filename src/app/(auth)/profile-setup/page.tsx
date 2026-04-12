'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/features/auth';
import styles from '../auth.module.css';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ firstName: '', lastName: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { firstName, lastName, username } = form;
    if (!firstName.trim() || !username.trim()) {
      setError('First name and username are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USERS.COMPLETE_PROFILE, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim().toLowerCase(),
      });

      const updatedUser = response.data?.data;
      if (updatedUser) {
        setUser(updatedUser);
      }

      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Complete your profile</h2>
      <p className={styles.subtitle}>Tell us a bit about yourself to get started.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <input
          className={styles.input}
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          autoComplete="given-name"
          required
        />
        <input
          className={styles.input}
          type="text"
          name="lastName"
          placeholder="Last Name (optional)"
          value={form.lastName}
          onChange={handleChange}
          autoComplete="family-name"
        />
        <input
          className={styles.input}
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.btn} type="submit" disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Complete Setup'}
      </button>
    </form>
  );
}

