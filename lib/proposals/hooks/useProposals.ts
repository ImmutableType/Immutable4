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
      const totalCount = Number(total);
      setTotalProposals(totalCount);
      
      console.log('Total proposals:', totalCount);

      if (totalCount === 0) {
        setProposals([]);
        return;
      }

      // Fetch proposals (limit to 20 for now)
      const proposalsToFetch = Math.min(totalCount, 20);
      const proposalPromises = [];

      // Fetch from 1 to totalCount (proposals are 1-indexed)
      for (let i = totalCount; i >= Math.max(1, totalCount - proposalsToFetch + 1); i--) {
        console.log(`Fetching proposal ${i}`);
        proposalPromises.push(fetchProposalWithFunding(i, proposalManager, proposalEscrow));
      }

      const fetchedProposals = await Promise.all(proposalPromises);
      const validProposals = fetchedProposals.filter(p => p !== null) as Proposal[];
      
      console.log('Valid proposals fetched:', validProposals.length);
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
      // Ensure we're passing a clean string representation of the integer
      const proposalId = id.toString();
      console.log(`Fetching proposal data for ID: ${proposalId}`);
      
      const proposalData = await proposalManager.getProposal(proposalId);
      
      if (!proposalData) {
        console.log(`No data found for proposal ${proposalId}`);
        return null;
      }

      console.log(`Proposal ${proposalId} data:`, proposalData);

      // Get funding data
      let fundingData: FundingInfo | null = null;
      let isInitialized = false;
      
      try {
        isInitialized = await proposalEscrow.isFundingInitialized(proposalId);
        console.log(`Proposal ${proposalId} funding initialized:`, isInitialized);
        
        if (isInitialized) {
          fundingData = await proposalEscrow.getFundingInfo(proposalId);
          console.log(`Proposal ${proposalId} funding data:`, fundingData);
        }
      } catch (err) {
        console.log(`Error fetching funding data for proposal ${proposalId}:`, err);
        // Continue without funding data
      }

      // Use default values if no funding data
      const totalFunded = fundingData?.totalFunded || '0';
      const nftsSold = fundingData?.nftsSold || 0;

      // Convert to UI format - handle the fundingGoal conversion carefully
      let fundingGoalInFlow = 0;
      let fundingAmountInFlow = 0;
      
      try {
        // Ensure fundingGoal is a string that represents a valid BigNumber in wei
        const fundingGoalString = proposalData.fundingGoal.toString();
        console.log(`Funding goal raw value: ${fundingGoalString}`);
        
        // If it contains a decimal, it might already be in FLOW
        if (fundingGoalString.includes('.')) {
          // It's already in FLOW, just parse it
          fundingGoalInFlow = parseFloat(fundingGoalString);
        } else {
          // It's in wei, convert to FLOW
          fundingGoalInFlow = parseFloat(ethers.formatEther(fundingGoalString));
        }
        
        // Convert funded amount
        fundingAmountInFlow = parseFloat(ethers.formatEther(totalFunded));
      } catch (err) {
        console.error(`Error converting funding amounts for proposal ${proposalId}:`, err);
        console.error('fundingGoal value:', proposalData.fundingGoal);
        console.error('totalFunded value:', totalFunded);
        
        // Try alternative parsing
        try {
          // If the value is already a number in FLOW (like 101.0)
          fundingGoalInFlow = Number(proposalData.fundingGoal);
          fundingAmountInFlow = totalFunded ? Number(totalFunded) : 0;
        } catch (err2) {
          console.error('Alternative parsing also failed:', err2);
          fundingGoalInFlow = 0;
          fundingAmountInFlow = 0;
        }
      }
      
      // Map status
      let uiStatus: 'active' | 'completed' | 'canceled' = 'active';
      if (proposalData.status === ProposalStatus.CANCELLED) {
        uiStatus = 'canceled';
      } else if (proposalData.status === ProposalStatus.PUBLISHED) {
        uiStatus = 'completed';
      }

      // Calculate vote count (using NFTs sold as proxy for engagement)
      const voteCount = Number(nftsSold) * 10; // Arbitrary multiplier for display

      const proposal: Proposal = {
        id: proposalId,
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

      console.log(`Successfully processed proposal ${proposalId}`);
      return proposal;
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