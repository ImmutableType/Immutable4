// lib/hooks/useArticleAccess.ts
import { useState, useEffect } from 'react';
import { articleCollectionService } from '../services/articleCollectionService';
import { useWallet } from './useWallet';

export interface ArticleAccessStatus {
  hasActiveAccess: boolean;
  accessExpiryTime?: number;
  canBurnLicense: boolean;
  licenseCount: number;
  timeRemaining?: number;
  isExpired?: boolean;
}

export interface UseArticleAccessReturn {
  accessStatus: ArticleAccessStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useArticleAccess(articleId: string): UseArticleAccessReturn {
  const { address } = useWallet();
  const [accessStatus, setAccessStatus] = useState<ArticleAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccessStatus = async () => {
    if (!address || !articleId) {
      setAccessStatus(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('useArticleAccess: Checking access for article:', articleId, 'user:', address);
      const status = await articleCollectionService.checkArticleAccess(articleId, address);
      
      // Calculate time remaining if user has active access
      let timeRemaining: number | undefined;
      let isExpired: boolean | undefined;
      
      if (status.hasActiveAccess && status.accessExpiryTime) {
        const now = Math.floor(Date.now() / 1000);
        timeRemaining = status.accessExpiryTime - now;
        isExpired = timeRemaining <= 0;
      }

      const accessStatus: ArticleAccessStatus = {
        ...status,
        timeRemaining,
        isExpired
      };
      
      console.log('useArticleAccess: Access status:', accessStatus);
      setAccessStatus(accessStatus);
      
    } catch (err) {
      console.error('useArticleAccess: Error checking access:', err);
      setError(err instanceof Error ? err : new Error('Failed to check article access'));
      setAccessStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchAccessStatus();
  };

  useEffect(() => {
    fetchAccessStatus();
  }, [address, articleId]);

  return {
    accessStatus,
    isLoading,
    error,
    refresh
  };
}