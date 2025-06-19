// components/cards/common/ActionIcons.tsx
import React from 'react';

export interface ActionIconProps {
  tooltip?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}

export const ActionIcon: React.FC<ActionIconProps> = ({ 
  tooltip, 
  onClick, 
  className = '',
  children 
}) => {
  return (
    <div 
      className={`action-icon ${className} ${tooltip ? 'tooltip' : ''}`} 
      data-tooltip={tooltip}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {children}
    </div>
  );
};

export interface BookmarkButtonProps {
  isBookmarked?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  isBookmarked = false, 
  onClick,
  className = ''
}) => {
  return (
    <ActionIcon 
      tooltip="Bookmark (Free for subscribers)"
      onClick={onClick}
      className={`bookmark-icon ${className} ${isBookmarked ? 'active' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d={isBookmarked 
          ? "M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"
          : "M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"
        }/>
      </svg>
    </ActionIcon>
  );
};

export interface ShareButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ onClick, className = '' }) => {
  return (
    <ActionIcon 
      tooltip="Copy Link"
      onClick={onClick}
      className={`link-icon ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
      </svg>
    </ActionIcon>
  );
};

export default {
  ActionIcon,
  BookmarkButton,
  ShareButton
};