// components/engagement/chainReactions/EmojiCounter.tsx
import React from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module

interface EmojiCounterProps {
  count: number;
  className?: string;
}

const EmojiCounter: React.FC<EmojiCounterProps> = ({
  count,
  className = '',
}) => {
  return (
    <div className={`${styles.emojiCounter} ${className}`}>
      {count} verified unique supporters
    </div>
  );
};

export default EmojiCounter;