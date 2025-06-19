// components/cards/types/ArticleCard.tsx
import React from 'react';
import { BaseCardProps } from '../../../lib/engagement/types/cardTypes';
import BaseCard from '../base/BaseCard';
import BookmarkButton from '../../engagement/bookmarkShare/BookmarkButton';

// Define the subset of props needed for ArticleCard
export interface ArticleCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  author: {
    name: string;
    id: string;
    type?: 'Journalist' | 'Citizen' | 'Organization';
    stats?: {
      written?: number;
      proposed?: number;
      location?: string;
    };
  };
  proposer?: {
    name: string;
    id: string;
  };
  createdAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  contentHash?: string;
  metrics?: {
    views?: number;
    comments?: number;
    tips?: number;
    reactions?: Record<string, number>;
    supporters?: number;
  };
  distribution?: {
    author?: number;
    platform?: number;
    proposer?: number;
  };
  isVerified?: boolean;
  onClick?: () => void;
  className?: string;
}

// Create VerificationBadge component for article cards
const VerificationBadge: React.FC = () => (
  <span className="badge verification-badge">Verified</span>
);

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
  author,
  proposer,
  createdAt,
  location,
  category,
  tags = [],
  contentHash,
  metrics,
  distribution,
  isVerified,
  onClick,
  className,
}) => {
  // Format date for display (extracted from the original ArticleCard)
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Prepare badges
  const badges = [];
  if (isVerified) {
    badges.push(<VerificationBadge key="verified" />);
  }

  // Prepare action buttons - only bookmark for articles
  const actionButtons = [
    <BookmarkButton key="bookmark" contentId={id} contentType="article" />
  ];

  // Create props for BaseCard
  const baseCardProps: BaseCardProps = {
    id,
    title,
    summary,
    imageUrl,
    contentType: 'article',
    createdAt: formattedDate,
    location,
    category,
    tags,
    authorInfo: {
      name: author.name,
      stats: author.stats
    },
    proposerInfo: proposer ? {
      name: proposer.name
    } : undefined,
    contentHash,
    engagementMetrics: {
      reactions: metrics?.reactions,
      supporters: metrics?.supporters
    },
    distribution,
    badges,
    actionButtons,
    onClick,
    className
  };

  return <BaseCard {...baseCardProps} />;
};

export default ArticleCard;