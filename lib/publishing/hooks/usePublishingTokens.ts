// lib/publishing/hooks/usePublishingTokens.ts
import { useState, useEffect } from 'react';
import { TokenType, PublishingToken, TokenVerificationResponse } from '../types/publishingToken';
import { mockTokenVerificationService } from '../services/tokenVerificationService';

export function usePublishingTokens(userId: string) {
  const [tokens, setTokens] = useState<PublishingToken[]>([]);
  const [highestTokenType, setHighestTokenType] = useState<TokenType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const userTokens = await mockTokenVerificationService.getUserTokens(userId);
        const highest = await mockTokenVerificationService.getUserHighestTokenType(userId);
        
        if (isMounted) {
          setTokens(userTokens);
          setHighestTokenType(highest);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch publishing tokens'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (userId) {
      fetchTokens();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const checkTokenAccess = async (requiredTokenType: TokenType): Promise<TokenVerificationResponse> => {
    if (!userId) {
      return { hasToken: false, tokens: [] };
    }
    
    try {
      return await mockTokenVerificationService.verifyToken(userId, requiredTokenType);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to verify token access'));
      return { hasToken: false, tokens: [] };
    }
  };

  return {
    tokens,
    highestTokenType,
    isLoading,
    error,
    checkTokenAccess
  };
}