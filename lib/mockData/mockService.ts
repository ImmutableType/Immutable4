// lib/mockData/mockService.ts
import { Proposal } from '../types/proposal';
import proposals from './proposals.json';
import proposalDetails from './proposalDetails.json';
import users from './users.json';
import engagement from './engagement.json';

// Define interfaces for our data structures
interface FilterOptions {
  category?: string;
  status?: string;
  [key: string]: any;
}

interface Vote {
  user: string;
  emoji: string;
  timestamp: string;
}

interface Funding {
  user: string;
  amount: number;
  timestamp: string;
}

interface JournalistInterest {
  user: string;
  timestamp: string;
  message: string;
}

interface Comment {
  user: string;
  content: string;
  timestamp: string;
}

interface EngagementData {
  votes: Vote[];
  funding: Funding[];
  journalistInterest: JournalistInterest[];
  comments: Comment[];
}

interface User {
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

// Type assertion for imported JSON
const typedProposals = proposals as Proposal[];
const typedProposalDetails = proposalDetails as Record<string, Proposal>;
const typedUsers = users as User[];
const typedEngagement = engagement as Record<string, EngagementData>;

// Simulate network delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Mock Proposal Services
export const mockProposalService = {
  // Get all proposals with optional filters
  getProposals: async (filters: FilterOptions = {}): Promise<Proposal[]> => {
    await delay(800); // Simulate network request
    
    let filteredProposals = [...typedProposals];
    
    // Apply filters (category, status, etc.) if provided
    if (filters.category) {
      filteredProposals = filteredProposals.filter(p => p.category === filters.category);
    }
    
    if (filters.status) {
      filteredProposals = filteredProposals.filter(p => p.status === filters.status);
    }
    
    // Sort by created date (newest first) by default
    return filteredProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  // Get a single proposal by ID
  getProposalById: async (id: string): Promise<Proposal> => {
    await delay(600);
    
    if (typedProposalDetails[id]) {
      return typedProposalDetails[id];
    }
    
    // If not in detailed list, find in general list
    const basicProposal = typedProposals.find(p => p.id === id);
    if (!basicProposal) {
      throw new Error('Proposal not found');
    }
    
    return basicProposal;
  },
  
  // Create a new proposal
  createProposal: async (proposalData: Partial<Proposal>): Promise<Proposal> => {
    await delay(1200); // Longer delay to simulate transaction time
    
    // Generate a new ID
    const newId = `prop-${String(typedProposals.length + 1).padStart(3, '0')}`;
    
    // Create the new proposal object
    const newProposal: Proposal = {
      id: newId,
      title: proposalData.title || '',
      summary: proposalData.summary || '',
      proposer: proposalData.proposer || '',
      createdAt: new Date().toISOString(),
      location: proposalData.location || 'Miami',
      category: proposalData.category || 'General',
      status: 'active',
      voteCount: 0,
      fundingAmount: 0,
      fundingGoal: proposalData.fundingGoal || 1.0,
      imageUrl: '/images/proposals/default.jpg',
      ...proposalData
    };
    
    // In a real app, we would update the JSON files
    // Here we just return the new object
    return newProposal;
  }
};

// Mock Engagement Services
export const mockEngagementService = {
  // Get engagement data for a proposal
  getEngagement: async (proposalId: string): Promise<EngagementData> => {
    await delay(700);
    return typedEngagement[proposalId] || { votes: [], funding: [], journalistInterest: [], comments: [] };
  },
  
  // Add a vote to a proposal
  addVote: async (proposalId: string, userAddress: string, emoji: string): Promise<Vote> => {
    await delay(900);
    
    const newVote: Vote = {
      user: userAddress,
      emoji,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, we would update the JSON files
    return newVote;
  },
  
  // Add funding to a proposal
  addFunding: async (proposalId: string, userAddress: string, amount: number): Promise<Funding> => {
    await delay(1100);
    
    const newFunding: Funding = {
      user: userAddress,
      amount,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, we would update the JSON files
    return newFunding;
  },
  
  // Register journalist interest
  registerJournalistInterest: async (proposalId: string, userAddress: string, message: string): Promise<JournalistInterest> => {
    await delay(1000);
    
    const newInterest: JournalistInterest = {
      user: userAddress,
      timestamp: new Date().toISOString(),
      message
    };
    
    // In a real app, we would update the JSON files
    return newInterest;
  }
};

// Mock User/Wallet Services
export const mockUserService = {
  // Get user by wallet address
  getUserByAddress: async (address: string): Promise<User | null> => {
    await delay(500);
    const user = typedUsers.find(u => u.address === address);
    
    if (!user) {
      return null;
    }
    
    return user;
  },
  
  // Connect wallet (simulate)
  connectWallet: async (): Promise<User> => {
    await delay(1500);
    
    // Return a random user from our mock list to simulate connection
    const randomIndex = Math.floor(Math.random() * typedUsers.length);
    return typedUsers[randomIndex];
  },
  
  // Disconnect wallet (simulate)
  disconnectWallet: async (): Promise<boolean> => {
    await delay(300);
    return true;
  }
};