// lib/hooks/proposals/useProposals.ts
import { useState, useEffect } from 'react';

// Define interfaces that match your existing data model
export interface Proposal {
  id: string;
  title: string;
  summary: string;
  proposer: string;
  proposerName?: string;
  createdAt: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'canceled';
  voteCount: number;
  fundingAmount: number;
  fundingGoal: number;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  journalistInterest?: number;
  timeline?: string;
  contentFormat?: string;
  updates?: {
    date: string;
    content: string;
  }[];
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use mock data until blockchain integration is implemented
    const mockProposals: Proposal[] = [
      {
        id: '1',
        title: 'Investigate Local Infrastructure',
        summary: 'A deep dive into Miami\'s infrastructure challenges',
        proposer: '0x1234...',
        proposerName: 'Jane Reporter',
        createdAt: '2025-04-15T12:00:00Z',
        location: 'Miami, Florida',
        category: 'Investigation',
        status: 'active',
        voteCount: 12,
        fundingAmount: 500,
        fundingGoal: 2000,
        imageUrl: '/images/placeholder.jpg',
        tags: ['infrastructure', 'local government']
      },
      {
        id: '2',
        title: 'Climate Change Impact on Miami',
        summary: 'How rising sea levels are affecting Miami communities',
        proposer: '0x5678...',
        proposerName: 'Climate Journalist',
        createdAt: '2025-04-10T10:30:00Z',
        location: 'Miami, Florida',
        category: 'Environment',
        status: 'active',
        voteCount: 24,
        fundingAmount: 1200,
        fundingGoal: 3000,
        imageUrl: '/images/placeholder.jpg',
        tags: ['climate', 'environment', 'sea level']
      }
    ];
    
    // Simulate network delay
    setTimeout(() => {
      setProposals(mockProposals);
      setLoading(false);
    }, 300);
  }, []);

  return { proposals, loading, error };
}