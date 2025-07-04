// lib/hooks/useWallet.ts
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ethers } from 'ethers'

const FLOW_EVM_TESTNET = {
  chainId: '0x221',
  chainName: 'Flow EVM Testnet',
  rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://evm-testnet.flowscan.org'],
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  }
};

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          console.log('Account changed:', accounts);
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            setAddress(accounts[0]);
          } else {
            setAddress(null);
            setProvider(null);
          }
        }, 1000);
      };

      // Check if already connected WITHOUT prompting
      window.ethereum.request({ 
        method: 'eth_accounts'  // Using eth_accounts instead of eth_requestAccounts
      })
        .then(handleAccountsChanged)
        .catch(console.error)

      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) return;

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== FLOW_EVM_TESTNET.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: FLOW_EVM_TESTNET.chainId }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Network not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [FLOW_EVM_TESTNET]
          });
        } else {
          throw error;
        }
      }
    }
  };

  const connect = async (walletType?: string) => {
    try {
      setIsConnecting(true)
      console.log('Starting wallet connection for:', walletType || 'MetaMask')
      
      if (!window.ethereum) {
        console.log('No ethereum object found')
        setError('Please install MetaMask or another EVM wallet')
        return
      }

      // Ensure we're on Flow EVM Testnet
      await ensureCorrectNetwork();

      console.log('Requesting accounts...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log('Accounts received:', accounts)
      if (accounts.length > 0) {
        console.log('Setting provider and address')
        setProvider(provider)
        setAddress(accounts[0])
        setError(null)
        return provider
      }
    } catch (err: any) {
      // Check for user rejection
      if (err.code === 4001 || err.message?.includes('rejected')) {
        // User rejected the request - this is normal, don't show an error
        console.log('User cancelled the connection request')
        return
      }
      
      // Handle other errors
      console.error('Wallet connection error:', err)
      setError('Failed to connect wallet')
      setProvider(null)
      setAddress(null)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWallet = useCallback(async () => {
    return connect()
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setProvider(null)
    setError(null)
  }, [])

  // Get signer if provider exists
  const getSigner = useCallback(async () => {
    if (provider && address) {
      try {
        const signer = await provider.getSigner();
        return signer;
      } catch (error) {
        console.error('Error getting signer:', error);
        return null;
      }
    }
    return null;
  }, [provider, address]);

  return {
    provider,
    address,
    isConnected: !!address,
    error,
    connect,
    connectWallet,
    disconnectWallet,
    isConnecting,
    getSigner  // ADD THIS
  }
}