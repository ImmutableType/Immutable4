// lib/engagement/hooks/useChainReactions.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  ReactionType, 
  ChainReactionParams, 
  ChainReactionResult 
} from '../types/reactionTypes';
import { chainReactionService } from '../services/chainReactionService';

export const useChainReactions = ({
  contentId,
  contentType,
  initialReactions = {},
  initialSupporters = 0
}: ChainReactionParams): ChainReactionResult => {
  // Initialize state with initial values
  const [reactions, setReactions] = useState<Record<ReactionType, { type: ReactionType, count: number, userReacted?: boolean }>>({
    '👍': { type: '👍', count: initialReactions['👍'] || 0 },
    '👏': { type: '👏', count: initialReactions['👏'] || 0 },
    '🔥': { type: '🔥', count: initialReactions['🔥'] || 0 },
    '🤔': { type: '🤔', count: initialReactions['🤔'] || 0 },
    '❤️': { type: '❤️', count: initialReactions['❤️'] || 0 },
    '🎉': { type: '🎉', count: initialReactions['🎉'] || 0 },
  });
  const [uniqueSupporters, setUniqueSupporters] = useState<number>(initialSupporters);
  const [hasUserReacted, setHasUserReacted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Load initial reactions
  useEffect(() => {
    const loadReactions = async () => {
      setIsLoading(true);
      try {
        const reactionData = await chainReactionService.getReactions(contentId, contentType);
        const supportersCount = await chainReactionService.getSupporters(contentId, contentType);
        const userReacted = await chainReactionService.hasUserReacted(contentId, contentType);
        
        // Transform into required format
        const formattedReactions: Record<ReactionType, { type: ReactionType, count: number, userReacted?: boolean }> = {
          '👍': { type: '👍', count: reactionData['👍'] || 0 },
          '👏': { type: '👏', count: reactionData['👏'] || 0 },
          '🔥': { type: '🔥', count: reactionData['🔥'] || 0 },
          '🤔': { type: '🤔', count: reactionData['🤔'] || 0 },
          '❤️': { type: '❤️', count: reactionData['❤️'] || 0 },
          '🎉': { type: '🎉', count: reactionData['🎉'] || 0 },
        };
        
        setReactions(formattedReactions);
        setUniqueSupporters(supportersCount);
        setHasUserReacted(userReacted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reactions');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReactions();
  }, [contentId, contentType]);

  // Add reaction
  const addReaction = useCallback(async (type: ReactionType, isPowerUp: boolean = false) => {
    setIsLoading(true);
    try {
      await chainReactionService.addReaction(contentId, contentType, type, isPowerUp);
      
      // Update local state
      setReactions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          count: prev[type].count + (isPowerUp ? 100 : 1),
          userReacted: true
        }
      }));
      
      if (!hasUserReacted) {
        setUniqueSupporters(prev => prev + 1);
        setHasUserReacted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
    } finally {
      setIsLoading(false);
    }
  }, [contentId, contentType, hasUserReacted]);

  // Remove reaction
  const removeReaction = useCallback(async (type: ReactionType) => {
    setIsLoading(true);
    try {
      await chainReactionService.removeReaction(contentId, contentType, type);
      
      // Update local state
      setReactions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          count: Math.max(0, prev[type].count - 1),
          userReacted: false
        }
      }));
      
      // We would need to check if user still has other reactions
      const userReacted = await chainReactionService.hasUserReacted(contentId, contentType);
      if (!userReacted) {
        setUniqueSupporters(prev => Math.max(0, prev - 1));
        setHasUserReacted(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
    } finally {
      setIsLoading(false);
    }
  }, [contentId, contentType]);

  return {
    reactions,
    uniqueSupporters,
    hasUserReacted,
    isLoading,
    error,
    addReaction,
    removeReaction
  };
};

export default useChainReactions;