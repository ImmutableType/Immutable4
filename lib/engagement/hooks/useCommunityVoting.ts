// lib/engagement/hooks/useCommunityVoting.ts

import { useState, useEffect, useCallback } from 'react';
import { VotingParams, VotingResult } from '../types/votingTypes';
import { communityVotingService } from '../services/communityVotingService';

export const useCommunityVoting = ({
  contentId,
  initialUpvotes = 0,
  initialDownvotes = 0
}: VotingParams): VotingResult => {
  // Initialize with initial values
  const [upvotes, setUpvotes] = useState<number>(initialUpvotes);
  const [downvotes, setDownvotes] = useState<number>(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Calculate percentage
  const calculatePercentage = (up: number, down: number): number => {
    const total = up + down;
    if (total === 0) return 0;
    return (up / total) * 100;
  };

  const [percentage, setPercentage] = useState<number>(
    calculatePercentage(initialUpvotes, initialDownvotes)
  );

  // Load initial votes
  useEffect(() => {
    const loadVotes = async () => {
      setIsLoading(true);
      try {
        const { upvotes: up, downvotes: down } = await communityVotingService.getVotes(contentId);
        const userVote = await communityVotingService.getUserVote(contentId);
        
        setUpvotes(up);
        setDownvotes(down);
        setUserVote(userVote);
        setPercentage(calculatePercentage(up, down));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load votes');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVotes();
  }, [contentId]);

  // Upvote action
  const upvote = useCallback(async () => {
    setIsLoading(true);
    try {
      await communityVotingService.upvote(contentId);
      
      // If user previously downvoted, decrease downvote count
      if (userVote === 'down') {
        setDownvotes(prev => Math.max(0, prev - 1));
      }
      
      // Only increase upvote count if user hasn't already upvoted
      if (userVote !== 'up') {
        setUpvotes(prev => prev + 1);
      }
      
      setUserVote('up');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upvote');
    } finally {
      setIsLoading(false);
    }
  }, [contentId, userVote]);

  // Downvote action
  const downvote = useCallback(async () => {
    setIsLoading(true);
    try {
      await communityVotingService.downvote(contentId);
      
      // If user previously upvoted, decrease upvote count
      if (userVote === 'up') {
        setUpvotes(prev => Math.max(0, prev - 1));
      }
      
      // Only increase downvote count if user hasn't already downvoted
      if (userVote !== 'down') {
        setDownvotes(prev => prev + 1);
      }
      
      setUserVote('down');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downvote');
    } finally {
      setIsLoading(false);
    }
  }, [contentId, userVote]);

  // Remove vote action
  const removeVote = useCallback(async () => {
    setIsLoading(true);
    try {
      await communityVotingService.removeVote(contentId);
      
      // Decrease vote count based on previous vote
      if (userVote === 'up') {
        setUpvotes(prev => Math.max(0, prev - 1));
      } else if (userVote === 'down') {
        setDownvotes(prev => Math.max(0, prev - 1));
      }
      
      setUserVote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove vote');
    } finally {
      setIsLoading(false);
    }
  }, [contentId, userVote]);

  // Update percentage whenever upvotes or downvotes change
  useEffect(() => {
    setPercentage(calculatePercentage(upvotes, downvotes));
  }, [upvotes, downvotes]);

  // Return score class based on percentage
  const getScoreClass = useCallback((): 'high-score' | 'medium-score' | 'low-score' => {
    if (percentage >= 85) return 'high-score';
    if (percentage >= 60) return 'medium-score';
    return 'low-score';
  }, [percentage]);

  return {
    upvotes,
    downvotes,
    percentage,
    userVote,
    isLoading,
    error,
    upvote,
    downvote,
    removeVote,
    getScoreClass
  };
};

export default useCommunityVoting;