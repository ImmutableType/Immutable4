// components/cards/base/EngagementPane.tsx
"use client";

import React from 'react';
import styles from './EngagementPane.module.css';
import { EngagementPaneProps } from '../../../lib/engagement/types/cardTypes';
import ChainReactionPanel from '../../engagement/chainReactions/ChainReactionPanel';
import EmojiEarnings from '../../engagement/revenueDist/EmojiEarnings';
import CommunityVoting from '../../engagement/communityVoting/CommunityVoting';

const EngagementPane: React.FC<EngagementPaneProps> = ({
  id,
  contentType,
  authorInfo,
  proposerInfo,
  contentHash,
  engagementMetrics,
  distribution,
  fundingInfo,
  votingInfo,
  onVoteUp,
  onVoteDown,
  onReaction,
  className = '',
  children,
}) => {
  // Style class based on content type
  const typeClass = contentType ? `${contentType}-engagement` : '';

  return (
    <div className={`${styles.engagementPane} ${typeClass} ${className}`}>
      {/* Community Voting - REMOVED for non-proposal content */}
      {/* Voting will only be implemented for proposals in future */}
      
      {/* Chain Reactions */}
      {engagementMetrics && (
        <ChainReactionPanel
          reactions={engagementMetrics.reactions || {}}
          supporters={engagementMetrics.supporters}
          onReaction={(type, isPowerUp) => onReaction?.(id, type, isPowerUp || false)}
        />
      )}
      
      {/* Funding Progress (only for proposals) */}
      {contentType === 'proposal' && fundingInfo && (
        <div className={styles.fundingStatus}>
          <h3 className={styles.sectionTitle}>Funding Status</h3>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${Math.min(100, fundingInfo.percentage || 0)}%` }}
            ></div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '13px', 
            fontFamily: 'var(--font-ui)' 
          }}>
            <span>{fundingInfo.raised} CR raised</span>
            <span>{fundingInfo.goal} CR goal</span>
          </div>
        </div>
      )}
      
      {/* Emoji Earnings */}
      {distribution && (
        <EmojiEarnings
          contentType={contentType}
          distribution={distribution}
        />
      )}
      
      {/* Attribution section */}
      {(authorInfo || proposerInfo || contentHash) && (
        <div className={styles.attribution}>
          {authorInfo && (
            <div className={styles.attributionItem}>
              <span className={styles.attributionLabel}>Author:</span>
              <span className={styles.attributionValue}>{authorInfo.name}</span>
            </div>
          )}
          
          {authorInfo?.stats && (
            <div className={styles.authorStats}>
              {authorInfo.stats.written !== undefined && (
                <div className={styles.statItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                  </svg>
                  {authorInfo.stats.written} Written
                </div>
              )}
              
              {authorInfo.stats.proposed !== undefined && (
                <div className={styles.statItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2zM3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
                    <path d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.945 11.945 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0z"/>
                  </svg>
                  {authorInfo.stats.proposed} Proposed
                </div>
              )}
              
              {authorInfo.stats.curated !== undefined && (
                <div className={styles.statItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 1 .597-.933A7.01 7.01 0 0 0 3.051 3.05c.362.184.763.349 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 0 1-1.565-.667A6.964 6.964 0 0 0 1.018 7.5h2.49zm1.4-2.741a12.344 12.344 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332zM8.5 5.09V7.5h2.99a12.342 12.342 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.612 13.612 0 0 1 7.5 10.91V8.5H4.51zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741H8.5zm-3.282 3.696c.12.312.252.604.395.872.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a6.696 6.696 0 0 1-.598-.933 8.853 8.853 0 0 1-.481-1.079 8.38 8.38 0 0 0-1.198.49 7.01 7.01 0 0 0 2.276 1.522zm-1.383-2.964A13.36 13.36 0 0 1 3.508 8.5h-2.49a6.963 6.963 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667zm6.728 2.964a7.009 7.009 0 0 0 2.275-1.521 8.376 8.376 0 0 0-1.197-.49 8.853 8.853 0 0 1-.481 1.078 6.688 6.688 0 0 1-.597.933zM8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.963 6.963 0 0 0 14.982 8.5h-2.49a13.36 13.36 0 0 1-.437 3.008zM14.982 7.5a6.963 6.963 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008h2.49zM11.27 2.461c.177.334.339.694.482 1.078a8.368 8.368 0 0 0 1.196-.49 7.01 7.01 0 0 0-2.275-1.52c.218.283.418.597.597.932zm-.488 1.343a7.765 7.765 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"/>
                  </svg>
                  {authorInfo.stats.curated} Curated
                </div>
              )}
              
              {authorInfo.stats.location && (
                <div className={styles.statItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  {authorInfo.stats.location}
                </div>
              )}
            </div>
          )}
          
          {proposerInfo && (
            <div className={styles.attributionItem}>
              <span className={styles.attributionLabel}>Proposed by:</span>
              <span className={styles.attributionValue}>{proposerInfo.name}</span>
            </div>
          )}
          
          {contentType === 'community' && authorInfo && (
            <div className={styles.attributionItem}>
              <span className={styles.attributionLabel}>Source:</span>
              <span className={styles.attributionValue}>{authorInfo.name}</span>
            </div>
          )}
          
          {contentHash && (
            <div className={styles.attributionItem}>
              <span className={styles.attributionLabel}>Content hash:</span>
              <span className={styles.attributionValue}>{contentHash}</span>
            </div>
          )}
          
          {/* CTA Button based on content type - REMOVED "Reload My Emojis" */}
          {contentType === 'proposal' && (
            <button className={styles.ctaButton}>Fund This Proposal</button>
          )}
          
          {contentType === 'community' && (
            <button className={styles.ctaButton}>Visit Original Article</button>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default EngagementPane;