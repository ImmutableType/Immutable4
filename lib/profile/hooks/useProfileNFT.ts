// lib/profile/hooks/useProfileNFT.ts
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ProfileNFTService, ProfileData } from '@/lib/blockchain/contracts/ProfileNFT';
import { useWallet } from '@/lib/hooks/useWallet';

export function useProfileNFT() {
  const { provider, address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create profile (mint NFT)
  const createProfile = useCallback(async (
    displayName: string,
    bio: string,
    avatarUrl: string,
    location: string
  ) => {
    if (!provider || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get signer from provider
      const signer = await provider.getSigner();
      const service = new ProfileNFTService(provider, signer);
      const result = await service.createProfile(
        displayName,
        bio,
        avatarUrl,
        location
      );
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  // Get profile by address
  const getProfileByAddress = useCallback(async (address: string): Promise<ProfileData | null> => {
    if (!provider) {
      setError('Provider not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new ProfileNFTService(provider);
      return await service.getProfileByAddress(address);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Get profile by ID
  const getProfile = useCallback(async (profileId: string): Promise<ProfileData | null> => {
    if (!provider) {
      setError('Provider not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new ProfileNFTService(provider);
      return await service.getProfile(profileId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Check if address has profile
  const hasProfile = useCallback(async (address: string): Promise<boolean> => {
    if (!provider) {
      return false;
    }

    try {
      const service = new ProfileNFTService(provider);
      return await service.hasProfile(address);
    } catch (err) {
      return false;
    }
  }, [provider]);

  // Update profile
  const updateProfile = useCallback(async (
    profileId: string,
    displayName: string,
    bio: string,
    avatarUrl: string,
    location: string
  ) => {
    if (!provider || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const service = new ProfileNFTService(provider, signer);
      const result = await service.updateProfile(
        profileId,
        displayName,
        bio,
        avatarUrl,
        location
      );
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  return {
    createProfile,
    getProfile,
    getProfileByAddress,
    hasProfile,
    updateProfile,
    isLoading,
    error,
    isConnected,
    address
  };
}