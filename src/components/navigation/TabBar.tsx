'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './tabbar.module.css';

export function TabBar() {
  const pathname = usePathname();

  const tabs = [
    { name: 'CampusMart', href: '/campusmart', icon: '🏪' },
    { name: 'Home', href: '/home', icon: '🏠' },
    { name: 'Create', href: '/post', icon: '➕', isAdd: true },
    { name: 'Updates', href: '/updates', icon: '📢' },
    { name: 'LazyPeeps', href: '/lazzypeeps', icon: '🗞️' },
  ];

  // Don't show tab bar on specific routes if needed
  if (['/post/new', '/profile/edit'].includes(pathname)) {
    return null;
  }

  return (
    <nav className={styles.tabbar}>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          
          if (tab.isAdd) {
            return (
              <Link key={tab.href} href={tab.href} className={styles.addBtnContainer}>
                <div className={styles.addBtn}>
                  <span className={styles.addIcon}>{tab.icon}</span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={tab.href} href={tab.href} className={`${styles.tab} ${isActive ? styles.active : ''}`}>
              <span className={styles.icon}>{tab.icon}</span>
              {isActive && <div className={styles.indicator} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
