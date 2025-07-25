// lib/encryption/hooks/useContentDecryption.ts (FIXED PARAMETER ORDER)
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
        contentLength: encryptedContent.length,
        contentPreview: encryptedContent.substring(0, 50) + '...'
      });

      // ✅ FIXED: Pass parameters in correct order to articleDecryptionService
      // Service expects: (encryptedContent, userAddress, articleId, licenseTokenId)
      const result = await articleDecryptionService.decryptArticle(
        encryptedContent,    // 1. Encrypted content string
        address,            // 2. User wallet address  
        articleId,          // 3. Article ID
        licenseTokenId      // 4. License token ID
      );

      console.log('🔄 useContentDecryption: Decryption result:', {
        success: result.success,
        cached: result.cached,
        hasContent: !!result.content,
        contentLength: result.content?.length || 0,
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
    console.log('🧹 useContentDecryption: Cache cleared');
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

  // ✅ Enhanced logging for debugging
  useEffect(() => {
    if (address) {
      console.log('🔗 useContentDecryption: Wallet connected:', address);
    } else {
      console.log('🔌 useContentDecryption: Wallet disconnected');
    }
  }, [address]);

  return {
    decryptContent,
    isDecrypting,
    lastDecryptionResult,
    clearCache,
    cacheStats: getCacheStats()
  };
};

export default useContentDecryption;