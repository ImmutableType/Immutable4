// Type definitions for articles within the Reader system
export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorName?: string;
  authorType: 'Journalist' | 'Citizen' | 'Organization';
  contentHash: string;  // IPFS CIDv0 hash or blockchain ID
  createdAt: string;
  location: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  proposalId?: string;  // Reference to originating proposal if applicable
  articleType: 'community' | 'portfolio' | 'native'; // NEW: Article source type
  
  // Portfolio-specific fields (optional)
  originalUrl?: string;
  publicationName?: string;
  originalAuthor?: string;
  originalPublishDate?: string;
  portfolioType?: 'verification' | 'showcase';
  
  // Encrypted/Native-specific fields (optional)
  encryptedContent?: string;
  nftCount?: number;
  nftPrice?: number;
  readerLicenseRatio?: number;
  hasAccess?: boolean; // Whether user has license to view full content
  
  readerMetrics: {
    viewCount: number;
    tipAmount: number;
    commentCount: number;
  };
}

// For author information
export interface Author {
  id: string;
  name: string;
  type: 'Journalist' | 'Citizen' | 'Organization';
  walletAddress: string;
  bio?: string;
  avatarUrl?: string;
  articles?: string[]; // Array of article IDs
}

// For comment data
export interface Comment {
  id: string;
  articleId: string;
  author: string;
  authorName?: string;
  content: string;
  createdAt: string;
  tipAmount?: number;
}