// app/(client)/locations/florida/page.tsx
'use client';
import React from 'react';
import ArticleFeed from '../../../../components/reader/ArticleFeed'; // ✅ Fixed: 4 levels up, not 3

export default function FloridaPage() {
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
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          Florida News
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.1rem',
          color: 'var(--color-digital-silver)',
          maxWidth: '800px'
        }}>
          Discover verified local journalism from across Florida, permanently stored on the Flow EVM blockchain. 
          All articles are immutable and cannot be altered or removed.
        </p>
      </header>
      
      <main>
        <ArticleFeed />
      </main>
    </div>
  );
}