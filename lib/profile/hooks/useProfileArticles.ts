// lib/profile/hooks/useProfileArticles.ts
// React hook to manage profile articles state (Community + Portfolio)

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  ProfileArticle, 
  ProfileArticlesResponse,
  ProfileArticleStats,
  ProfileArticleQuery,
  ProfileArticleFilter,
  ProfileArticleSortBy,
  ProfileArticleCardData,
  transformToCardData
} from '../types/profileArticle';
import { ProfileArticleService } from '../services/profileArticleService';
import { useWallet } from '../../hooks/useWallet';

interface UseProfileArticlesOptions {
  authorAddress?: string;
  authorName?: string;
  authorId?: string;
  initialFilter?: ProfileArticleFilter;
  initialSort?: ProfileArticleSortBy;
  limit?: number;
  autoFetch?: boolean;
}

interface UseProfileArticlesReturn {
  // Data
  articles: ProfileArticle[];
  cardData: ProfileArticleCardData[];
  stats: ProfileArticleStats;
  
  // State
  isLoading: boolean;
  error: Error | null;
  
  // Filtering & Sorting
  currentFilter: ProfileArticleFilter;
  currentSort: ProfileArticleSortBy;
  setFilter: (filter: ProfileArticleFilter) => void;
  setSort: (sort: ProfileArticleSortBy) => void;
  
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Type-specific getters
  communityArticles: ProfileArticle[];
  portfolioArticles: ProfileArticle[];
  
  // Utilities
  hasMore: boolean;
  isEmpty: boolean;
}

export function useProfileArticles(options: UseProfileArticlesOptions = {}): UseProfileArticlesReturn {
  const {
    authorAddress,
    authorName = 'Unknown Author',
    authorId = '',
    initialFilter = 'all',
    initialSort = 'newest',
    limit = 10,
    autoFetch = true
  } = options;

  const { provider } = useWallet();
  
  // State
  const [articles, setArticles] = useState<ProfileArticle[]>([]);
  const [stats, setStats] = useState<ProfileArticleStats>({
    totalCommunityArticles: 0,
    totalPortfolioArticles: 0,
    totalArticles: 0,
    postsToday: 0,
    remainingToday: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFilter, setCurrentFilter] = useState<ProfileArticleFilter>(initialFilter);
  const [currentSort, setCurrentSort] = useState<ProfileArticleSortBy>(initialSort);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);

  // Create service instance
  const createService = useCallback(() => {
    if (!provider) {
      throw new Error('Wallet provider not available');
    }
    return new ProfileArticleService(provider);
  }, [provider]);

  // Fetch articles
  const fetchArticles = useCallback(async (
    reset: boolean = false,
    customFilter?: ProfileArticleFilter,
    customSort?: ProfileArticleSortBy
  ) => {
    if (!authorAddress || !provider) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = createService();
      const query: ProfileArticleQuery = {
        filter: customFilter || currentFilter,
        sortBy: customSort || currentSort,
        limit: reset ? limit : limit + offset,
        offset: reset ? 0 : offset
      };

      const response = await service.getProfileArticles(authorAddress, query);
      
      if (reset) {
        setArticles([...response.communityArticles, ...response.portfolioArticles]);
        setOffset(0);
      } else {
        const newArticles = [...response.communityArticles, ...response.portfolioArticles];
        setArticles(prev => [...prev, ...newArticles]);
        setOffset(prev => prev + limit);
      }

      setStats(response.stats);
      
      // Check if there are more articles to load
      const totalFetched = reset ? 
        response.communityArticles.length + response.portfolioArticles.length :
        articles.length + response.communityArticles.length + response.portfolioArticles.length;
      
      setHasMore(totalFetched < response.stats.totalArticles);

    } catch (err) {
      console.error('Error fetching profile articles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setIsLoading(false);
    }
  }, [authorAddress, provider, currentFilter, currentSort, limit, offset, articles.length, createService]);

  // Filter change handler
  const setFilter = useCallback((filter: ProfileArticleFilter) => {
    setCurrentFilter(filter);
    fetchArticles(true, filter, currentSort);
  }, [fetchArticles, currentSort]);

  // Sort change handler
  const setSort = useCallback((sort: ProfileArticleSortBy) => {
    setCurrentSort(sort);
    fetchArticles(true, currentFilter, sort);
  }, [fetchArticles, currentFilter]);

  // Refresh handler
  const refresh = useCallback(async () => {
    await fetchArticles(true);
  }, [fetchArticles]);

  // Load more handler
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchArticles(false);
  }, [hasMore, isLoading, fetchArticles]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && authorAddress && provider) {
      fetchArticles(true);
    }
  }, [autoFetch, authorAddress, provider, fetchArticles]);

  // Transform articles to card data
  const cardData: ProfileArticleCardData[] = articles.map(article => 
    transformToCardData(article, authorName, authorId)
  );

  // Filter articles by type
  const communityArticles = articles.filter(article => article.type === 'community');
  const portfolioArticles = articles.filter(article => article.type === 'portfolio');

  // Computed properties
  const isEmpty = articles.length === 0 && !isLoading;

  return {
    // Data
    articles,
    cardData,
    stats,
    
    // State
    isLoading,
    error,
    
    // Filtering & Sorting
    currentFilter,
    currentSort,
    setFilter,
    setSort,
    
    // Actions
    refresh,
    loadMore,
    
    // Type-specific getters
    communityArticles,
    portfolioArticles,
    
    // Utilities
    hasMore,
    isEmpty
  };
}

// Hook for fetching single article
export function useProfileArticle(
  articleId: string, 
  type: 'community' | 'portfolio',
  authorName: string = 'Unknown Author',
  authorId: string = ''
) {
  const { provider } = useWallet();
  const [article, setArticle] = useState<ProfileArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!provider || !articleId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new ProfileArticleService(provider);
      const fetchedArticle = await service.getArticleById(articleId, type);
      setArticle(fetchedArticle);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch article'));
    } finally {
      setIsLoading(false);
    }
  }, [provider, articleId, type]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const cardData = article ? transformToCardData(article, authorName, authorId) : null;

  return {
    article,
    cardData,
    isLoading,
    error,
    refresh: fetchArticle
  };
}

// Hook for posting statistics only
export function usePostingStats(authorAddress?: string) {
  const { provider } = useWallet();
  const [stats, setStats] = useState<ProfileArticleStats>({
    totalCommunityArticles: 0,
    totalPortfolioArticles: 0,
    totalArticles: 0,
    postsToday: 0,
    remainingToday: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!authorAddress || !provider) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new ProfileArticleService(provider);
      const fetchedStats = await service.getPostingStats(authorAddress);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching posting stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch posting stats'));
    } finally {
      setIsLoading(false);
    }
  }, [authorAddress, provider]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
}