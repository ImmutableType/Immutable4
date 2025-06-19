// components/engagement/communityVoting/CommunityVoting.tsx
import React from 'react';
import styles from './CommunityVoting.module.css';

interface CommunityVotingProps {
  upvotes: number;
  downvotes: number;
  percentage: number;
  onVoteUp?: () => void;
  onVoteDown?: () => void;
}

const CommunityVoting: React.FC<CommunityVotingProps> = ({
  upvotes,
  downvotes,
  percentage,
  onVoteUp,
  onVoteDown
}) => {
  // Determine score class based on percentage
  const getScoreClass = () => {
    if (percentage >= 85) return styles.highScore;
    if (percentage >= 60) return styles.mediumScore;
    return styles.lowScore;
  };

  return (
    <div className={styles.votingContainer}>
      <h3 className={styles.sectionTitle}>COMMUNITY VOTES</h3>
      
      <div className={styles.votingButtons}>
        <button 
          className={`${styles.voteButton} ${styles.upvote}`} 
          onClick={onVoteUp}
          aria-label="Upvote"
        >
          <span className={styles.voteIcon}>👍</span>
          <span>Upvote ({upvotes})</span>
        </button>
        
        <button 
          className={`${styles.voteButton} ${styles.downvote}`} 
          onClick={onVoteDown}
          aria-label="Downvote"
        >
          <span className={styles.voteIcon}>👎</span>
          <span>Downvote ({downvotes})</span>
        </button>
      </div>
      
      <div className={`${styles.votePercentage} ${getScoreClass()}`}>
        {percentage}% positive community rating
      </div>
    </div>
  );
};

export default CommunityVoting;