// lib/encryption/hooks/useArticleEncryption.ts
'use client';
import { useState, useCallback } from 'react';
import { articleEncryptionService, EncryptionResult, ArticleEncryptionParams } from '../services/articleEncryption';
import { useWallet } from '../../hooks/useWallet';

export interface UseArticleEncryptionResult {
  encryptContent: (
    plainContent: string,
    articleId?: string,
    licenseTokenId?: string
  ) => Promise<EncryptionResult>;
  isEncrypting: boolean;
  lastEncryptionResult: EncryptionResult | null;
  estimateEncryptedSize: (content: string) => number;
  predictNextArticleId: () => Promise<string>;
  clearLastResult: () => void;
}

export const useArticleEncryption = (): UseArticleEncryptionResult => {
  const { address } = useWallet();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [lastEncryptionResult, setLastEncryptionResult] = useState<EncryptionResult | null>(null);

  const encryptContent = useCallback(async (
    plainContent: string,
    articleId?: string,
    licenseTokenId?: string
  ): Promise<EncryptionResult> => {
    
    if (!address) {
      const errorResult: EncryptionResult = {
        success: false,
        error: 'Wallet not connected'
      };
      setLastEncryptionResult(errorResult);
      return errorResult;
    }

    setIsEncrypting(true);
    
    try {
      console.log('🔄 useArticleEncryption: Starting encryption...', {
        userAddress: address,
        articleId: articleId || 'auto-predict',
        contentLength: plainContent.length,
        contentPreview: plainContent.substring(0, 50) + '...'
      });

      // Predict article ID if not provided
      const finalArticleId = articleId || await articleEncryptionService.predictNextArticleId();
      
      const params: ArticleEncryptionParams = {
        userAddress: address,
        articleId: finalArticleId,
        licenseTokenId: licenseTokenId || "0" // Default for publishing
      };

      const result = await articleEncryptionService.encryptArticle(plainContent, params);

      console.log('🔄 useArticleEncryption: Encryption result:', {
        success: result.success,
        hasContent: !!result.encryptedContent,
        encryptedSize: result.encryptedContent?.length || 0,
        error: result.error
      });

      setLastEncryptionResult(result);
      return result;

    } catch (error) {
      console.error('❌ useArticleEncryption: Error:', error);
      
      const errorResult: EncryptionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown encryption error'
      };
      
      setLastEncryptionResult(errorResult);
      return errorResult;

    } finally {
      setIsEncrypting(false);
    }
  }, [address]);

  const estimateEncryptedSize = useCallback((content: string): number => {
    return articleEncryptionService.estimateEncryptedSize(content);
  }, []);

  const predictNextArticleId = useCallback(async (): Promise<string> => {
    return await articleEncryptionService.predictNextArticleId();
  }, []);

  const clearLastResult = useCallback(() => {
    setLastEncryptionResult(null);
  }, []);

  return {
    encryptContent,
    isEncrypting,
    lastEncryptionResult,
    estimateEncryptedSize,
    predictNextArticleId,
    clearLastResult
  };
};

export default useArticleEncryption;