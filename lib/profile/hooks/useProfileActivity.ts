// lib/profile/hooks/useProfileActivity.ts
import { useState, useEffect } from 'react';
import { ActivityItem, ActivityService } from '../services/activityService';

export function useProfileActivity(userAddressOrProfileId: string, limit = 20) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);

  const activityService = new ActivityService();

  const loadActivities = async (reset: boolean = false) => {
    if (!userAddressOrProfileId || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const newActivities = await activityService.getUserActivities(userAddressOrProfileId, limit, currentOffset);
      
      if (reset) {
        setActivities(newActivities);
        setOffset(limit);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
        setOffset(prev => prev + limit);
      }

      setHasMore(newActivities.length === limit);
      setTotal(reset ? newActivities.length : activities.length + newActivities.length);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err : new Error('Failed to load activities'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadActivities(false);
    }
  };

  useEffect(() => {
    if (userAddressOrProfileId) {
      loadActivities(true);
    } else {
      setActivities([]);
      setTotal(0);
      setOffset(0);
      setHasMore(false);
    }
  }, [userAddressOrProfileId]);

  return {
    activities,
    total,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh: () => loadActivities(true)
  };
}