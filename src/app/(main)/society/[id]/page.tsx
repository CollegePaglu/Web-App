'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function SocietyProfilePage() {
  const params = useParams();
  
  return (
    <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
      <h1>Society Profile</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Viewing society ID: {params.id}</p>
    </div>
  );
}
