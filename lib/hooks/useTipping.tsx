// lib/hooks/useTipping.tsx
'use client';

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { TippingContractService, TipTransaction, TipStats, ProfileTipStats } from '@/lib/blockchain/contracts/TippingContract';

export interface TipEstimate {
  tipAmount: number;
  fee: number;
  netAmount: number;
  emojiRewards: number;
  withinLimits: boolean;
  currency: 'FLOW' | 'EMOJI';
}

export interface TipResult {
  success: boolean;
  transaction?: TipTransaction;
  error?: string;
}

export const useTipping = () => {
  const { provider, address, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<TipEstimate | null>(null);

  // Clear states
  const clearResult = useCallback(() => setResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  // Initialize service
  const getService = useCallback(async () => {
    if (!provider) throw new Error('Wallet not connected');
    const signer = await provider.getSigner();
    return new TippingContractService(provider, signer);
  }, [provider]);

  // Estimate tip costs
  const estimateTip = useCallback(async (
    amount: number,
    currency: 'FLOW' | 'EMOJI' = 'FLOW'
  ): Promise<TipEstimate> => {
    try {
      const service = await getService();
      const minimumTip = parseFloat(await service.getMinimumTipAmount());
      
      let tipEstimate: TipEstimate;
      
      if (currency === 'FLOW') {
        const fee = service.calculateFlowTipFee(amount);
        const netAmount = amount - fee;
        const emojiRewards = service.calculateEmojiRewards(amount);
        
        tipEstimate = {
          tipAmount: amount,
          fee,
          netAmount,
          emojiRewards,
          withinLimits: amount >= minimumTip,
          currency
        };
      } else {
        // EMOJI tips have no fees
        tipEstimate = {
          tipAmount: amount,
          fee: 0,
          netAmount: amount,
          emojiRewards: 0,
          withinLimits: amount > 0,
          currency
        };
      }
      
      setEstimate(tipEstimate);
      return tipEstimate;
    } catch (err: any) {
      console.error('Error estimating tip:', err);
      throw new Error(err.message || 'Failed to estimate tip');
    }
  }, [getService]);

  // Tip a profile
  const tipProfile = useCallback(async (
    profileId: string,
    amount: number,
    currency: 'FLOW' | 'EMOJI' = 'FLOW'
  ): Promise<TipResult> => {
    if (!isConnected || !address) {
      const error = 'Please connect your wallet first';
      setError(error);
      return { success: false, error };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const service = await getService();
      
      let transaction: TipTransaction;
      
      if (currency === 'FLOW') {
        transaction = await service.tipProfileWithFlow(profileId, amount, await provider!.getSigner());
      } else {
        transaction = await service.tipProfileWithEmoji(profileId, amount, await provider!.getSigner());
      }

      const result: TipResult = {
        success: true,
        transaction
      };

      setResult(result);
      return result;

    } catch (err: any) {
      console.error('Tipping error:', err);
      const error = err.message || 'Failed to send tip';
      setError(error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, getService]);

  // Tip an address directly
  const tipAddress = useCallback(async (
    recipientAddress: string,
    amount: number,
    currency: 'FLOW' | 'EMOJI' = 'FLOW'
  ): Promise<TipResult> => {
    if (!isConnected || !address) {
      const error = 'Please connect your wallet first';
      setError(error);
      return { success: false, error };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const service = await getService();
      
      let transaction: TipTransaction;
      
      if (currency === 'FLOW') {
        transaction = await service.tipAddressWithFlow(recipientAddress, amount, await provider.getSigner());
      } else {
        transaction = await service.tipAddressWithEmoji(recipientAddress, amount, await provider.getSigner());
      }

      const result: TipResult = {
        success: true,
        transaction
      };

      setResult(result);
      return result;

    } catch (err: any) {
      console.error('Tipping error:', err);
      const error = err.message || 'Failed to send tip';
      setError(error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, getService]);

  // Get tip statistics for an address
  const getTipStats = useCallback(async (userAddress: string): Promise<TipStats | null> => {
    try {
      if (!provider) return null;
      const service = new TippingContractService(provider);
      return await service.getAddressTipStats(userAddress);
    } catch (err) {
      console.error('Error fetching tip stats:', err);
      return null;
    }
  }, [provider]);

  // Get tip statistics for a profile
  const getProfileTipStats = useCallback(async (profileId: string): Promise<ProfileTipStats | null> => {
    try {
      if (!provider) return null;
      const service = new TippingContractService(provider);
      return await service.getProfileTipStats(profileId);
    } catch (err) {
      console.error('Error fetching profile tip stats:', err);
      return null;
    }
  }, [provider]);

  // Get minimum tip amount
  const getMinimumTipAmount = useCallback(async (): Promise<number> => {
    try {
      if (!provider) return 1; // Default fallback
      const service = new TippingContractService(provider);
      const minimum = await service.getMinimumTipAmount();
      return parseFloat(minimum);
    } catch (err) {
      console.error('Error fetching minimum tip:', err);
      return 1; // Default fallback
    }
  }, [provider]);

  return {
    // States
    isProcessing,
    result,
    error,
    estimate,
    
    // Actions
    estimateTip,
    tipProfile,
    tipAddress,
    getTipStats,
    getProfileTipStats,
    getMinimumTipAmount,
    
    // Clear functions
    clearResult,
    clearError,
    tipPlatform,
    
    // Connection state
    isConnected,
    address
  };
};