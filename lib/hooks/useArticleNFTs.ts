// lib/hooks/useArticleNFTs.ts
import { useState, useEffect } from 'react';
import { ArticleNFT, articleCollectionService } from '../services/articleCollectionService';
import { useWallet } from './useWallet';

export interface UseArticleNFTsReturn {
  articleNFTs: ArticleNFT[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useArticleNFTs(): UseArticleNFTsReturn {
  const { address } = useWallet();
  const [articleNFTs, setArticleNFTs] = useState<ArticleNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticleNFTs = async () => {
    if (!address) {
      setArticleNFTs([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('useArticleNFTs: Fetching NFTs for address:', address);
      const nfts = await articleCollectionService.getUserArticleNFTs(address);
      
      console.log('useArticleNFTs: Retrieved NFTs:', nfts);
      setArticleNFTs(nfts);
      
    } catch (err) {
      console.error('useArticleNFTs: Error fetching NFTs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch article NFTs'));
      setArticleNFTs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchArticleNFTs();
  };

  useEffect(() => {
    fetchArticleNFTs();
  }, [address]);

  return {
    articleNFTs,
    isLoading,
    error,
    refresh
  };
}