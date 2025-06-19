// lib/profile/types/profile.ts
export interface Profile {
  id: string;                  // Unique identifier (sequential)
  walletAddress: string;       // Blockchain wallet address
  membershipTokenId?: string;  // IT00-IT99 token ID
  displayName?: string;        // User-chosen display name
  bio?: string;                // User bio/description
  avatarUrl?: string;          // IPFS CID for avatar image
  createdAt: string;           // Creation timestamp
  isVerified: boolean;         // Verification status
  privacySettings: {           // User privacy preferences
    showActivity: boolean;
    showFunding: boolean;
    showVoting: boolean;
  };
  metrics: {                   // Aggregated statistics
    articlesRead: number;
    proposalsCreated: number;
    proposalsFunded: number;
    articlesPublished: number;
    totalTipsReceived: number;
    totalTipsSent: number;
  };
  // Added locations property for geographic filtering
  locations?: {
    primary?: {
      city: string;
      state: string;
    };
    coverage?: Array<{
      city: string;
      state: string;
      expertise?: string;
    }>;
  };
  location?: string;           // For backward compatibility
}

export interface ProfilesResponse {
  profiles: Profile[];
  total: number;
  nextCursor?: string;
}

export interface ProfileResponse {
  profile: Profile;
  isOwner: boolean;
}