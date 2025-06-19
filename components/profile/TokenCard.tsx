// components/profile/TokenCard.tsx
'use client'

import React from 'react';

export interface TokenCardProps {
  title: string;
  subtitle: string;
  image?: string;
  tokenId?: string;
  description?: string;
  onClick: () => void;
  type: 'membership' | 'publisher' | 'profile' | 'emoji' | 'article';
  isPlaceholder?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({
  title,
  subtitle,
  image,
  tokenId,
  description,
  onClick,
  type,
  isPlaceholder = false
}) => {
  
  const getCardColor = () => {
    switch (type) {
      case 'membership': return '#FFD700'; // Gold
      case 'publisher': return '#2B3990'; // Blockchain Blue
      case 'profile': return '#1D7F6E'; // Verification Green
      case 'emoji': return '#E8A317'; // Alert Amber
      case 'article': return '#B3211E'; // Typewriter Red
      default: return '#D9D9D9'; // Digital Silver
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'membership':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'publisher':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        );
      case 'profile':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'emoji':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
      case 'article':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          </svg>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-white)',
        border: `2px solid ${getCardColor()}`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: isPlaceholder ? 'default' : 'pointer',
        opacity: isPlaceholder ? 0.6 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={(e) => {
        if (!isPlaceholder) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.15)`;
          e.currentTarget.style.borderColor = getCardColor();
        }
      }}
      onMouseOut={(e) => {
        if (!isPlaceholder) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header with icon and token ID */}
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
        
        {tokenId && (
          <div style={{
            backgroundColor: getCardColor(),
            color: type === 'membership' ? '#000' : '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-ui)',
          }}>
            {tokenId}
          </div>
        )}
      </div>

      {/* Image or placeholder */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
      }}>
        {image ? (
          <img 
            src={image}
            alt={title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div style={{
            width: '60px',
            height: '60px',
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
      <div style={{
        textAlign: 'center',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.1rem',
          margin: '0 0 0.5rem 0',
          color: 'var(--color-black)',
        }}>
          {title}
        </h3>
        
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-black)',
          opacity: 0.7,
          margin: '0 0 0.5rem 0',
          fontFamily: 'var(--font-ui)',
        }}>
          {subtitle}
        </p>
        
        {description && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-black)',
            opacity: 0.6,
            margin: 0,
            fontFamily: 'var(--font-ui)',
            lineHeight: '1.3',
          }}>
            {description}
          </p>
        )}
      </div>

      {/* Placeholder overlay */}
      {isPlaceholder && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'var(--color-alert-amber)',
          color: 'var(--color-white)',
          padding: '0.25rem 0.5rem',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-ui)',
        }}>
          COMING SOON
        </div>
      )}
    </div>
  );
};

export default TokenCard;