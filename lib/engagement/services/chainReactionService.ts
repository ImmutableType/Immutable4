// lib/engagement/services/chainReactionService.ts

import { ReactionType, PowerUpReaction } from '../types/reactionTypes';

// Interface for the chain reaction service
export interface ChainReactionService {
  getReactions(contentId: string, contentType: string): Promise<Record<ReactionType, number>>;
  getSupporters(contentId: string, contentType: string): Promise<number>;
  addReaction(contentId: string, contentType: string, reactionType: ReactionType, isPowerUp?: boolean): Promise<void>;
  removeReaction(contentId: string, contentType: string, reactionType: ReactionType): Promise<void>;
  hasUserReacted(contentId: string, contentType: string): Promise<boolean>;
}

// Implementation of the chain reaction service (mock for now)
export class MockChainReactionService implements ChainReactionService {
  private reactions: Record<string, Record<ReactionType, number>> = {};
  private supporters: Record<string, number> = {};
  private userReactions: Record<string, Set<ReactionType>> = {};

  private getContentKey(contentId: string, contentType: string): string {
    return `${contentType}-${contentId}`;
  }

  async getReactions(contentId: string, contentType: string): Promise<Record<ReactionType, number>> {
    const key = this.getContentKey(contentId, contentType);
    return this.reactions[key] || {};
  }

  async getSupporters(contentId: string, contentType: string): Promise<number> {
    const key = this.getContentKey(contentId, contentType);
    return this.supporters[key] || 0;
  }

  async addReaction(contentId: string, contentType: string, reactionType: ReactionType, isPowerUp: boolean = false): Promise<void> {
    const key = this.getContentKey(contentId, contentType);
    
    // Initialize if needed
    if (!this.reactions[key]) {
      this.reactions[key] = {} as Record<ReactionType, number>;
    }
    
    if (!this.userReactions[key]) {
      this.userReactions[key] = new Set();
    }
    
    // Update reaction count
    const currentCount = this.reactions[key][reactionType] || 0;
    this.reactions[key][reactionType] = currentCount + (isPowerUp ? 100 : 1);
    
    // Add to user reactions if not already reacted
    if (!this.userReactions[key].has(reactionType)) {
      this.userReactions[key].add(reactionType);
      
      // Increment supporters count
      this.supporters[key] = (this.supporters[key] || 0) + 1;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async removeReaction(contentId: string, contentType: string, reactionType: ReactionType): Promise<void> {
    const key = this.getContentKey(contentId, contentType);
    
    // Check if user has reacted
    if (this.userReactions[key]?.has(reactionType)) {
      // Remove from user reactions
      this.userReactions[key].delete(reactionType);
      
      // Decrement reaction count
      if (this.reactions[key] && this.reactions[key][reactionType]) {
        this.reactions[key][reactionType] -= 1;
      }
      
      // If user has no more reactions on this content, decrement supporters
      if (this.userReactions[key].size === 0) {
        this.supporters[key] = Math.max(0, (this.supporters[key] || 0) - 1);
      }
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async hasUserReacted(contentId: string, contentType: string): Promise<boolean> {
    const key = this.getContentKey(contentId, contentType);
    return (this.userReactions[key]?.size || 0) > 0;
  }
}

// Create and export a singleton instance
export const chainReactionService = new MockChainReactionService();