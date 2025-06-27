// lib/profile/types/activity.ts
export type ActivityType = 
  | 'gm'                // Said Good Morning
  | 'bookmark'          // Bookmarked/unbookmarked content
  | 'community-article' // Published community article
  | 'portfolio-article' // Published portfolio article
  | 'native-article'    // Published native article
  | 'license-purchase'  // Purchased article license
  | 'leaderboard'       // Updated leaderboard
  | 'emoji-purchase'    // Purchased EMOJI tokens
  | 'tip-sent'          // Sent a tip
  | 'tip-received';     // Received a tip

export interface ActivityItem {
  id: string;
  type: ActivityType;
  action: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  details?: {
    title?: string;
    amount?: string;
    recipient?: string;
    contentType?: 'article' | 'proposal';
    tipType?: 'FLOW' | 'EMOJI';
  };
}

export interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
  hasMore: boolean;
}