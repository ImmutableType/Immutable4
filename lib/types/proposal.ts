// lib/types/proposal.ts
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
  
  export interface ProposalCardProps {
    proposal: Proposal;
    onClick?: (id: string) => void;
  }
  
  export interface FilterOptions {
    category?: string;
    status?: string;
    [key: string]: any;
  }
  
  export interface Vote {
    user: string;
    emoji: string;
    timestamp: string;
  }
  
  export interface Funding {
    user: string;
    amount: number;
    timestamp: string;
  }
  
  export interface JournalistInterest {
    user: string;
    timestamp: string;
    message: string;
  }
  
  export interface Comment {
    user: string;
    content: string;
    timestamp: string;
  }
  
  export interface EngagementData {
    votes: Vote[];
    funding: Funding[];
    journalistInterest: JournalistInterest[];
    comments: Comment[];
  }
  
  export interface User {
    id: string;
    address: string;
    displayName: string;
    isJournalist: boolean;
    bio: string;
    proposals: string[];
    funded: string[];
    voted: string[];
    interestedIn?: string[];
  }