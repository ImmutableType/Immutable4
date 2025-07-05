// components/cards/types/CommunityCard.tsx
import React from 'react';
import { BaseCardProps } from '../../../lib/engagement/types/cardTypes';
import BaseCard from '../base/BaseCard';

// Define the subset of props needed for CommunityCard
export interface CommunityCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  submitter: {
    name: string;
    id: string;
    stats?: {
      curated?: number;
      reliability?: number;
      location?: string;
    };
  };
  sourceUrl: string;
  sourceName: string;
  createdAt: string;
  sharedAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  metrics?: {
    reactions?: Record<string, number>;
    supporters?: number;
  };
  distribution?: {
    submitter?: number;
    platform?: number;
    total?: number;
  };
  contentHash?: string;
  onClick?: () => void;
  className?: string;
  onReaction?: (contentId: string, reactionType: string, isPowerUp: boolean) => void;
  pendingReaction?: string | null;
}

// Create CommunityBadge component
const CommunityBadge: React.FC = () => (
  <span className="badge" style={{backgroundColor: 'var(--color-alert-amber)', color: 'white'}}>
    Community Curated
  </span>
);

const CommunityCard: React.FC<CommunityCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
  submitter,
  sourceUrl,
  sourceName,
  createdAt,
  sharedAt,
  location,
  category,
  tags = [],
  metrics,
  distribution,
  contentHash,
  onClick,
  className,
  onReaction,
  pendingReaction,
}) => {
  // Format date for display
  const formattedDate = `Shared: ${new Date(sharedAt || createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;

  // Prepare badges
  const badges = [
    <CommunityBadge key="community" />
  ];

  // No action buttons for community cards per contract constraints
  const actionButtons: React.ReactNode[] = [];

  // Create props for BaseCard
  const baseCardProps: BaseCardProps = {
    id,
    title,
    summary,
    imageUrl,
    contentType: 'community',
    createdAt: formattedDate,
    location,
    category,
    tags,
    authorInfo: {
      name: submitter.name,
      stats: {
        curated: submitter.stats?.curated
      }
    },
    contentHash,
    engagementMetrics: {
      reactions: metrics?.reactions,
      supporters: metrics?.supporters
    },
    distribution,
    badges,
    actionButtons,
    onClick,
    className,
    onReaction,
    pendingReaction
  };

  return <BaseCard {...baseCardProps} />;
};

export default CommunityCard;