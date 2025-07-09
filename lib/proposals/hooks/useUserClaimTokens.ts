// lib/proposals/hooks/useUserClaimTokens.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ClaimToken } from '@/lib/blockchain/contracts/ClaimToken';
import { ProposalManager, ProposalStatus } from '@/lib/blockchain/contracts/ProposalManager';
import ClaimTokenDeployment from '@/deployments/ClaimToken.json';
import ProposalManagerDeployment from '@/deployments/ProposalManager.json';
import { useWallet } from '@/lib/hooks/useWallet';

export interface ClaimableArticle {
  proposalId: string;
  proposalTitle: string;
  nftCount: number;
  isPublished: boolean;
  tokenIds: number[];
}

export interface UseUserClaimTokensReturn {
  claimableArticles: ClaimableArticle[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserClaimTokens(): UseUserClaimTokensReturn {
  const { isConnected, address, provider } = useWallet();
  const [claimableArticles, setClaimableArticles] = useState<ClaimableArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserClaimTokens();
    } else {
      setClaimableArticles([]);
    }
  }, [isConnected, address]);

  const fetchUserClaimTokens = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      // Use wallet provider or default
      const currentProvider = provider || new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const claimToken = new ClaimToken(ClaimTokenDeployment.address, currentProvider);
      const proposalManager = new ProposalManager(ProposalManagerDeployment.address, currentProvider);

      // Get user's ClaimToken balance
      let balance;
      try {
        balance = await claimToken.balanceOf(address);
      } catch (err) {
        console.log('Error getting ClaimToken balance:', err);
        setClaimableArticles([]);
        return;
      }
      
      console.log(`User has ${balance} ClaimTokens`);
      
      if (Number(balance) === 0) {
        setClaimableArticles([]);
        return;
      }

      // Since we can't enumerate tokens, we'll need to check token IDs sequentially
      // This is not ideal but works for MVP
      const proposalMap = new Map<number, { tokens: number[], allocation: number }>();
      const maxTokenId = 100; // Check first 100 token IDs (adjust as needed)
      
      for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
        try {
          // Check if user owns this token
          const owner = await claimToken.ownerOf(tokenId);
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            console.log(`User owns token ${tokenId}`);
            
            // Get token data
            const tokenData = await claimToken.getTokenData(tokenId);
            const proposalId = Number(tokenData.proposalId);
            const allocation = Number(tokenData.nftAllocation);
            
            const existing = proposalMap.get(proposalId) || { tokens: [], allocation: 0 };
            existing.tokens.push(tokenId);
            existing.allocation += allocation;
            proposalMap.set(proposalId, existing);
          }
        } catch (err) {
          // Token doesn't exist or other error, continue
          continue;
        }
      }

      // Fetch proposal details
      const claimables: ClaimableArticle[] = [];
      
      // Convert Map entries to array for iteration
      const entries = Array.from(proposalMap.entries());
      
      for (const [proposalId, data] of entries) {
        try {
          const proposal = await proposalManager.getProposal(proposalId.toString());
          
          if (proposal) {
            claimables.push({
              proposalId: proposalId.toString(),
              proposalTitle: proposal.title,
              nftCount: data.allocation, // Use allocation instead of token count
              isPublished: proposal.status === ProposalStatus.PUBLISHED,
              tokenIds: data.tokens
            });
          }
        } catch (err) {
          console.error(`Error fetching proposal ${proposalId}:`, err);
        }
      }

      console.log('Claimable articles:', claimables);
      setClaimableArticles(claimables);
    } catch (err) {
      console.error('Error fetching claim tokens:', err);
      // Don't show error to user if they just don't have tokens
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchUserClaimTokens();
  };

  return {
    claimableArticles,
    loading,
    error,
    refetch
  };
}