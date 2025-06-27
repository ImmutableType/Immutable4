// components/cards/types/ActivityCard.tsx
'use client'

import React from 'react';
import { ActivityItem } from '@/lib/profile/services/activityService';

interface ActivityCardProps {
  activity: ActivityItem;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'gm':
        return '☀️';
      case 'bookmark':
        return '🔖';
      case 'community-article':
      case 'portfolio-article':
      case 'native-article':
        return '📝';
      case 'license-purchase':
        return '🎫';
      case 'leaderboard':
        return '🏆';
      case 'emoji-purchase':
        return '💰';
      case 'tip-sent':
        return '💸';
      case 'tip-received':
        return '💝';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'gm':
        return '#FFA500';
      case 'bookmark':
        return '#2B3990';
      case 'community-article':
        return '#1D7F6E';
      case 'portfolio-article':
        return '#B3211E';
      case 'native-article':
        return '#8C1A17';
      case 'license-purchase':
        return '#6c757d';
      case 'leaderboard':
        return '#FFD700';
      case 'emoji-purchase':
        return '#e74c3c';
      case 'tip-sent':
      case 'tip-received':
        return '#E8A317';
      default:
        return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-white)',
        border: `1px solid ${getActivityColor(activity.type)}20`,
        borderLeft: `4px solid ${getActivityColor(activity.type)}`,
        borderRadius: '8px',
        padding: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
      onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${getActivityColor(activity.type)}20`;
        }
      }}
      onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: `${getActivityColor(activity.type)}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
      }}>
        {getActivityIcon(activity.type)}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.25rem',
        }}>
          <h4 style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.95rem',
            fontWeight: '600',
            margin: 0,
            color: 'var(--color-black)',
          }}>
            {activity.action}
          </h4>
          
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--color-black)',
            opacity: 0.6,
            fontFamily: 'var(--font-ui)',
          }}>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        {activity.details && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--color-black)',
            opacity: 0.8,
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-body)',
          }}>
            {activity.details.title && (
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>"{String(activity.details.title)}"</strong>
              </div>
            )}
            {activity.details.amount && (
              <div style={{ color: getActivityColor(activity.type) }}>
                {activity.details.amount}
              </div>
            )}
          </div>
        )}

        
          <a href={`https://evm-testnet.flowscan.org/tx/${activity.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: getActivityColor(activity.type),
            textDecoration: 'none',
            fontFamily: 'monospace',
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {activity.txHash.slice(0, 10)}...
        </a>
      </div>
    </div>
  );
};

export default ActivityCard;