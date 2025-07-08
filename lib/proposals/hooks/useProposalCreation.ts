// lib/proposals/hooks/useProposalCreation.ts
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import { ProposalManager, CreateProposalParams } from '@/lib/blockchain/contracts/ProposalManager';
import ProposalManagerDeployment from '@/deployments/ProposalManager.json';

export enum TransactionState {
  IDLE = 'idle',
  CONFIRMING = 'confirming',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface UseProposalCreationReturn {
  createProposal: (params: CreateProposalParams) => Promise<string | null>;
  transactionState: TransactionState;
  error: string | null;
  txHash: string | null;
  proposalId: string | null;
  reset: () => void;
}

export function useProposalCreation(): UseProposalCreationReturn {
  const { provider, getSigner } = useWallet();
  const [transactionState, setTransactionState] = useState<TransactionState>(TransactionState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTransactionState(TransactionState.IDLE);
    setError(null);
    setTxHash(null);
    setProposalId(null);
  }, []);

  const createProposal = useCallback(async (params: CreateProposalParams): Promise<string | null> => {
    if (!provider) {
      setError('No wallet connected');
      return null;
    }

    try {
      setTransactionState(TransactionState.CONFIRMING);
      setError(null);
      
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Failed to get signer');
      }

      // Create contract instance
      const proposalManager = new ProposalManager(
        ProposalManagerDeployment.address,
        signer
      );

      // Send transaction
      const tx = await proposalManager.createProposal(params, signer);
      setTxHash(tx.hash);
      setTransactionState(TransactionState.PENDING);

      // Wait for confirmation and get proposal ID
      const proposalId = await proposalManager.waitForProposalCreation(tx.hash);
      
      if (proposalId) {
        setProposalId(proposalId);
        setTransactionState(TransactionState.SUCCESS);
        return proposalId;
      } else {
        throw new Error('Failed to get proposal ID from transaction');
      }
    } catch (err: any) {
      console.error('Proposal creation error:', err);
      
      // Handle specific error cases
      if (err.code === 'ACTION_REJECTED' || err.message?.includes('rejected')) {
        setError('Transaction rejected by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient FLOW balance');
      } else if (err.message?.includes('Profile NFT required')) {
        setError('You need a profile NFT to create proposals');
      } else if (err.message?.includes('Membership or Publisher token required')) {
        setError('You need a membership or publisher token to create proposals');
      } else if (err.message?.includes('Invalid location')) {
        setError('Proposals must be for Miami, Florida, or United States');
      } else if (err.message?.includes('Daily limit exceeded')) {
        setError('You have reached the daily proposal limit (50)');
      } else if (err.message?.includes('Weekly limit exceeded')) {
        setError('You have reached the weekly proposal limit (100)');
      } else {
        setError(err.message || 'Failed to create proposal');
      }
      
      setTransactionState(TransactionState.ERROR);
      return null;
    }
  }, [provider, getSigner]);

  return {
    createProposal,
    transactionState,
    error,
    txHash,
    proposalId,
    reset
  };
}