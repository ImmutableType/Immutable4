// lib/encryption/hooks/useContentDecryption.ts
'use client';
import { useState, useCallback, useEffect } from 'react';
import { DecryptionResult, LicenseAccess } from '../types/encryption';
import { articleDecryptionService } from '../services/articleDecryption';
import { useWallet } from '../../hooks/useWallet';

export interface UseContentDecryptionResult {
  decryptContent: (
    encryptedContent: string,
    articleId: string,
    licenseTokenId: string
  ) => Promise<DecryptionResult>;
  isDecrypting: boolean;
  lastDecryptionResult: DecryptionResult | null;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
}

export const useContentDecryption = (): UseContentDecryptionResult => {
  const { address } = useWallet();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [lastDecryptionResult, setLastDecryptionResult] = useState<DecryptionResult | null>(null);

  const decryptContent = useCallback(async (
    encryptedContent: string,
    articleId: string,
    licenseTokenId: string
  ): Promise<DecryptionResult> => {
    
    if (!address) {
      const errorResult: DecryptionResult = {
        success: false,
        error: 'Wallet not connected'
      };
      setLastDecryptionResult(errorResult);
      return errorResult;
    }

    setIsDecrypting(true);
    
    try {
      console.log('🔄 useContentDecryption: Starting decryption...', {
        articleId,
        userAddress: address,
        licenseTokenId,
        contentLength: encryptedContent.length
      });

      const result = await articleDecryptionService.decryptArticle(
        encryptedContent,
        address,
        articleId,
        licenseTokenId
      );

      console.log('🔄 useContentDecryption: Decryption result:', {
        success: result.success,
        cached: result.cached,
        hasContent: !!result.content,
        error: result.error
      });

      setLastDecryptionResult(result);
      return result;

    } catch (error) {
      console.error('❌ useContentDecryption: Error:', error);
      
      const errorResult: DecryptionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown decryption error'
      };
      
      setLastDecryptionResult(errorResult);
      return errorResult;

    } finally {
      setIsDecrypting(false);
    }
  }, [address]);

  const clearCache = useCallback(() => {
    articleDecryptionService.clearCache();
    console.log('🧹 Cache cleared');
  }, []);

  const getCacheStats = useCallback(() => {
    return articleDecryptionService.getCacheStats();
  }, []);

  // Clear cache when wallet disconnects
  useEffect(() => {
    if (!address) {
      clearCache();
    }
  }, [address, clearCache]);

  return {
    decryptContent,
    isDecrypting,
    lastDecryptionResult,
    clearCache,
    cacheStats: getCacheStats()
  };
};

export default useContentDecryption;