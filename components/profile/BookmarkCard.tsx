// components/profile/BookmarkCard.tsx
'use client'

import React from 'react';

interface BookmarkedContent {
  id: string;
  title: string;
  summary: string;
  contentType: 'article' | 'proposal';
  author?: {
    name: string;
    address: string;
  };
  proposer?: {
    name: string;
    address: string;
  };
  createdAt: string;
  bookmarkedAt: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  location?: {
    city: string;
    state: string;
  };
  metrics?: {
    views?: number;
    comments?: number;
    reactions?: number;
    fundingAmount?: number;
    fundingGoal?: number;
  };
}

interface BookmarkCardProps {
  bookmark: BookmarkedContent;
  onClick: () => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onClick }) => {
  
  const getCardColor = () => {
    return bookmark.contentType === 'article' 
      ? 'var(--color-typewriter-red)' 
      : 'var(--color-blockchain-blue)';
  };
  
  const getTypeIcon = () => {
    if (bookmark.contentType === 'article') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAuthor = () => {
    if (bookmark.contentType === 'article' && bookmark.author) {
      return bookmark.author.name;
    } else if (bookmark.contentType === 'proposal' && bookmark.proposer) {
      return bookmark.proposer.name;
    }
    return 'Unknown';
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-white)',
        border: `2px solid ${getCardColor()}`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: '240px',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.15)`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header with type icon and bookmark date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{
          color: getCardColor(),
          opacity: 0.8,
        }}>
          {getTypeIcon()}
        </div>
        
        <div style={{
          backgroundColor: getCardColor(),
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-ui)',
        }}>
          {bookmark.contentType.toUpperCase()}
        </div>
      </div>

      {/* Image placeholder or category icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60px',
      }}>
        {bookmark.imageUrl ? (
          <img 
            src={bookmark.imageUrl}
            alt={bookmark.title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '60px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: `${getCardColor()}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getCardColor(),
          }}>
            {getTypeIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.1rem',
          margin: '0 0 0.5rem 0',
          color: 'var(--color-black)',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {bookmark.title}
        </h3>
        
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--color-black)',
          opacity: 0.7,
          margin: '0 0 1rem 0',
          fontFamily: 'var(--font-ui)',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {bookmark.summary}
        </p>

        {/* Author and date */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--color-black)',
          opacity: 0.6,
          marginBottom: '0.75rem',
          fontFamily: 'var(--font-ui)',
        }}>
          By {formatAuthor()} • {formatDate(bookmark.createdAt)}
        </div>

        {/* Metrics */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          fontSize: '0.75rem',
          color: 'var(--color-black)',
          opacity: 0.7,
          fontFamily: 'var(--font-ui)',
        }}>
          {bookmark.contentType === 'article' ? (
            <>
              {bookmark.metrics?.views && <span>👁 {bookmark.metrics.views}</span>}
              {bookmark.metrics?.comments && <span>💬 {bookmark.metrics.comments}</span>}
              {bookmark.metrics?.reactions && <span>⚡ {bookmark.metrics.reactions}</span>}
            </>
          ) : (
            <>
              {bookmark.metrics?.fundingAmount !== undefined && bookmark.metrics?.fundingGoal && (
                <span>💰 ${bookmark.metrics.fundingAmount}/${bookmark.metrics.fundingGoal}</span>
              )}
              {bookmark.metrics?.comments && <span>💬 {bookmark.metrics.comments}</span>}
            </>
          )}
        </div>
      </div>

      {/* Category and Location */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--color-digital-silver)',
      }}>
        {bookmark.category && (
          <span style={{
            backgroundColor: 'var(--color-parchment)',
            color: 'var(--color-black)',
            padding: '0.25rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-ui)',
          }}>
            {bookmark.category}
          </span>
        )}
        
        {bookmark.location && (
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--color-black)',
            opacity: 0.6,
            fontFamily: 'var(--font-ui)',
          }}>
            📍 {bookmark.location.city}, {bookmark.location.state}
          </span>
        )}
      </div>

      {/* Bookmarked indicator */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'var(--color-verification-green)',
        color: 'white',
        padding: '0.25rem',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
      }}>
        🔖
      </div>
    </div>
  );
};

export default BookmarkCard;