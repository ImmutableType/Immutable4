// components/profile/modals/BookmarkDetailModal.tsx
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

interface BookmarkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: BookmarkedContent | null;
}

const BookmarkDetailModal: React.FC<BookmarkDetailModalProps> = ({
  isOpen,
  onClose,
  bookmark
}) => {
  if (!isOpen || !bookmark) return null;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = () => {
    return bookmark.contentType === 'article' 
      ? 'var(--color-typewriter-red)' 
      : 'var(--color-blockchain-blue)';
  };

  const getTypeIcon = () => {
    if (bookmark.contentType === 'article') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
    } else {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-black)',
            opacity: 0.7,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: getTypeColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: 'white',
            }}>
              {getTypeIcon()}
            </div>
            
            <div style={{
              backgroundColor: getTypeColor(),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-ui)',
              display: 'inline-block',
              marginBottom: '1rem',
            }}>
              BOOKMARKED {bookmark.contentType.toUpperCase()}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.8rem',
              margin: '0 0 1rem 0',
              color: 'var(--color-black)',
              lineHeight: '1.3',
            }}>
              {bookmark.title}
            </h2>
            
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--color-black)',
              opacity: 0.8,
              margin: 0,
              lineHeight: '1.5',
            }}>
              {bookmark.summary}
            </p>
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Author/Proposer */}
            <div>
              <label style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                color: 'var(--color-black)', 
                opacity: 0.7,
                fontFamily: 'var(--font-ui)',
              }}>
                {bookmark.contentType === 'article' ? 'Author' : 'Proposer'}
              </label>
              <div style={{ margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-parchment)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}>
                  {bookmark.author?.name?.charAt(0) || bookmark.proposer?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    {bookmark.author?.name || bookmark.proposer?.name || 'Unknown'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontFamily: 'monospace' }}>
                    {formatAddress(bookmark.author?.address || bookmark.proposer?.address || '0x0000...0000')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  color: 'var(--color-black)', 
                  opacity: 0.7,
                  fontFamily: 'var(--font-ui)',
                }}>
                  {bookmark.contentType === 'article' ? 'Published' : 'Created'}
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {formatDate(bookmark.createdAt)}
                </p>
              </div>
              
              <div>
                <label style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  color: 'var(--color-black)', 
                  opacity: 0.7,
                  fontFamily: 'var(--font-ui)',
                }}>
                  Bookmarked
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {formatDate(bookmark.bookmarkedAt)}
                </p>
              </div>
            </div>

            {/* Category and Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {bookmark.category && (
                <div>
                  <label style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold', 
                    color: 'var(--color-black)', 
                    opacity: 0.7,
                    fontFamily: 'var(--font-ui)',
                  }}>
                    Category
                  </label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                    {bookmark.category}
                  </p>
                </div>
              )}

              {bookmark.location && (
                <div>
                  <label style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold', 
                    color: 'var(--color-black)', 
                    opacity: 0.7,
                    fontFamily: 'var(--font-ui)',
                  }}>
                    Location
                  </label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                    📍 {bookmark.location.city}, {bookmark.location.state}
                  </p>
                </div>
              )}
            </div>

            {/* Metrics */}
            {bookmark.metrics && (
              <div>
                <label style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  color: 'var(--color-black)', 
                  opacity: 0.7,
                  fontFamily: 'var(--font-ui)',
                }}>
                  Engagement
                </label>
                <div style={{ 
                  margin: '0.5rem 0 0 0', 
                  display: 'flex', 
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.9rem',
                }}>
                  {bookmark.contentType === 'article' ? (
                    <>
                      {bookmark.metrics.views && <span>👁 {bookmark.metrics.views.toLocaleString()} views</span>}
                      {bookmark.metrics.comments && <span>💬 {bookmark.metrics.comments} comments</span>}
                      {bookmark.metrics.reactions && <span>⚡ {bookmark.metrics.reactions} reactions</span>}
                    </>
                  ) : (
                    <>
                      {bookmark.metrics.fundingAmount !== undefined && bookmark.metrics.fundingGoal && (
                        <span>💰 ${bookmark.metrics.fundingAmount.toLocaleString()} / ${bookmark.metrics.fundingGoal.toLocaleString()}</span>
                      )}
                      {bookmark.metrics.comments && <span>💬 {bookmark.metrics.comments} comments</span>}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div>
                <label style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  color: 'var(--color-black)', 
                  opacity: 0.7,
                  fontFamily: 'var(--font-ui)',
                }}>
                  Tags
                </label>
                <div style={{ margin: '0.5rem 0 0 0' }}>
                  {bookmark.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        backgroundColor: getTypeColor(),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        margin: '0.25rem 0.5rem 0.25rem 0',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-digital-silver)',
          }}>
            <button
              onClick={() => {
                // TODO: Navigate to full content
                console.log('Navigate to:', bookmark.contentType, bookmark.id);
              }}
              style={{
                backgroundColor: getTypeColor(),
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                transition: 'opacity 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              {bookmark.contentType === 'article' ? 'Read Article' : 'View Proposal'}
            </button>

            <button
              onClick={() => {
                // TODO: Remove bookmark functionality
                console.log('Remove bookmark:', bookmark.id);
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-typewriter-red)',
                border: '2px solid var(--color-typewriter-red)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-typewriter-red)';
              }}
            >
              Remove Bookmark
            </button>
          </div>

          {/* Blockchain Info */}
          <div style={{
            backgroundColor: 'var(--color-parchment)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginTop: '1.5rem',
          }}>
            <strong>🔗 Blockchain Verified</strong><br/>
            This bookmark is stored on-chain and represents your saved content on the ImmutableType platform. 
            Future encrypted article access will be enabled through your membership tokens.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetailModal;