// Type definitions for the feed system
import { Article } from './article';

export interface FeedFilters {
  contentType?: 'all' | 'articles' | 'proposals' | 'community'; // ✅ Made optional and added 'community'
  category?: string;
  location?: string;
  tag?: string;
  recency?: 'all' | 'latest' | 'week' | 'month'; // ✅ Added from useFeed requirements
  engagement?: 'all' | 'most-tipped' | 'trending'; // ✅ Added from useFeed requirements
  dateRange?: {
    start: string;
    end: string;
  };
  authorType?: 'Journalist' | 'Citizen' | 'Organization';
}

export interface FeedSortOptions {
  field: 'date' | 'popularity' | 'funding';
  direction: 'asc' | 'desc';
}

export interface FeedState {
  articles: Article[];
  proposals: ProposalSummary[];
  filters: FeedFilters;
  sort: FeedSortOptions;
  isLoading: boolean;
  error?: string;
}

// This mirrors the Proposal structure from the Proposals system
// but includes only what's needed for the Feed display
export interface ProposalSummary {
  id: string;
  title: string;
  summary: string;
  proposer: string;
  proposerName?: string;
  proposerType: string; // String type for flexibility
  createdAt: string;
  location: string;
  category: string;
  status: string; // String type for flexibility
  voteCount: number;
  fundingAmount: number;
  fundingGoal: number;
  tags: string[];
  imageUrl?: string;
}

// Additional interfaces for enhanced filtering
export interface ArticleFilters {
  category?: string;
  location?: string;
  tags?: string[];
  authorType?: 'Journalist' | 'Citizen' | 'Organization';
  dateRange?: {
    start: string;
    end: string;
  };
}