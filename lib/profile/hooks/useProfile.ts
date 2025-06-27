// lib/profile/hooks/useProfile.ts
'use client';

import { useState, useEffect } from 'react';
import { Profile } from '../types/profile';
import { useProfileNFT } from './useProfileNFT';
import { useWallet } from '@/lib/hooks/useWallet';
import { ethers } from 'ethers';
import { ProfileData } from '@/lib/blockchain/contracts/ProfileNFT';

export function useProfile(identifier: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { address: currentUserAddress } = useWallet();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Always use a default provider for reading
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const { ProfileNFTService } = await import('@/lib/blockchain/contracts/ProfileNFT');
        const service = new ProfileNFTService(provider);
        
        let profileData: ProfileData | null = null;
        
        // Check if identifier is a number (profile ID) or contains a dash (ID-slug format)
        if (/^\d+$/.test(identifier) || identifier.includes('-')) {
          // Extract profile ID from formats like "1" or "1-john-doe"
          const profileId = identifier.split('-')[0];
          profileData = await service.getProfile(profileId);
        } else if (identifier.startsWith('0x')) {
          // It's a wallet address
          profileData = await service.getProfileByAddress(identifier);
        } else {
          throw new Error('Invalid profile identifier format');
        }
        
        if (!profileData) {
          throw new Error('Profile not found');
        }
        
        if (isMounted) {
          // Transform blockchain data to match UI expectations
          const transformedProfile: Profile = {
            id: profileData.id,
            walletAddress: profileData.owner,
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
          
          setProfile(transformedProfile);
          setIsOwner(currentUserAddress?.toLowerCase() === profileData.owner.toLowerCase());
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (identifier) {
      fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [identifier, currentUserAddress]);

  return {
    profile,
    isOwner,
    isLoading,
    error
  };
}