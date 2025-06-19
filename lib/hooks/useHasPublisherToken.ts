// lib/hooks/useHasPublisherToken.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

const PUBLISHER_TOKEN_ADDRESS = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21';
const PUBLISHER_TOKEN_ABI = [
  "function hasValidCredential(address journalist) external view returns (bool)",
  "function journalistToTokenId(address journalist) external view returns (uint256)"
];

export function useHasPublisherToken() {
  const { address, isConnected } = useWallet();
  const [hasPublisherToken, setHasPublisherToken] = useState(false);
  const [publisherTokenId, setPublisherTokenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkPublisher() {
      if (!isConnected || !address) {
        setHasPublisherToken(false);
        setPublisherTokenId(null);
        return;
      }

      setIsLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const contract = new ethers.Contract(PUBLISHER_TOKEN_ADDRESS, PUBLISHER_TOKEN_ABI, provider);
        
        const hasCredential = await contract.hasValidCredential(address);
        setHasPublisherToken(hasCredential);
        
        if (hasCredential) {
          const tokenId = await contract.journalistToTokenId(address);
          setPublisherTokenId(Number(tokenId));
        }
      } catch (error) {
        console.error('Error checking publisher token:', error);
        setHasPublisherToken(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkPublisher();
  }, [address, isConnected]);

  return { hasPublisherToken, publisherTokenId, isLoading };
}
