// lib/profile/hooks/useProfileActivity.ts
import { useState, useEffect } from 'react';
import { ActivityItem } from '../types/activity';
import { mockProfileService } from '../services/mockProfileService';

export function useProfileActivity(profileId: string, limit = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        const response = await mockProfileService.getProfileActivities(profileId, limit);
        
        if (isMounted) {
          setActivities(response.activities);
          setTotal(response.total);
          setNextCursor(response.nextCursor);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch profile activities'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [profileId, limit]);

  const loadMore = async () => {
    if (!nextCursor || isLoading || !profileId) return;
    
    try {
      setIsLoading(true);
      const response = await mockProfileService.getProfileActivities(profileId, limit, nextCursor);
      
      setActivities(prev => [...prev, ...response.activities]);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more activities'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activities,
    total,
    isLoading,
    error,
    hasMore: !!nextCursor,
    loadMore
  };
}