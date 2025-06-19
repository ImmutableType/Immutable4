// lib/profile/services/mockProfileService.ts
import profilesData from '../mockData/profiles.json';
import activitiesData from '../mockData/activities.json';
import { Profile, ProfileResponse, ProfilesResponse } from '../types/profile';
import { ActivityItem, ActivityResponse } from '../types/activity';
import { ProfileSettings, ProfileSettingsResponse } from '../types/settings';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProfileService = {
  // Get a list of profiles
  getProfiles: async (limit = 10, cursor?: string): Promise<ProfilesResponse> => {
    await delay(800); // Simulate network delay
    
    const { profiles, total } = profilesData;
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const paginatedProfiles = profiles.slice(startIndex, endIndex);
    
    return {
      profiles: paginatedProfiles,
      total,
      nextCursor: endIndex < total ? endIndex.toString() : undefined
    };
  },
  
  // Get a single profile by ID
  getProfile: async (id: string, walletAddress?: string): Promise<ProfileResponse> => {
    await delay(600); // Simulate network delay
    
    const { profiles } = profilesData;
    const profile = profiles.find(p => p.id === id);
    
    if (!profile) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    
    return {
      profile,
      isOwner: walletAddress ? profile.walletAddress.toLowerCase() === walletAddress.toLowerCase() : false
    };
  },
  
  // Get a profile by wallet address
  getProfileByWalletAddress: async (walletAddress: string): Promise<ProfileResponse | null> => {
    await delay(600); // Simulate network delay
    
    const { profiles } = profilesData;
    const profile = profiles.find(p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    
    if (!profile) {
      return null;
    }
    
    return {
      profile,
      isOwner: true
    };
  },
  
  // Create a new profile
  createProfile: async (walletAddress: string, data: Partial<Profile>): Promise<ProfileResponse> => {
    await delay(1000); // Simulate network delay
    
    // In a real implementation, this would interact with the blockchain
    
    // Generate a mock profile with the next ID
    const { profiles } = profilesData;
    const nextId = (profiles.length).toString();
    
    const newProfile: Profile = {
      id: nextId,
      walletAddress,
      displayName: data.displayName || '',
      bio: data.bio || '',
      avatarUrl: data.avatarUrl,
      createdAt: new Date().toISOString(),
      isVerified: false,
      privacySettings: {
        showActivity: true,
        showFunding: true,
        showVoting: true,
        ...data.privacySettings
      },
      metrics: {
        articlesRead: 0,
        proposalsCreated: 0,
        proposalsFunded: 0,
        articlesPublished: 0,
        totalTipsReceived: 0,
        totalTipsSent: 0,
        ...data.metrics
      }
    };
    
    // In a real implementation, this would be persisted to the blockchain
    
    return {
      profile: newProfile,
      isOwner: true
    };
  },
  
  // Update an existing profile
  updateProfile: async (id: string, walletAddress: string, data: Partial<Profile>): Promise<ProfileResponse> => {
    await delay(800); // Simulate network delay
    
    const { profiles } = profilesData;
    const profileIndex = profiles.findIndex(p => p.id === id);
    
    if (profileIndex === -1) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    
    const profile = profiles[profileIndex];
    
    // Check ownership
    if (profile.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('You do not have permission to update this profile');
    }
    
    // Update the profile
    const updatedProfile: Profile = {
      ...profile,
      ...data,
      privacySettings: {
        ...profile.privacySettings,
        ...data.privacySettings
      },
      // Don't allow metrics to be updated directly
      metrics: profile.metrics
    };
    
    // In a real implementation, this would be persisted to the blockchain
    
    return {
      profile: updatedProfile,
      isOwner: true
    };
  },
  
  // Get profile activities
  getProfileActivities: async (profileId: string, limit: number = 10, cursor?: string): Promise<ActivityResponse> => {
    await delay(700); // Simulate network delay
    
    const { activities } = activitiesData as { activities: ActivityItem[] };
    const profileActivities = activities.filter(a => a.profileId === profileId);
    const total = profileActivities.length;
    
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const paginatedActivities = profileActivities.slice(startIndex, endIndex);
    
    return {
      activities: paginatedActivities,
      total,
      nextCursor: endIndex < total ? endIndex.toString() : undefined
    };
  },
  
  // Get profile settings
  getProfileSettings: async (profileId: string, walletAddress: string): Promise<ProfileSettingsResponse> => {
    await delay(500); // Simulate network delay
    
    const { profiles } = profilesData;
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    // Check ownership
    if (profile.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('You do not have permission to access these settings');
    }
    
    // Mock settings
    const settings: ProfileSettings = {
      id: profileId,
      notifications: {
        email: true,
        inApp: true,
        proposalUpdates: true,
        tipReceived: true,
        contentPublished: true
      },
      privacy: {
        showActivity: profile.privacySettings.showActivity,
        showFunding: profile.privacySettings.showFunding,
        showVoting: profile.privacySettings.showVoting,
        publicProfile: true
      },
      display: {
        showProfileId: true,
        defaultView: 'activity'
      }
    };
    
    return { settings };
  },
  
  // Update profile settings
  updateProfileSettings: async (
    profileId: string, 
    walletAddress: string, 
    settings: Partial<ProfileSettings>
  ): Promise<ProfileSettingsResponse> => {
    await delay(800); // Simulate network delay
    
    const { profiles } = profilesData;
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    // Check ownership
    if (profile.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('You do not have permission to update these settings');
    }
    
    // Mock updated settings
    const updatedSettings: ProfileSettings = {
      id: profileId,
      notifications: {
        email: true,
        inApp: true,
        proposalUpdates: true,
        tipReceived: true,
        contentPublished: true,
        ...settings.notifications
      },
      privacy: {
        showActivity: profile.privacySettings.showActivity,
        showFunding: profile.privacySettings.showFunding,
        showVoting: profile.privacySettings.showVoting,
        publicProfile: true,
        ...settings.privacy
      },
      display: {
        showProfileId: true,
        defaultView: 'activity',
        ...settings.display
      }
    };
    
    // Update privacy settings on the profile too
    if (settings.privacy) {
      profile.privacySettings = {
        showActivity: settings.privacy.showActivity ?? profile.privacySettings.showActivity,
        showFunding: settings.privacy.showFunding ?? profile.privacySettings.showFunding,
        showVoting: settings.privacy.showVoting ?? profile.privacySettings.showVoting
      };
    }
    
    return { settings: updatedSettings };
  }
};