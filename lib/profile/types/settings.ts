// lib/profile/types/settings.ts
export interface ProfileSettings {
    id: string;                // References profile ID
    notifications: {
      email: boolean;
      inApp: boolean;
      proposalUpdates: boolean;
      tipReceived: boolean;
      contentPublished: boolean;
    };
    privacy: {
      showActivity: boolean;
      showFunding: boolean;
      showVoting: boolean;
      publicProfile: boolean;
    };
    display: {
      showProfileId: boolean;
      defaultView: 'activity' | 'articles' | 'proposals';
    };
  }
  
  export interface ProfileSettingsResponse {
    settings: ProfileSettings;
  }