// components/cards/types/ProposalCard.tsx
import React from 'react';
import { BaseCardProps } from '../../../lib/engagement/types/cardTypes';
import BaseCard from '../base/BaseCard';
import BookmarkButton from '../../engagement/bookmarkShare/BookmarkButton';

// Define the subset of props needed for ProposalCard
export interface ProposalCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  proposer: {
    name: string;
    id: string;
    stats?: {
      written?: number;
      proposed?: number;
      location?: string;
    };
  };
  createdAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  status: 'active' | 'completed' | 'canceled';
  funding: {
    amount: number;
    goal: number;
    percentage?: number;
  };
  metrics?: {
    reactions?: Record<string, number>;
    supporters?: number;
    journalistInterest?: number;
  };
  distribution?: {
    proposer?: number;
    platform?: number;
    futureAuthor?: number;
  };
  contentHash?: string;
  onClick?: () => void;
  className?: string;
}

// Create ProposalBadge component
const ProposalBadge: React.FC<{status: 'active' | 'completed' | 'canceled'}> = ({status}) => {
  const getLabel = () => {
    switch (status) {
      case 'active': return 'Open Proposal';
      case 'completed': return 'Completed';
      case 'canceled': return 'Canceled';
      default: return 'Proposal';
    }
  };
  
  return (
    <span className={`badge proposal-badge ${status}`}>
      {getLabel()}
    </span>
  );
};

const ProposalCard: React.FC<ProposalCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
  proposer,
  createdAt,
  location,
  category,
  tags = [],
  status,
  funding,
  metrics,
  distribution,
  contentHash,
  onClick,
  className,
}) => {
  // Format date for display
  const formattedDate = `Proposed: ${new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;

  // Prepare badges
  const badges = [
    <ProposalBadge key="status" status={status} />
  ];

  // Prepare action buttons - only bookmark for proposals
  const actionButtons = [
    <BookmarkButton key="bookmark" contentId={id} contentType="proposal" />
  ];

  // Calculate funding percentage if not provided
  const fundingPercentage = funding.percentage ?? (funding.amount / funding.goal * 100);

  // Create props for BaseCard
  const baseCardProps: BaseCardProps = {
    id,
    title,
    summary,
    imageUrl,
    contentType: 'proposal',
    createdAt: formattedDate,
    location,
    category,
    tags,
    proposerInfo: {
      name: proposer.name
    },
    contentHash,
    engagementMetrics: {
      reactions: metrics?.reactions,
      supporters: metrics?.supporters
    },
    distribution,
    fundingInfo: {
      raised: funding.amount,
      goal: funding.goal,
      percentage: fundingPercentage
    },
    badges,
    actionButtons,
    onClick,
    className
  };

  return <BaseCard {...baseCardProps} />;
};

export default ProposalCard;