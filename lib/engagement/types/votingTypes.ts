// lib/engagement/types/votingTypes.ts

export interface VotingState {
    upvotes: number;
    downvotes: number;
    percentage: number;
    userVote?: 'up' | 'down' | null;
    isLoading: boolean;
    error?: string;
  }
  
  export interface VotingParams {
    contentId: string;
    initialUpvotes?: number;
    initialDownvotes?: number;
  }
  
  export interface VotingResult {
    upvotes: number;
    downvotes: number;
    percentage: number;
    userVote: 'up' | 'down' | null;
    isLoading: boolean;
    error?: string;
    upvote: () => Promise<void>;
    downvote: () => Promise<void>;
    removeVote: () => Promise<void>;
    getScoreClass: () => 'high-score' | 'medium-score' | 'low-score';
  }