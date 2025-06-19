// lib/engagement/types/reactionTypes.ts

// Available reaction types
export type ReactionType = '👍' | '👏' | '🔥' | '🤔' | '❤️' | '🎉';

// Single reaction data
export interface Reaction {
  type: ReactionType;
  count: number;
  userReacted?: boolean;
}

// Chain Reaction state
export interface ChainReactionState {
  reactions: Record<ReactionType, Reaction>;
  uniqueSupporters: number;
  hasUserReacted: boolean;
  isLoading: boolean;
  error?: string;
}

// Chain Reaction hook params
export interface ChainReactionParams {
  contentId: string;
  contentType: 'article' | 'proposal' | 'community';
  initialReactions?: Partial<Record<ReactionType, number>>;
  initialSupporters?: number;
}

// Chain Reaction hook result
export interface ChainReactionResult {
  reactions: Record<ReactionType, Reaction>;
  uniqueSupporters: number;
  hasUserReacted: boolean;
  isLoading: boolean;
  error?: string;
  addReaction: (type: ReactionType, isPowerUp?: boolean) => Promise<void>;
  removeReaction: (type: ReactionType) => Promise<void>;
}

// Power-up reaction data
export interface PowerUpReaction {
  type: ReactionType;
  amount: number;
}