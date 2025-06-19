// components/profile/ActivityFeed.tsx
import React from 'react';
import Link from 'next/link';
import { ActivityItem } from '../../lib/profile/types/activity';

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
    });
  };

  // Helper to get action text based on activity type
  const getActionText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'read':
        return 'read an article';
      case 'create':
        return `created a ${activity.contentType}`;
      case 'fund':
        return `funded a ${activity.contentType}`;
      case 'vote':
        return `voted on a ${activity.contentType}`;
      case 'tip':
        return `tipped an author`;
      case 'comment':
        return `commented on a ${activity.contentType}`;
      default:
        return `interacted with a ${activity.contentType}`;
    }
  };

  // Helper to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'read':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        );
      case 'create':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
        );
      case 'fund':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        );
      case 'vote':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'tip':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'comment':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      default:
        return null;
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
            color: activity.type === 'fund' || activity.type === 'tip' 
              ? 'var(--color-typewriter-red)' 
              : activity.type === 'vote' || activity.type === 'create'
                ? 'var(--color-verification-green)'
                : 'var(--color-black)',
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

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              marginBottom: '0.5rem',
            }}>
              <Link
                href={`/${activity.contentType === 'article' ? 'reader' : 'news-proposals'}/${activity.contentId}`}
                style={{
                  color: 'var(--color-black)',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                {activity.contentTitle}
              </Link>
            </div>

            {activity.amount && (
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem',
                color: 'var(--color-typewriter-red)',
              }}>
                Amount: {activity.amount} FLOW
              </div>
            )}

            {activity.details && (
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-black)',
                opacity: 0.8,
                marginTop: '0.5rem',
              }}>
                {activity.details}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;