// lib/engagement/types/cardTypes.ts

export interface CardCommonProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  createdAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  className?: string;
  onClick?: () => void;
}

export interface ContentPaneProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  createdAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  badges?: React.ReactNode[];
  actionButtons?: React.ReactNode[];
  className?: string;
}

export interface EngagementPaneProps {
  id: string;
  contentType: 'article' | 'proposal' | 'community';
  authorInfo?: {
    name: string;
    stats?: {
      written?: number;
      proposed?: number;
      curated?: number;
      location?: string;
    };
  };
  proposerInfo?: {
    name: string;
  };
  contentHash?: string;
  engagementMetrics?: {
    reactions?: Record<string, number>;
    supporters?: number;
  };
  distribution?: {
    author?: number;
    platform?: number;
    proposer?: number;
    submitter?: number;
    total?: number;
  };
  fundingInfo?: {
    raised?: number;
    goal?: number;
    percentage?: number;
  };
  votingInfo?: {
    upvotes?: number;
    downvotes?: number;
    percentage?: number;
  };
  onVoteUp?: () => void;
  onVoteDown?: () => void;
  onReaction?: (contentId: string, reactionType: string, isPowerUp: boolean) => void;  // ADD THIS
  className?: string;
  children?: React.ReactNode;
}

export interface BaseCardProps extends CardCommonProps {
  contentType: 'article' | 'proposal' | 'community';
  authorInfo?: {
    name: string;
    stats?: {
      written?: number;
      proposed?: number;
      curated?: number;
      location?: string;
    };
  };
  proposerInfo?: {
    name: string;
  };
  contentHash?: string;
  engagementMetrics?: {
    reactions?: Record<string, number>;
    supporters?: number;
  };
  distribution?: {
    author?: number;
    platform?: number;
    proposer?: number;
    submitter?: number;
    total?: number;
  };
  fundingInfo?: {
    raised?: number;
    goal?: number;
    percentage?: number;
  };
  votingInfo?: {
    upvotes?: number;
    downvotes?: number;
    percentage?: number;
  };
  badges?: React.ReactNode[];
  actionButtons?: React.ReactNode[];
  renderContent?: (props: ContentPaneProps) => React.ReactNode;
  renderEngagement?: (props: EngagementPaneProps) => React.ReactNode;
  children?: React.ReactNode;
  onUpvote?: () => void;
  onDownvote?: () => void;
  onReaction?: (contentId: string, reactionType: string, isPowerUp: boolean) => void;  // ADD THIS
}