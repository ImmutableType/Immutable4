// lib/publishing/hooks/usePublishedArticles.ts
import { useState, useEffect } from 'react';
import { PublishedArticle } from '../types/publishedArticle';
import { mockPublishingService } from '../services/mockPublishingService';

export function usePublishedArticles(authorId?: string, limit = 10) {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        const response = authorId 
          ? await mockPublishingService.getPublishedArticlesByAuthor(authorId, limit)
          : await mockPublishingService.getPublishedArticles(limit);
        
        if (isMounted) {
          setArticles(response.articles);
          setTotal(response.total);
          setNextCursor(response.nextCursor);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch published articles'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [authorId, limit]);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;
    
    try {
      setIsLoading(true);
      
      const response = authorId 
        ? await mockPublishingService.getPublishedArticlesByAuthor(authorId, limit, nextCursor)
        : await mockPublishingService.getPublishedArticles(limit, nextCursor);
      
      setArticles(prev => [...prev, ...response.articles]);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more articles'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    articles,
    total,
    isLoading,
    error,
    hasMore: !!nextCursor,
    loadMore
  };
}