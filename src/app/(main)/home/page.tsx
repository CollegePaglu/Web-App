'use client';

import React from 'react';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.stories}>
        {/* Placeholder for stories */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.storyCircle} />
        ))}
      </div>
      
      <div className={styles.feed}>
        {/* Placeholder for posts */}
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.postCard}>
            <div className={styles.postHeader}>
              <div className={styles.postAvatar} />
              <div className={styles.postMeta}>
                <div className={styles.postAuthor} />
                <div className={styles.postTime} />
              </div>
            </div>
            <div className={styles.postContent} />
            <div className={styles.postActions} />
          </div>
        ))}
      </div>
    </div>
  );
}
