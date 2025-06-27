'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';

export default function EmojiCreditBalance() {
  const { address, isConnected } = useWallet();
  const [emojiBalance, setEmojiBalance] = useState<number>(0);

  if (!isConnected) {
    return (
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p style={{ margin: '0', fontSize: '0.9rem' }}>
            Connect wallet to view your collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      marginBottom: '1rem'
    }}>
      <h4 style={{ 
        margin: '0 0 1rem 0', 
        fontSize: '1rem',
        color: '#333'
      }}>
        My Dashboard
      </h4>
      
      {/* EMOJI Credits */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        padding: '0.5rem 0'
      }}>
        <span style={{ fontSize: '0.9rem' }}>EMOJI Credits</span>
        <strong style={{ color: '#e74c3c' }}>{emojiBalance.toLocaleString()}</strong>
      </div>

      {/* Basic Stats */}
      <div style={{ 
        borderTop: '1px solid #dee2e6',
        paddingTop: '0.75rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.9rem' }}>Bookmarks</span>
          <strong style={{ color: '#2B3990' }}>0</strong>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.9rem' }}>Curated</span>
          <strong style={{ color: '#1D7F6E' }}>0</strong>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.9rem' }}>Rank</span>
          <strong style={{ color: '#666' }}>-</strong>
        </div>
      </div>
    </div>
  );
}