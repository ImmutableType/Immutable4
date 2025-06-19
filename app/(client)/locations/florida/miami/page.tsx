// app/(client)/locations/florida/miami/page.tsx
'use client';
import React, { useState } from 'react';
import LocationArticleFeed from '../../../../../components/locations/LocationArticleFeed';

export default function MiamiPage() {
  const [timeFilter, setTimeFilter] = useState<'all' | 'latest' | 'week'>('all');

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
          Miami News
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.1rem',
          color: 'var(--color-digital-silver)',
          maxWidth: '800px',
          marginBottom: '1.5rem'
        }}>
          Local journalism from Miami, Florida - verified and permanently archived on blockchain.
        </p>

        {/* Simple Time Filter */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {[
            { key: 'all', label: 'All Time' },
            { key: 'latest', label: 'Latest' },
            { key: 'week', label: 'This Week' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--color-digital-silver)',
                borderRadius: '4px',
                backgroundColor: timeFilter === filter.key ? 'var(--color-blockchain-blue)' : 'transparent',
                color: timeFilter === filter.key ? 'white' : 'var(--color-black)',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>
      
      <main>
        <LocationArticleFeed
          city="Miami"
          state="Florida"
          filters={{
            recency: timeFilter,
            contentType: 'all'
          }}
        />
      </main>
    </div>
  );
}