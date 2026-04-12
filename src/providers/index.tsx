'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ConfigProvider } from '@/context/ConfigContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </QueryProvider>
  );
}
