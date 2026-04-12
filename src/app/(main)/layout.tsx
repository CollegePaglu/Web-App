import React from 'react';
import { TabBar } from '@/components/navigation/TabBar';
import styles from './main.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.logo}>CP</span>
          <div className={styles.profileBtn} />
        </div>
      </header>
      
      <main className={styles.main}>
        {children}
      </main>
      
      <TabBar />
    </div>
  );
}
