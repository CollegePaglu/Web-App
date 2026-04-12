'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function PostDetailPage() {
  const params = useParams();
  
  return (
    <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
      <h1>Post Discussion</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Viewing post ID: {params.id}</p>
    </div>
  );
}
