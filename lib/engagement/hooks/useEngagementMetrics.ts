// lib/engagement/hooks/useEngagementMetrics.ts

import { useState, useEffect } from 'react';
import { ReactionType } from '../types/reactionTypes';
import { revenueDistributionService } from '../services/revenueDistributionService';

interface UseEngagementMetricsParams {
  contentId: string;
  contentType: 'article' | 'proposal' | 'community';
  reactions?: Record<ReactionType, number>;
}

interface UseEngagementMetricsResult {
  distribution: Record<string, number>;
  totalReactions: number;
  isLoading: boolean;
  error?: string;
}

export const useEngagementMetrics = ({
  contentId,
  contentType,
  reactions = {
    "👍": 0,
    "👏": 0,
    "🔥": 0,
    "🤔": 0,
    "🎉": 0,
    "❤️": 0
  }
}: UseEngagementMetricsParams): UseEngagementMetricsResult => {
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [totalReactions, setTotalReactions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadDistribution = async () => {
      setIsLoading(true);
      try {
        // Calculate total reactions
        const total = Object.values(reactions).reduce((sum, count) => sum + count, 0);
        setTotalReactions(total);
        
        // Get distribution from service
        const dist = await revenueDistributionService.getDistribution(contentId, contentType, total);
        setDistribution(dist);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load distribution data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDistribution();
  }, [contentId, contentType, reactions]);

  return {
    distribution,
    totalReactions,
    isLoading,
    error
  };
};

export default useEngagementMetrics;