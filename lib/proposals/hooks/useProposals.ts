// lib/proposals/hooks/useProposals.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ProposalManager, ProposalData, ProposalStatus } from '@/lib/blockchain/contracts/ProposalManager';
import { ProposalEscrow, FundingInfo } from '@/lib/blockchain/contracts/ProposalEscrow';
import ProposalManagerDeployment from '@/deployments/ProposalManager.json';
import ProposalEscrowDeployment from '@/deployments/ProposalEscrow.json';
import { Proposal } from '@/lib/types/proposal';

export interface UseProposalsReturn {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  totalProposals: number;
  refetch: () => void;
}

export function useProposals(): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProposals, setTotalProposals] = useState(0);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create read-only provider
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      
      // Initialize contracts
      const proposalManager = new ProposalManager(ProposalManagerDeployment.address, provider);
      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, provider);

      // Get total proposals
      const total = await proposalManager.getTotalProposals();
      setTotalProposals(Number(total));

      if (Number(total) === 0) {
        setProposals([]);
        return;
      }

      // Fetch proposals (limit to 20 for now)
      const proposalsToFetch = Math.min(Number(total), 20);
      const proposalPromises = [];

      // Fetch in reverse order (newest first)
      for (let i = Number(total); i > Number(total) - proposalsToFetch; i--) {
        proposalPromises.push(fetchProposalWithFunding(i, proposalManager, proposalEscrow));
      }

      const fetchedProposals = await Promise.all(proposalPromises);
      const validProposals = fetchedProposals.filter(p => p !== null) as Proposal[];
      
      setProposals(validProposals);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposalWithFunding = async (
    id: number,
    proposalManager: ProposalManager,
    proposalEscrow: ProposalEscrow
  ): Promise<Proposal | null> => {
    try {
      // Get proposal data - convert number to string for the contract call
      const proposalData = await proposalManager.getProposal(id.toString());
      
      if (!proposalData) {
        return null;
      }

      // Get funding data
      let fundingData: FundingInfo | null = null;
      let isInitialized = false;
      
      try {
        isInitialized = await proposalEscrow.isFundingInitialized(id.toString());
        if (isInitialized) {
          fundingData = await proposalEscrow.getFundingInfo(id.toString());
        }
      } catch {
        // Funding might not be initialized
      }

      // Use default values if no funding data
      const totalFunded = fundingData?.totalFunded || '0';
      const nftsSold = fundingData?.nftsSold || 0;

      // Convert to UI format
      const fundingGoalInFlow = parseFloat(ethers.formatEther(proposalData.fundingGoal));
      const fundingAmountInFlow = parseFloat(ethers.formatEther(totalFunded));
      
      // Map status
      let uiStatus: 'active' | 'completed' | 'canceled' = 'active';
      if (proposalData.status === ProposalStatus.CANCELLED) {
        uiStatus = 'canceled';
      } else if (proposalData.status === ProposalStatus.PUBLISHED) {
        uiStatus = 'completed';
      }

      // Calculate vote count (using NFTs sold as proxy for engagement)
      const voteCount = Number(nftsSold) * 10; // Arbitrary multiplier for display

      return {
        id: id.toString(),
        title: proposalData.title,
        summary: proposalData.tldr,
        proposer: proposalData.proposer,
        proposerName: `${proposalData.proposer.slice(0, 6)}...${proposalData.proposer.slice(-4)}`,
        createdAt: new Date(Number(proposalData.createdAt) * 1000).toISOString(),
        location: proposalData.location,
        category: proposalData.category,
        status: uiStatus,
        voteCount: voteCount,
        fundingAmount: fundingAmountInFlow,
        fundingGoal: fundingGoalInFlow,
        imageUrl: undefined,
        description: proposalData.description,
        tags: proposalData.tags || [],
        journalistInterest: 0, // Not implemented yet
        timeline: proposalData.timeline,
        contentFormat: proposalData.contentFormat,
        updates: []
      };
    } catch (err) {
      console.error(`Error fetching proposal ${id}:`, err);
      return null;
    }
  };

  const refetch = () => {
    fetchProposals();
  };

  return {
    proposals,
    loading,
    error,
    totalProposals,
    refetch
  };
}