// components/cards/base/BaseCard.tsx

import React from 'react';
import styles from './BaseCard.module.css';
import { BaseCardProps, ContentPaneProps, EngagementPaneProps } from '../../../lib/engagement/types/cardTypes';
import ContentPane from './ContentPane';
import EngagementPane from './EngagementPane';

const BaseCard: React.FC<BaseCardProps> = ({
  // Card core props
  id,
  title,
  summary,
  imageUrl,
  createdAt,
  location,
  category,
  tags,
  contentType,
  // Engagement props
  authorInfo,
  proposerInfo,
  contentHash,
  engagementMetrics,
  distribution,
  fundingInfo,
  votingInfo,
  // UI customization
  badges,
  actionButtons,
  className = '',
  onClick,
  // Voting handlers
  onUpvote,
  onDownvote,
  // Reaction handler
  onReaction,
  pendingReaction,
  // Custom rendering
  renderContent,
  renderEngagement,
  children,
}) => {
  // Create content pane props
  const contentPaneProps: ContentPaneProps = {
    id,
    title,
    summary,
    imageUrl,
    createdAt,
    location,
    category,
    tags,
    badges,
    actionButtons,
  };

  // Create engagement pane props
  const engagementPaneProps: EngagementPaneProps = {
    id,
    contentType,
    authorInfo,
    proposerInfo,
    contentHash,
    engagementMetrics,
    distribution,
    fundingInfo,
    votingInfo,
    onVoteUp: onUpvote,
    onVoteDown: onDownvote,
    onReaction,
    pendingReaction,
  };

  return (
    <div 
      className={`${styles.articleContainer} ${contentType ? styles[contentType + 'Card'] : ''} ${className}`}
    >
      {/* Content Pane (Left) - with onClick handler */}
      {renderContent ? (
        renderContent(contentPaneProps)
      ) : (
        <ContentPane {...contentPaneProps} onClick={onClick} />
      )}

      {/* Engagement Pane (Right) */}
      {renderEngagement ? (
        renderEngagement(engagementPaneProps)
      ) : (
        <EngagementPane {...engagementPaneProps} />
      )}
      
      {children}
    </div>
  );
};

export default BaseCard;