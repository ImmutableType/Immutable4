// lib/hooks/usePlatformTip.tsx
'use client';

import { useState, useCallback } from 'react';
import { useTipping } from './useTipping';

export interface PlatformTipState {
  isLoading: boolean;
  isTipping: boolean;
  result: any;
  error: string | null;
}

export const usePlatformTip = () => {
  const [state, setState] = useState<PlatformTipState>({
    isLoading: false,
    isTipping: false,
    result: null,
    error: null
  });

  const { estimateTip } = useTipping();

  const sendPlatformTip = useCallback(async (
    amount: number, 
    currency: 'FLOW' | 'EMOJI'
  ) => {
    setState(prev => ({ ...prev, isTipping: true, error: null }));
    
    try {
      const result = { success: false, error: 'Platform tipping not implemented in MVP' };

      
      setState(prev => ({ 
        ...prev, 
        isTipping: false, 
        result,
        error: result.success ? null : (result.error || null)
      }));
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Platform tip failed';
      setState(prev => ({ 
        ...prev, 
        isTipping: false, 
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const estimatePlatformTip = useCallback(async (
    amount: number, 
    currency: 'FLOW' | 'EMOJI'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const estimate = await estimateTip(amount, currency);
      setState(prev => ({ ...prev, isLoading: false }));
      return estimate;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to estimate platform tip'
      }));
      return null;
    }
  }, [estimateTip]);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null, error: null }));
  }, []);

  return {
    ...state,
    sendPlatformTip,
    estimatePlatformTip,
    clearResult
  };
};
