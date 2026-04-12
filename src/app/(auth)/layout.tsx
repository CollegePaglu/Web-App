import type { Metadata } from 'next';
import styles from './auth.module.css';

export const metadata: Metadata = { title: 'Sign In — CollegePaglu' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>CP</span>
          <h1 className={styles.brandName}>CollegePaglu</h1>
          <p className={styles.tagline}>Your campus, connected.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
