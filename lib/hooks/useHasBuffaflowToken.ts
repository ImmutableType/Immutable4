// lib/hooks/useHasBuffaflowToken.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

const BUFFAFLOW_CONTRACT_ADDRESS = '0xc8654A7a4BD671D4cEac6096A92a3170FA3b4798';
const FLOW_EVM_MAINNET_RPC = 'https://mainnet.evm.nodes.onflow.org';

const BUFFAFLOW_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function erc721BalanceOf(address) view returns (uint256)"
];

export function useHasBuffaflowToken() {
  const { address, isConnected } = useWallet();
  const [hasToken, setHasToken] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [nftCount, setNftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Minimum threshold: 100 tokens
  const MIN_BUFFAFLOW_TOKENS = ethers.parseEther("100");

  useEffect(() => {
    async function checkBuffaflowTokens() {
      if (!isConnected || !address) {
        setHasToken(false);
        setTokenBalance('0');
        setNftCount(0);
        return;
      }

      setIsLoading(true);
      console.log('🦬 Starting BUFFAFLOW check for:', address);
      
      try {
        // Always check mainnet regardless of current network
        const provider = new ethers.JsonRpcProvider(FLOW_EVM_MAINNET_RPC);
        const contract = new ethers.Contract(
          BUFFAFLOW_CONTRACT_ADDRESS,
          BUFFAFLOW_ABI,
          provider
        );

        console.log('🦬 Created provider and contract, checking balance...');

        // Check token balance with timeout
        const balancePromise = contract.balanceOf(address);
        const balance = await Promise.race([
          balancePromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]) as bigint;
        
        const hasEnoughTokens = balance >= MIN_BUFFAFLOW_TOKENS;
        const formattedBalance = ethers.formatEther(balance);
        setTokenBalance(formattedBalance);

        console.log('🦬 Token balance:', formattedBalance, 'hasEnough:', hasEnoughTokens);

        // Check NFT balance (ERC-404 feature) with error handling
        let nftBalance = 0;
        try {
          const nftBalancePromise = contract.erc721BalanceOf(address);
          nftBalance = Number(await Promise.race([
            nftBalancePromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('NFT Timeout')), 5000)
            )
          ]));
          setNftCount(nftBalance);
          console.log('🦬 NFT balance:', nftBalance);
        } catch (nftError) {
          console.log('🦬 No NFT balance function available or error:', nftError);
          setNftCount(0);
        }

        // Has token if: enough tokens OR any NFTs
        const hasAccess = hasEnoughTokens || nftBalance > 0;
        setHasToken(hasAccess);

        console.log(`🦬 Final result for ${address}:`, {
          tokenBalance: formattedBalance,
          nftCount,
          hasAccess
        });

      } catch (error) {
        console.error('🦬 Error checking $BUFFAFLOW tokens:', error);
        setHasToken(false);
        setTokenBalance('0');
        setNftCount(0);
      } finally {
        setIsLoading(false);
      }
    }

    // Add a small delay to avoid rate limiting
    const timer = setTimeout(checkBuffaflowTokens, 1000);
    return () => clearTimeout(timer);
  }, [address, isConnected]);

  return { 
    hasToken, 
    tokenBalance, 
    nftCount, 
    isLoading,
    minTokensRequired: "100"
  };
}