// lib/hooks/useReaderLicenses.ts
import { useState, useEffect } from 'react';
import { LicensePortfolioSummary, articleCollectionService } from '../services/articleCollectionService';
import { useWallet } from './useWallet';

export interface UseReaderLicensesReturn {
  portfolioSummary: LicensePortfolioSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useReaderLicenses(): UseReaderLicensesReturn {
  const { address } = useWallet();
  const [portfolioSummary, setPortfolioSummary] = useState<LicensePortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLicensePortfolio = async () => {
    if (!address) {
      setPortfolioSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('useReaderLicenses: Fetching portfolio for address:', address);
      const summary = await articleCollectionService.getLicensePortfolioSummary(address);
      
      console.log('useReaderLicenses: Retrieved portfolio summary:', summary);
      setPortfolioSummary(summary);
      
    } catch (err) {
      console.error('useReaderLicenses: Error fetching portfolio:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch license portfolio'));
      setPortfolioSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchLicensePortfolio();
  };

  useEffect(() => {
    fetchLicensePortfolio();
  }, [address]);

  return {
    portfolioSummary,
    isLoading,
    error,
    refresh
  };
}