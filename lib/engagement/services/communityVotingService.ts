// lib/engagement/services/communityVotingService.ts

export interface CommunityVotingService {
    getVotes(contentId: string): Promise<{ upvotes: number; downvotes: number }>;
    getUserVote(contentId: string): Promise<'up' | 'down' | null>;
    upvote(contentId: string): Promise<void>;
    downvote(contentId: string): Promise<void>;
    removeVote(contentId: string): Promise<void>;
  }
  
  export class MockCommunityVotingService implements CommunityVotingService {
    private votes: Record<string, { upvotes: number; downvotes: number }> = {};
    private userVotes: Record<string, 'up' | 'down' | null> = {};
  
    async getVotes(contentId: string): Promise<{ upvotes: number; downvotes: number }> {
      return this.votes[contentId] || { upvotes: 0, downvotes: 0 };
    }
  
    async getUserVote(contentId: string): Promise<'up' | 'down' | null> {
      return this.userVotes[contentId] || null;
    }
  
    async upvote(contentId: string): Promise<void> {
      // Initialize if needed
      if (!this.votes[contentId]) {
        this.votes[contentId] = { upvotes: 0, downvotes: 0 };
      }
      
      const currentVote = this.userVotes[contentId];
      
      // If user already upvoted, do nothing
      if (currentVote === 'up') {
        return;
      }
      
      // If user previously downvoted, remove that downvote
      if (currentVote === 'down') {
        this.votes[contentId].downvotes = Math.max(0, this.votes[contentId].downvotes - 1);
      }
      
      // Add upvote
      this.votes[contentId].upvotes += 1;
      this.userVotes[contentId] = 'up';
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  
    async downvote(contentId: string): Promise<void> {
      // Initialize if needed
      if (!this.votes[contentId]) {
        this.votes[contentId] = { upvotes: 0, downvotes: 0 };
      }
      
      const currentVote = this.userVotes[contentId];
      
      // If user already downvoted, do nothing
      if (currentVote === 'down') {
        return;
      }
      
      // If user previously upvoted, remove that upvote
      if (currentVote === 'up') {
        this.votes[contentId].upvotes = Math.max(0, this.votes[contentId].upvotes - 1);
      }
      
      // Add downvote
      this.votes[contentId].downvotes += 1;
      this.userVotes[contentId] = 'down';
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  
    async removeVote(contentId: string): Promise<void> {
      const currentVote = this.userVotes[contentId];
      
      // If user hasn't voted, do nothing
      if (!currentVote || !this.votes[contentId]) {
        return;
      }
      
      // Remove the vote
      if (currentVote === 'up') {
        this.votes[contentId].upvotes = Math.max(0, this.votes[contentId].upvotes - 1);
      } else if (currentVote === 'down') {
        this.votes[contentId].downvotes = Math.max(0, this.votes[contentId].downvotes - 1);
      }
      
      // Clear user vote
      this.userVotes[contentId] = null;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Create and export a singleton instance
  export const communityVotingService = new MockCommunityVotingService();