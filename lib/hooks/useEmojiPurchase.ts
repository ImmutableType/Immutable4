// lib/hooks/useEmojiPurchase.ts
import { useState, useCallback } from 'react';
import { emojiTokenService, PurchaseResult, PurchaseEstimate } from '@/lib/blockchain/contracts/EmojiTokenService';

export interface EmojiPurchaseState {
  isLoading: boolean;
  isPurchasing: boolean;
  estimate: PurchaseEstimate | null;
  result: PurchaseResult | null;
  error: string | null;
}

export const useEmojiPurchase = () => {
  const [state, setState] = useState<EmojiPurchaseState>({
    isLoading: false,
    isPurchasing: false,
    estimate: null,
    result: null,
    error: null
  });

  const estimatePurchase = useCallback(async (emojiAmount: number) => {
    if (emojiAmount <= 0) {
      setState(prev => ({ ...prev, estimate: null, error: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const estimate = await emojiTokenService.estimatePurchase(emojiAmount);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        estimate,
        error: estimate.withinLimits ? null : `Exceeds maximum purchase limit of ${estimate.maxPurchaseAmount} EMOJI`
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to estimate purchase' 
      }));
    }
  }, []);

  const purchaseTokens = useCallback(async (emojiAmount: number) => {
    setState(prev => ({ ...prev, isPurchasing: true, error: null, result: null }));
    
    try {
      const result = await emojiTokenService.purchaseTokens(emojiAmount);
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        result,
        error: result.success ? null : result.error || 'Purchase failed'
      }));
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Purchase failed';
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const purchaseWithFlow = useCallback(async (flowAmount: string) => {
    const emojiAmount = emojiTokenService.calculateEmojiAmount(flowAmount);
    return purchaseTokens(emojiAmount);
  }, [purchaseTokens]);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    estimatePurchase,
    purchaseTokens,
    purchaseWithFlow,
    clearResult,
    clearError,
    presetAmounts: emojiTokenService.getPresetAmounts()
  };
};