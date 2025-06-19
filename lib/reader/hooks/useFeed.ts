// lib/reader/hooks/useFeed.ts
'use client'
import { useState, useEffect, useRef } from 'react';
import { Article } from '../types/article';
import { FeedFilters } from '../types/feed';
import blockchainReaderService from '../services/blockchainReaderService';
import proposalIntegrationService from '../services/proposalIntegrationService';

// ✅ Fixed: Default filters with proper contentType
export const useFeed = (initialFilters: FeedFilters = { contentType: 'all' }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [filters, setFilters] = useState<FeedFilters>({ contentType: 'all', ...initialFilters }); // ✅ Ensure contentType is always set
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false); // Prevent re-fetching

  // Fetch all content from blockchain
  useEffect(() => {
    // Prevent re-fetching if already loaded and contentType hasn't changed
    if (hasLoaded && filters.contentType === 'all') {
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch ALL article types including native/encrypted
        const allArticles = await blockchainReaderService.getAllArticles();
        
        // Ensure we include ALL article types
        const filteredArticles = allArticles.filter(article => {
          // Include community, portfolio, AND native articles
          return ['community', 'portfolio', 'native'].includes(article.articleType);
        });
        
        setArticles(filteredArticles);
        
        // ✅ Fixed: Extract unique categories and locations using Array.from()
        const categorySet = new Set(filteredArticles.map(a => a.category));
        const locationSet = new Set(filteredArticles.map(a => a.location));
        
        const uniqueCategories = Array.from(categorySet);
        const uniqueLocations = Array.from(locationSet);
        
        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
        
        // Fetch proposals if needed
        if (filters.contentType === 'all' || filters.contentType === 'proposals') {
          // ✅ Fixed: Use getActiveProposals instead of getAllProposals
          const allProposals = await proposalIntegrationService.getActiveProposals();
          setProposals(allProposals);
        }
        
        setHasLoaded(true); // Mark as loaded to prevent re-fetching
        
      } catch (err) {
        setError('Failed to fetch content from blockchain');
        console.error('Feed fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [filters.contentType, hasLoaded]);

  const updateFilters = (newFilters: FeedFilters) => {
    // ✅ Ensure contentType is always present
    setFilters(prev => ({ 
      contentType: 'all', 
      ...prev, 
      ...newFilters 
    }));
  };

  return {
    articles,
    proposals,
    filters,
    categories,
    locations,
    isLoading,
    error,
    updateFilters
  };
};

export default useFeed;

// Re-export the interface for compatibility
export type { FeedFilters };