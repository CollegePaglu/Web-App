'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/utils/storage';

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await tokenStorage.clearAll();
    router.push('/login');
  };

  return (
    <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
      <h1>Profile</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '24px' }}>Your profile details.</p>
      
      <button 
        onClick={handleLogout}
        style={{
          padding: '12px 24px',
          background: 'var(--color-error)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
