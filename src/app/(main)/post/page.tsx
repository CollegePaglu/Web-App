'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();

  return (
    <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
      <h1>Create Post</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '24px' }}>Share what's on your mind.</p>
      
      <button 
        onClick={() => router.back()}
        style={{
          padding: '12px 24px',
          background: 'var(--color-border-strong)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600
        }}
      >
        Cancel
      </button>
    </div>
  );
}
