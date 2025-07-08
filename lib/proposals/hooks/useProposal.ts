// lib/proposals/hooks/useProposal.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ProposalManager, ProposalData } from '@/lib/blockchain/contracts/ProposalManager';
import ProposalManagerDeployment from '@/deployments/ProposalManager.json';

export interface UseProposalReturn {
  proposal: ProposalData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProposal(proposalId: string | undefined): UseProposalReturn {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = async () => {
    if (!proposalId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Connect to Flow EVM
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const proposalManager = new ProposalManager(ProposalManagerDeployment.address, provider);

      // Fetch proposal from blockchain
      const proposalData = await proposalManager.getProposal(proposalId);
      
      if (!proposalData) {
        throw new Error('Proposal not found');
      }

      setProposal(proposalData);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  return {
    proposal,
    loading,
    error,
    refetch: fetchProposal
  };
}