// components/engagement/communityVoting/VoteButtons.tsx
"use client";

import React from 'react';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVoteUp?: () => void;
  onVoteDown?: () => void;
  className?: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  upvotes,
  downvotes,
  userVote,
  onVoteUp,
  onVoteDown,
  className = '',
}) => {
  return (
    <div className={`vote-buttons ${className}`}>
      <button 
        className={`vote-button upvote ${userVote === 'up' ? 'active' : ''}`}
        onClick={onVoteUp}
      >
        <span>⬆️</span> Upvote ({upvotes})
      </button>
      <button 
        className={`vote-button downvote ${userVote === 'down' ? 'active' : ''}`}
        onClick={onVoteDown}
      >
        <span>⬇️</span> Downvote ({downvotes})
      </button>
    </div>
  );
};

export default VoteButtons;