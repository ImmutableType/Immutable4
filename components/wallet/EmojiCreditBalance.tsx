'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { ethers } from 'ethers';

const EMOJI_TOKEN_ADDRESS = '0x572F036576D1D9F41876e714D47f69CEa6933c36';
const EMOJI_TOKEN_ABI = [
  'function balanceOf(address owner) external view returns (uint256)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)'
];

export default function EmojiCreditBalance() {
  const { address, isConnected } = useWallet();
  const [emojiBalance, setEmojiBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 FETCH EMOJI BALANCE from blockchain
  const fetchEmojiBalance = async () => {
    if (!address || !isConnected) {
      setEmojiBalance(0);
      return;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const contract = new ethers.Contract(EMOJI_TOKEN_ADDRESS, EMOJI_TOKEN_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      // Convert from wei to EMOJI tokens
      const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
      setEmojiBalance(Math.floor(formattedBalance)); // Show whole numbers
      
      console.log('✅ EMOJI balance updated:', formattedBalance);
    } catch (error) {
      console.error('❌ Error fetching EMOJI balance:', error);
      setEmojiBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 LISTEN FOR BALANCE CHANGES via custom event
  useEffect(() => {
    const handleBalanceChange = () => {
      console.log('🔔 Balance change event received, refreshing...');
      fetchEmojiBalance();
    };
    
    window.addEventListener('emojiBalanceChanged', handleBalanceChange);
    return () => window.removeEventListener('emojiBalanceChanged', handleBalanceChange);
  }, [address, isConnected]);

  // Initial balance fetch when wallet connects
  useEffect(() => {
    fetchEmojiBalance();
  }, [address, isConnected]);

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
        <strong style={{ color: '#e74c3c' }}>
          {isLoading ? 'Loading...' : emojiBalance.toLocaleString()}
        </strong>
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