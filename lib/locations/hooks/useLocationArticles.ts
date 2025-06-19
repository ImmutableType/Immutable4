// lib/locations/hooks/useLocationArticles.ts
import { useState, useEffect, useRef } from 'react';
import { useArticles } from '../../reader/hooks/useArticles';

interface LocationArticleFilters {
  recency?: 'all' | 'latest' | 'week' | 'month';
  engagement?: 'all' | 'most-tipped' | 'trending';
  category?: 'all' | 'politics' | 'climate' | 'tech' | 'arts' | 'realestate';
  contentType?: 'all' | 'articles' | 'proposals' | 'community';
}

export function useLocationArticles(
  city: string, 
  state: string, 
  filters: LocationArticleFilters = {}
) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // Use the existing articles hook
  const { articles: allArticles, isLoading, error: articlesError } = useArticles();
  
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    
    if (articlesError) {
      setError(articlesError);
      setLoading(false);
      return;
    }
    
    try {
      // Filter articles for this location
      let filteredArticles = allArticles.filter(article => 
        article.location?.includes(`${city}, ${state}`)
      );
      
      // Apply recency filter
      if (filters.recency && filters.recency !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (filters.recency) {
          case 'latest':
            // Last 24 hours
            cutoffDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          default:
            break;
        }
        
        filteredArticles = filteredArticles.filter(article => {
          const publishDate = new Date(article.createdAt);
          return publishDate >= cutoffDate;
        });
      }
      
      // Apply engagement filter
      if (filters.engagement && filters.engagement !== 'all') {
        switch (filters.engagement) {
          case 'most-tipped':
            // Sort by tip amount (highest first)
            filteredArticles.sort((a, b) => 
              (b.readerMetrics?.tipAmount || 0) - (a.readerMetrics?.tipAmount || 0)
            );
            break;
          case 'trending':
            // Simple trending algorithm: recent articles with high engagement
            const now = new Date();
            filteredArticles.sort((a, b) => {
              const aDate = new Date(a.createdAt);
              const bDate = new Date(b.createdAt);
              const aAge = now.getTime() - aDate.getTime();
              const bAge = now.getTime() - bDate.getTime();
              
              // Combine view count and tip amount for total engagement score
              const aEngagement = (a.readerMetrics?.viewCount || 0) + (a.readerMetrics?.tipAmount * 100 || 0);
              const bEngagement = (b.readerMetrics?.viewCount || 0) + (b.readerMetrics?.tipAmount * 100 || 0);
              
              const aScore = aEngagement / (Math.sqrt(aAge / 3600000) || 1); // Normalize by sqrt(hours)
              const bScore = bEngagement / (Math.sqrt(bAge / 3600000) || 1);
              
              return bScore - aScore;
            });
            break;
          default:
            break;
        }
      }
      
      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        // Map our filter categories to the actual category values in the data
        const categoryMap: Record<string, string> = {
          'politics': 'Politics',
          'climate': 'Environment',
          'tech': 'Technology',
          'arts': 'Arts & Culture',
          'realestate': 'Real Estate'
        };
        
        filteredArticles = filteredArticles.filter(article => 
          article.category === categoryMap[filters.category as string]
        );
      }
      
      // Only update state if we're not in loading state and we have articles to show
      if (!isFirstRender.current || allArticles.length > 0) {
        setArticles(filteredArticles);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      setError('Error filtering articles: ' + (err as Error).message);
      setLoading(false);
    }
    
    // Mark that the first render is complete
    isFirstRender.current = false;
  }, [allArticles, isLoading, articlesError, filters, city, state]);
  
  return { articles, loading, error };
}