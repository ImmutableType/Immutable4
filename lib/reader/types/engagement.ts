// Type definitions for reader engagement features
export interface TipTransaction {
    id: string;
    articleId: string;
    sender: string;
    amount: number;
    timestamp: string;
    message?: string;
  }
  
  export interface VoteAction {
    id: string;
    articleId: string;
    voter: string;
    voteType: 'up' | 'down' | 'emoji';
    emoji?: string;
    timestamp: string;
  }
  
  export interface ArticleMetrics {
    articleId: string;
    viewCount: number;
    uniqueViewers: number;
    tipTotal: number;
    tipCount: number;
    commentCount: number;
    votes: {
      up: number;
      down: number;
      emoji: Record<string, number>; // Emoji counts keyed by emoji
    };
  }
  
  export interface EngagementState {
    hasVoted: boolean;
    hasTipped: boolean;
    hasCommented: boolean;
    userVote?: VoteAction;
    userTip?: TipTransaction;
    isLoadingEngagement: boolean;
    error?: string;
  }