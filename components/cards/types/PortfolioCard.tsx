// components/cards/types/PortfolioCard.tsx
import React from 'react';
import { BaseCardProps } from '../../../lib/engagement/types/cardTypes';
import BaseCard from '../base/BaseCard';

// Define the subset of props needed for PortfolioCard
export interface PortfolioCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  author: {
    name: string;
    id: string;
    stats?: {
      articlesPublished?: number;
      credibility?: number;
      location?: string;
    };
  };
  originalUrl: string;
  publicationName: string;
  originalAuthor?: string;
  originalPublishDate: string;
  createdAt: string;
  verifiedAt: string;
  location?: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  category?: string;
  tags?: string[];
  portfolioType: 'verification' | 'showcase';
  metrics?: {
    reactions?: Record<string, number>;
    supporters?: number;
  };
  distribution?: {
    author?: number;
    platform?: number;
    total?: number;
  };
  contentHash?: string;
  onClick?: () => void;
  className?: string;
}

// Create PortfolioBadge component with professional red styling
const PortfolioBadge: React.FC<{publicationName: string}> = ({publicationName}) => (
  <span className="badge" style={{backgroundColor: 'var(--color-typewriter-red)', color: 'white'}}>
    Portfolio Verified • {publicationName}
  </span>
);

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
  author,
  originalUrl,
  publicationName,
  originalAuthor,
  originalPublishDate,
  createdAt,
  verifiedAt,
  location,
  category,
  tags = [],
  portfolioType,
  metrics,
  distribution,
  contentHash,
  onClick,
  className,
}) => {
  // Format dates for display
  const formattedVerifiedDate = `Verified: ${new Date(verifiedAt || createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;

  const formattedOriginalDate = new Date(originalPublishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Prepare badges
  const badges = [
    <PortfolioBadge key="portfolio" publicationName={publicationName} />
  ];

  // No action buttons for portfolio cards per contract constraints
  const actionButtons: React.ReactNode[] = [];

  // Create enhanced summary with original publication info
  const enhancedSummary = originalAuthor 
    ? `${summary}\n\nOriginally by ${originalAuthor} • Published ${formattedOriginalDate}`
    : `${summary}\n\nPublished ${formattedOriginalDate}`;

  // Create props for BaseCard
  const baseCardProps: BaseCardProps = {
    id,
    title,
    summary: enhancedSummary,
    imageUrl,
    contentType: 'portfolio',
    createdAt: formattedVerifiedDate,
    location,
    category,
    tags,
    authorInfo: {
      name: author.name,
      stats: {
        articlesPublished: author.stats?.articlesPublished
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
    className: `${className || ''} portfolio-card`
  };

  return <BaseCard {...baseCardProps} />;
};

export default PortfolioCard;