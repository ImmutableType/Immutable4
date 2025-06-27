// lib/profile/types/activity.ts
export type ActivityType = 
  | 'read'      // Read an article
  | 'create'    // Created a proposal or article
  | 'fund'      // Funded a proposal
  | 'vote'      // Voted on a proposal
  | 'tip'       // Tipped an author
  | 'comment';  // Commented on content

export interface ActivityItem {
  id: string;
  profileId: string;
  type: ActivityType;
  timestamp: string;
  contentId: string;          // Article or proposal ID
  contentType: 'article' | 'proposal';
  contentTitle: string;
  amount?: number;            // For funding/tipping activities
  details?: string;           // Additional context
}

export interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
  nextCursor?: string;
}