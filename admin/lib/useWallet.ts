import { useState, useEffect } from 'react';
import { contractService } from './contractService';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      console.log('🔍 useWallet: Starting connection...');
      
      // Check if MetaMask exists
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }
      console.log('✅ MetaMask detected');

      // Request accounts - this should trigger the permission popup
      console.log('📍 Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('📍 Accounts received:', accounts);
      
      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Set address
      setAddress(accounts[0]);
      console.log('📍 Address set:', accounts[0]);
      
      // Initialize contract service
      console.log('📍 Initializing contracts...');
      await contractService.connectWallet();
      console.log('✅ Contracts initialized');
      
      setIsConnected(true);
      console.log('✅ Connection complete');
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    console.log('🔌 Wallet disconnected');
  };

  return {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet
  };
}