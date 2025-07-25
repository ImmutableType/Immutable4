// components/profile/ActivityFeed.tsx
import React from 'react';
import { ActivityItem, ActivityType } from '../../lib/profile/types/activity';

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading = false }) => {
  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to get action text based on activity type
  const getActionText = (activity: ActivityItem) => {
    // Use the action field directly, or fall back to type-based text
    if (activity.action) {
      return activity.action;
    }

    // Fallback based on type
    switch (activity.type) {
      case 'gm':
        return 'said Good Morning';
      case 'bookmark':
        return 'bookmarked content';
      case 'community-article':
        return 'published a community article';
      case 'portfolio-article':
        return 'published a portfolio article';
      case 'native-article':
        return 'published a native article';
      case 'license-purchase':
        return 'purchased an article license';
      case 'leaderboard':
        return 'updated the leaderboard';
      case 'emoji-purchase':
        return 'purchased EMOJI tokens';
      case 'tip-sent':
        return 'sent a tip';
      case 'tip-received':
        return 'received a tip';
      default:
        return 'performed an action';
    }
  };

  // Helper to safely render details
  const renderDetails = (activity: ActivityItem) => {
    if (!activity.details) return null;
    
    const { details } = activity;
    const parts: string[] = [];

    if (details.title) {
      parts.push(`"${details.title}"`);
    }
    
    if (details.amount) {
      const tipType = details.tipType || 'FLOW';
      parts.push(`${details.amount} ${tipType}`);
    }
    
    if (details.recipient) {
      parts.push(`to ${details.recipient}`);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  };

  // Helper to get icon based on activity type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'gm':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
          </svg>
        );
      case 'bookmark':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'community-article':
      case 'portfolio-article':
      case 'native-article':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
        );
      case 'license-purchase':
      case 'emoji-purchase':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        );
      case 'leaderboard':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"></path>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
          </svg>
        );
      case 'tip-sent':
      case 'tip-received':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        );
    }
  };

  // Helper to get color based on activity type
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'tip-sent':
      case 'tip-received':
      case 'emoji-purchase':
      case 'license-purchase':
        return 'var(--color-typewriter-red)';
      case 'gm':
      case 'leaderboard':
      case 'community-article':
      case 'portfolio-article':
      case 'native-article':
        return 'var(--color-verification-green)';
      case 'bookmark':
        return 'var(--color-blockchain-blue)';
      default:
        return 'var(--color-black)';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Loading activities...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        No activities to display.
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '0.5rem',
    }}>
      {activities.map((activity) => (
        <div key={activity.id} style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '4px',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-digital-silver)',
        }}>
          {/* Icon */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-parchment)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getActivityColor(activity.type),
            flexShrink: 0,
          }}>
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}>
              <span style={{ fontWeight: 'bold' }}>{getActionText(activity)}</span>
              <span style={{ 
                color: 'var(--color-black)', 
                opacity: 0.7,
                marginLeft: '0.5rem',
              }}>
                {formatDate(activity.timestamp)}
              </span>
            </div>

            {/* Details */}
            {renderDetails(activity) && (
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-black)',
                opacity: 0.8,
                marginBottom: '0.5rem',
              }}>
                {renderDetails(activity)}
              </div>
            )}

            {/* Blockchain Info */}
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              color: 'var(--color-black)',
              opacity: 0.6,
            }}>
              Block #{activity.blockNumber} • {activity.txHash.slice(0, 10)}...
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;