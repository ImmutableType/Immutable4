// lib/profile/hooks/useProfiles.ts
import { useState, useEffect, useCallback } from 'react';
import { Profile, ProfilesResponse } from '../types/profile';
import { ethers } from 'ethers';
import { ProfileData, ProfileNFTService } from '@/lib/blockchain/contracts/ProfileNFT';

// Cache configuration
const PROFILES_CACHE_KEY = 'immutabletype_profiles_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedProfileData {
  profiles: Profile[];
  total: number;
  timestamp: number;
}

// Transform blockchain profile data to UI Profile type
function transformProfileData(profileData: ProfileData): Profile {
  return {
    id: profileData.id,
    walletAddress: profileData.owner,
    membershipTokenId: profileData.membershipTokenId,
    displayName: profileData.displayName,
    bio: profileData.bio,
    avatarUrl: profileData.avatarUrl || undefined,
    createdAt: profileData.createdAt,
    isVerified: true, // All blockchain profiles are verified
    location: profileData.location,
    // Default privacy settings (can be stored on-chain later)
    privacySettings: {
      showActivity: true,
      showFunding: true,
      showVoting: true,
    },
    // Default metrics (these would come from indexing blockchain events)
    metrics: {
      articlesRead: 0,
      proposalsCreated: 0,
      proposalsFunded: 0,
      articlesPublished: 0,
      totalTipsReceived: 0,
      totalTipsSent: 0,
    },
    // Parse location for geographic data
    locations: profileData.location ? {
      primary: {
        city: profileData.location.split(',')[0]?.trim() || '',
        state: profileData.location.split(',')[1]?.trim() || '',
      }
    } : undefined,
  };
}

// Get cached data if valid
function getCachedProfiles(): CachedProfileData | null {
  try {
    const cached = localStorage.getItem(PROFILES_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as CachedProfileData;
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(PROFILES_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

// Save data to cache
function setCachedProfiles(profiles: Profile[], total: number) {
  try {
    const data: CachedProfileData = {
      profiles,
      total,
      timestamp: Date.now(),
    };
    localStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export function useProfiles(limit = 10) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchProfiles = useCallback(async (isLoadMore = false, forceRefresh = false) => {
    try {
      // Check cache first (only for initial load, not for load more)
      if (!isLoadMore && !forceRefresh) {
        const cached = getCachedProfiles();
        if (cached) {
          console.log('Using cached profiles data');
          setProfiles(cached.profiles.slice(0, limit));
          setTotal(cached.total);
          setOffset(Math.min(limit, cached.profiles.length));
          setHasMore(cached.profiles.length > limit);
          setIsLoading(false);
          return;
        }
      }
      
      setIsLoading(true);
      setError(null);
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      console.log('Fetching profiles from blockchain...');
      // Create a provider for reading from blockchain
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const profileService = new ProfileNFTService(provider);
      
      // Calculate the current offset
      const currentOffset = isLoadMore ? offset : 0;
      
      // Fetch profiles from blockchain
      const result = await profileService.getProfilesPaginated(limit, currentOffset);
      
      // Transform blockchain data to UI format
      const transformedProfiles = result.profiles.map(transformProfileData);
      
      if (isLoadMore) {
        // Append to existing profiles
        setProfiles(prev => [...prev, ...transformedProfiles]);
        setOffset(prev => prev + transformedProfiles.length);
      } else {
        // Replace profiles (initial load or refresh)
        setProfiles(transformedProfiles);
        setOffset(transformedProfiles.length);
        
        // Cache the data
        if (!forceRefresh || transformedProfiles.length > 0) {
          setCachedProfiles(transformedProfiles, result.total);
        }
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
      
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profiles'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [limit, offset]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const loadInitialProfiles = async () => {
      if (isMounted) {
        await fetchProfiles(false, false);
      }
    };

    loadInitialProfiles();

    return () => {
      isMounted = false;
    };
  }, [limit]); // Only re-run if limit changes

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchProfiles(true, false);
  }, [hasMore, isLoading, fetchProfiles]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (isLoading) return;
    await fetchProfiles(false, true);
  }, [isLoading, fetchProfiles]);

  // Clear cache function
  const clearCache = useCallback(() => {
    localStorage.removeItem(PROFILES_CACHE_KEY);
    console.log('Profile cache cleared');
  }, []);

  return {
    profiles,
    total,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
    clearCache
  };
}