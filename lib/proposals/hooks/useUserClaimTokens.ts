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
      const balance = await claimToken.balanceOf(address);
      
      if (Number(balance) === 0) {
        setClaimableArticles([]);
        return;
      }

      // Get token IDs owned by user
      const tokenPromises = [];
      for (let i = 0; i < Number(balance); i++) {
        tokenPromises.push(claimToken.tokenOfOwnerByIndex(address, i));
      }
      
      const tokenIds = await Promise.all(tokenPromises);

      // Group by proposal ID
      const proposalMap = new Map<number, number[]>();
      
      for (const tokenId of tokenIds) {
        const proposalId = await claimToken.getProposalId(Number(tokenId));
        const tokens = proposalMap.get(proposalId) || [];
        tokens.push(Number(tokenId));
        proposalMap.set(proposalId, tokens);
      }

      // Fetch proposal details
      const claimables: ClaimableArticle[] = [];
      
      // Convert Map entries to array for iteration
      const entries = Array.from(proposalMap.entries());
      
      for (const [proposalId, tokens] of entries) {
        try {
          const proposal = await proposalManager.getProposal(proposalId.toString());
          
          if (proposal) {
            claimables.push({
              proposalId: proposalId.toString(),
              proposalTitle: proposal.title,
              nftCount: tokens.length,
              isPublished: proposal.status === ProposalStatus.PUBLISHED,
              tokenIds: tokens
            });
          }
        } catch (err) {
          console.error(`Error fetching proposal ${proposalId}:`, err);
        }
      }

      setClaimableArticles(claimables);
    } catch (err) {
      console.error('Error fetching claim tokens:', err);
      setError('Failed to load claimable articles');
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