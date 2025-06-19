// File: app/(client)/reader/page.tsx
'use client';

import React from 'react';
import ArticleFeed from '../../../components/reader/ArticleFeed';

export default function ReaderPage() {
  return (
    <div style={{ 
      padding: '1rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem'
        }}>
          Reader
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.1rem',
          color: 'var(--color-digital-silver)',
          maxWidth: '800px'
        }}>
          Discover immutable journalism stored on the Flow EVM blockchain. All articles are permanently archived and cannot be altered or removed.
        </p>
      </header>
      
      <main>
        <ArticleFeed />
      </main>
    </div>
  );
}