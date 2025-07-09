// lib/proposals/hooks/useProposalFunding.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import { ProposalEscrow, FundingInfo, ContributeFundingParams } from '@/lib/blockchain/contracts/ProposalEscrow';
import ProposalEscrowDeployment from '@/deployments/ProposalEscrow.json';

export enum FundingTransactionState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  CONFIRMING = 'confirming',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface UseProposalFundingReturn {
  fundingInfo: FundingInfo | null;
  userContribution: number;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  transactionState: FundingTransactionState;
  txHash: string | null;
  initializeFunding: () => Promise<boolean>;
  contributeFunding: (nftQuantity: number, nftPrice: string) => Promise<boolean>;
  withdrawFunding: () => Promise<boolean>;
  finalizeFunding: () => Promise<boolean>;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useProposalFunding(proposalId: string | undefined): UseProposalFundingReturn {
  const { provider, address, getSigner } = useWallet();
  const [fundingInfo, setFundingInfo] = useState<FundingInfo | null>(null);
  const [userContribution, setUserContribution] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionState, setTransactionState] = useState<FundingTransactionState>(FundingTransactionState.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTransactionState(FundingTransactionState.IDLE);
    setError(null);
    setTxHash(null);
  }, []);

  const fetchFundingData = useCallback(async () => {
    if (!proposalId || !ProposalEscrowDeployment?.address) return;

    try {
      setLoading(true);
      setError(null);

      // Use either wallet provider or default RPC
      const currentProvider = provider || new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, currentProvider);

      // Check if funding is initialized
      const initialized = await proposalEscrow.isFundingInitialized(proposalId);
      setIsInitialized(initialized);

      if (initialized) {
        // Fetch funding info
        const info = await proposalEscrow.getFundingInfo(proposalId);
        setFundingInfo(info);

        // Fetch user contribution if wallet connected
        if (address) {
          const contribution = await proposalEscrow.getContribution(proposalId, address);
          setUserContribution(contribution);
        }
      }
    } catch (err) {
      console.error('Error fetching funding data:', err);
      setError('Failed to load funding information');
    } finally {
      setLoading(false);
    }
  }, [proposalId, provider, address]);

  useEffect(() => {
    fetchFundingData();
  }, [fetchFundingData]);

  const initializeFunding = useCallback(async (): Promise<boolean> => {
    if (!provider || !proposalId) {
      setError('No wallet connected or invalid proposal');
      return false;
    }

    try {
      setTransactionState(FundingTransactionState.INITIALIZING);
      setError(null);

      const signer = await getSigner();
      if (!signer) {
        throw new Error('Failed to get signer');
      }

      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, signer);
      const tx = await proposalEscrow.initializeFunding(proposalId, signer);
      
      setTxHash(tx.hash);
      setTransactionState(FundingTransactionState.PENDING);

      await tx.wait();
      
      setTransactionState(FundingTransactionState.SUCCESS);
      await fetchFundingData(); // Refresh data
      return true;
    } catch (err: any) {
      console.error('Initialize funding error:', err);
      setError(err.message || 'Failed to initialize funding');
      setTransactionState(FundingTransactionState.ERROR);
      return false;
    }
  }, [provider, proposalId, getSigner, fetchFundingData]);

  const contributeFunding = useCallback(async (nftQuantity: number, nftPrice: string): Promise<boolean> => {
    if (!provider || !proposalId) {
      setError('No wallet connected or invalid proposal');
      return false;
    }

    try {
      setTransactionState(FundingTransactionState.CONFIRMING);
      setError(null);

      const signer = await getSigner();
      if (!signer) {
        throw new Error('Failed to get signer');
      }

      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, signer);
      
      const params: ContributeFundingParams = {
        proposalId,
        nftQuantity,
        nftPrice
      };

      const tx = await proposalEscrow.contributeFunding(params, signer);
      
      setTxHash(tx.hash);
      setTransactionState(FundingTransactionState.PENDING);

      const result = await proposalEscrow.waitForFundingContribution(tx.hash);
      
      if (result) {
        setTransactionState(FundingTransactionState.SUCCESS);
        await fetchFundingData(); // Refresh data
        return true;
      } else {
        throw new Error('Failed to confirm contribution');
      }
    } catch (err: any) {
      console.error('Contribute funding error:', err);
      
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('rejected')) {
        setError('Transaction rejected by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient FLOW balance');
      } else if (err.message?.includes('Already contributed')) {
        setError('You have already contributed to this proposal');
      } else if (err.message?.includes('Exceeds per-wallet limit')) {
        setError('Exceeds per-wallet NFT limit');
      } else if (err.message?.includes('Exceeds oversubscription limit')) {
        setError('This proposal has reached its funding limit');
      } else {
        setError(err.message || 'Failed to contribute funding');
      }
      
      setTransactionState(FundingTransactionState.ERROR);
      return false;
    }
  }, [provider, proposalId, getSigner, fetchFundingData]);

  const withdrawFunding = useCallback(async (): Promise<boolean> => {
    if (!provider || !proposalId) {
      setError('No wallet connected or invalid proposal');
      return false;
    }

    try {
      setTransactionState(FundingTransactionState.CONFIRMING);
      setError(null);

      const signer = await getSigner();
      if (!signer) {
        throw new Error('Failed to get signer');
      }

      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, signer);
      const tx = await proposalEscrow.withdrawFunding(proposalId, signer);
      
      setTxHash(tx.hash);
      setTransactionState(FundingTransactionState.PENDING);

      await tx.wait();
      
      setTransactionState(FundingTransactionState.SUCCESS);
      await fetchFundingData(); // Refresh data
      return true;
    } catch (err: any) {
      console.error('Withdraw funding error:', err);
      setError(err.message || 'Failed to withdraw funding');
      setTransactionState(FundingTransactionState.ERROR);
      return false;
    }
  }, [provider, proposalId, getSigner, fetchFundingData]);

  const finalizeFunding = useCallback(async (): Promise<boolean> => {
    if (!provider || !proposalId) {
      setError('No wallet connected or invalid proposal');
      return false;
    }

    try {
      setTransactionState(FundingTransactionState.CONFIRMING);
      setError(null);

      const signer = await getSigner();
      if (!signer) {
        throw new Error('Failed to get signer');
      }

      const proposalEscrow = new ProposalEscrow(ProposalEscrowDeployment.address, signer);
      const tx = await proposalEscrow.finalizeFunding(proposalId, signer);
      
      setTxHash(tx.hash);
      setTransactionState(FundingTransactionState.PENDING);

      await tx.wait();
      
      setTransactionState(FundingTransactionState.SUCCESS);
      await fetchFundingData(); // Refresh data
      return true;
    } catch (err: any) {
      console.error('Finalize funding error:', err);
      setError(err.message || 'Failed to finalize funding');
      setTransactionState(FundingTransactionState.ERROR);
      return false;
    }
  }, [provider, proposalId, getSigner, fetchFundingData]);

  return {
    fundingInfo,
    userContribution,
    isInitialized,
    loading,
    error,
    transactionState,
    txHash,
    initializeFunding,
    contributeFunding,
    withdrawFunding,
    finalizeFunding,
    refetch: fetchFundingData,
    reset
  };
}