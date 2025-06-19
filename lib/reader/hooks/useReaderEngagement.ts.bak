// File: lib/reader/hooks/useReaderEngagement.ts
import { useState, useEffect } from 'react';
import { VoteAction, TipTransaction } from '../types/engagement';
import mockReaderService from '../services/mockReaderService';

export const useReaderEngagement = (articleId: string, userId: string) => {
  const [engagement, setEngagement] = useState<{
    hasVoted: boolean;
    hasTipped: boolean;
    userVote?: VoteAction;
    userTip?: TipTransaction;
  }>({
    hasVoted: false,
    hasTipped: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user engagement
  useEffect(() => {
    const loadEngagement = async () => {
      if (!articleId || !userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await mockReaderService.getUserEngagement(articleId, userId);
        setEngagement(data);
      } catch (err) {
        setError('Failed to load engagement data');
        console.error('Error loading engagement:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEngagement();
  }, [articleId, userId]);

  // Add vote
  const addVote = async (voteType: 'up' | 'down' | 'emoji', emoji?: string) => {
    if (!articleId || !userId) return;
    
    try {
      await mockReaderService.addVote(articleId, userId, voteType, emoji);
      
      // Refresh engagement data
      const data = await mockReaderService.getUserEngagement(articleId, userId);
      setEngagement(data);
      
      return true;
    } catch (err) {
      console.error('Error adding vote:', err);
      return false;
    }
  };

  // Add tip
  const addTip = async (amount: number, message?: string) => {
    if (!articleId || !userId) return;
    
    try {
      await mockReaderService.addTip(articleId, userId, amount, message);
      
      // Refresh engagement data
      const data = await mockReaderService.getUserEngagement(articleId, userId);
      setEngagement(data);
      
      return true;
    } catch (err) {
      console.error('Error adding tip:', err);
      return false;
    }
  };

  return {
    engagement,
    isLoading,
    error,
    addVote,
    addTip
  };
};