// lib/blockchain/contracts/ProfileNFT.ts
import { ethers } from 'ethers';
import ProfileNFTABI from './ProfileNFT.abi.json';
import deploymentInfo from '@/deployments/ProfileNFT.json';

export interface ProfileData {
  id: string;
  owner: string;
  membershipTokenId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  createdAt: string;
  lastUpdatedAt: string;
  tosVersion: string;
  tosAcceptedAt: string;
}

export interface ProfileUpdate {
  timestamp: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
}

export class ProfileNFTService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  
  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      deploymentInfo.address,
      ProfileNFTABI,
      signer || provider
    );
  }
  
  // Create a new profile (mint NFT)
  async createProfile(
    displayName: string,
    bio: string,
    avatarUrl: string,
    location: string,
    tosVersion: string = "1.0"
  ): Promise<{ profileId: string; txHash: string }> {
    try {
      // Call the mintProfile function
      const tx = await this.contract.mintProfile(
        displayName,
        bio,
        avatarUrl || '', // Default to empty string if no avatar
        location,
        tosVersion
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract profileId from the ProfileMinted event
      const mintEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'ProfileMinted'
      );
      
      if (!mintEvent) {
        throw new Error('Profile minting event not found');
      }
      
      const profileId = mintEvent.args.profileId.toString();
      
      return {
        profileId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      // Handle specific contract errors
      if (error.message?.includes('Must hold ImmutableType membership token')) {
        throw new Error('You must hold an ImmutableType membership token (IT00-IT99) to create a profile');
      }
      if (error.message?.includes('Address already has a profile')) {
        throw new Error('This wallet already has a profile');
      }
      if (error.message?.includes('Display name cannot be empty')) {
        throw new Error('Display name is required');
      }
      if (error.message?.includes('Display name too long')) {
        throw new Error('Display name must be 50 characters or less');
      }
      if (error.message?.includes('Bio too long')) {
        throw new Error('Bio must be 500 characters or less');
      }
      
      throw error;
    }
  }
  
  // Get profile by ID
  async getProfile(profileId: string): Promise<ProfileData | null> {
    try {
      const profile = await this.contract.getProfile(profileId);
      
      return {
        id: profile.id.toString(),
        owner: profile.owner,
        membershipTokenId: profile.membershipTokenId.toString(),
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
        createdAt: new Date(Number(profile.createdAt) * 1000).toISOString(),
        lastUpdatedAt: new Date(Number(profile.lastUpdatedAt) * 1000).toISOString(),
        tosVersion: profile.tosVersion,
        tosAcceptedAt: new Date(Number(profile.tosAcceptedAt) * 1000).toISOString(),
      };
    } catch (error: any) {
      if (error.message?.includes('Profile does not exist')) {
        return null;
      }
      throw error;
    }
  }
  
  // Get profile by wallet address
  async getProfileByAddress(address: string): Promise<ProfileData | null> {
    try {
      const profile = await this.contract.getProfileByAddress(address);
      
      return {
        id: profile.id.toString(),
        owner: profile.owner,
        membershipTokenId: profile.membershipTokenId.toString(),
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
        createdAt: new Date(Number(profile.createdAt) * 1000).toISOString(),
        lastUpdatedAt: new Date(Number(profile.lastUpdatedAt) * 1000).toISOString(),
        tosVersion: profile.tosVersion,
        tosAcceptedAt: new Date(Number(profile.tosAcceptedAt) * 1000).toISOString(),
      };
    } catch (error: any) {
      if (error.message?.includes('Address has no profile')) {
        return null;
      }
      throw error;
    }
  }
  
  // Check if address has a profile
  async hasProfile(address: string): Promise<boolean> {
    return await this.contract.hasProfile(address);
  }
  
  // Update profile
  async updateProfile(
    profileId: string,
    displayName: string,
    bio: string,
    avatarUrl: string,
    location: string
  ): Promise<{ txHash: string }> {
    const tx = await this.contract.updateProfile(
      profileId,
      displayName,
      bio,
      avatarUrl || '',
      location
    );
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash
    };
  }
  
  // Get profile update history
  async getProfileHistory(profileId: string): Promise<ProfileUpdate[]> {
    const history = await this.contract.getProfileHistory(profileId);
    
    return history.map((update: any) => ({
      timestamp: new Date(Number(update.timestamp) * 1000).toISOString(),
      fieldName: update.fieldName,
      oldValue: update.oldValue,
      newValue: update.newValue,
      updatedBy: update.updatedBy
    }));
  }
  
  // Get the membership token ID for a profile
  async getProfileMembershipToken(profileId: string): Promise<string> {
    const tokenId = await this.contract.getProfileMembershipToken(profileId);
    return tokenId.toString();
  }

  // Get total number of profiles
  async getTotalProfiles(): Promise<number> {
    try {
      // Since the contract doesn't expose a totalSupply or counter,
      // we'll need to find profiles by checking which IDs exist
      let count = 0;
      let id = 1;
      let consecutiveMisses = 0;
      
      // Keep checking until we get 5 consecutive misses
      while (consecutiveMisses < 5 && id <= 1000) { // Cap at 1000 for safety
        try {
          await this.contract.getProfile(id);
          count = id; // Update count to the highest found ID
          consecutiveMisses = 0; // Reset consecutive misses
        } catch (error) {
          consecutiveMisses++;
        }
        id++;
      }
      
      return count;
    } catch (error) {
      console.error('Error getting total profiles:', error);
      return 0;
    }
  }

  // Get multiple profiles by ID range
  async getProfileBatch(startId: number, limit: number): Promise<ProfileData[]> {
    const profiles: ProfileData[] = [];
    
    // Fetch profiles in parallel for better performance
    const promises: Promise<ProfileData | null>[] = [];
    
    for (let i = startId; i <= startId + limit - 1; i++) {
      promises.push(this.getProfile(i.toString()));
    }
    
    const results = await Promise.all(promises);
    
    // Filter out null results (non-existent profiles)
    for (const profile of results) {
      if (profile) {
        profiles.push(profile);
      }
    }
    
    return profiles;
  }

  // Get profiles with pagination (returns profiles in reverse order - newest first)
  async getProfilesPaginated(limit: number, offset: number = 0): Promise<{
    profiles: ProfileData[];
    total: number;
    hasMore: boolean;
  }> {
    const profiles: ProfileData[] = [];
    
    // Simple approach: just try to fetch the first N profiles starting from ID 1
    console.log(`Attempting to fetch up to ${limit} profiles starting from ID ${offset + 1}`);
    
    let foundCount = 0;
    let checkedCount = 0;
    const startId = offset + 1;
    const maxToCheck = 100; // Don't check more than 100 IDs in one request
    
    for (let i = startId; i < startId + maxToCheck && foundCount < limit; i++) {
      try {
        console.log(`Checking profile ID ${i}...`);
        const profile = await this.getProfile(i.toString());
        if (profile) {
          console.log(`Found profile ${i}:`, profile.displayName);
          profiles.push(profile);
          foundCount++;
        }
      } catch (error) {
        console.log(`Profile ${i} doesn't exist`);
      }
      checkedCount++;
    }
    
    console.log(`Found ${foundCount} profiles after checking ${checkedCount} IDs`);
    
    // Simple hasMore logic: if we found as many as requested, there might be more
    const hasMore = foundCount === limit;
    
    return {
      profiles,
      total: foundCount, // For now, just return what we found
      hasMore
    };
  }
}