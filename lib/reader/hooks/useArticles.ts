// File: lib/reader/hooks/useArticles.ts
import { useState, useEffect } from 'react';
import { Article } from '../types/article';
import blockchainReaderService from '../services/blockchainReaderService';

export const useArticles = (filters?: any) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await blockchainReaderService.getArticles(filters);
        setArticles(data);
      } catch (err) {
        setError('Failed to fetch articles from blockchain');
        console.error('Error fetching articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [filters]);

  return { articles, isLoading, error };
};