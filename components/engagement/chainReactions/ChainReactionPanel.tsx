// components/engagement/chainReactions/ChainReactionPanel.tsx
"use client";

import React from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { ReactionType } from '../../../lib/engagement/types/reactionTypes';
import EmojiButton from './EmojiButton';
import EmojiCounter from './EmojiCounter';

interface ChainReactionPanelProps {
  reactions: Record<string, number>;
  supporters?: number;
  onReaction?: (type: ReactionType, isPowerUp?: boolean) => void;
  className?: string;
}

const DEFAULT_EMOJIS: ReactionType[] = ['👍', '👏', '🔥', '🤔'];

const ChainReactionPanel: React.FC<ChainReactionPanelProps> = ({
  reactions = {},
  supporters = 0,
  onReaction,
  className = '',
}) => {
  return (
    <div className={`${styles.chainReactionPanel} ${className}`}>
      <h3 className={styles.sectionTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.59 1.44l.94-1.32a1 1 0 0 1 1.65 0l.94 1.32a1 1 0 0 0 .9.56h1.38a1 1 0 0 1 .9 1.47l-.5 1.03a1 1 0 0 0 .12 1.04l.91 1.15a1 1 0 0 1-.35 1.56l-1.07.7a1 1 0 0 0-.5.84v1.34a1 1 0 0 1-1.09 1.14l-1.22-.12a1 1 0 0 0-.89.37l-.91 1.01a1 1 0 0 1-1.56.04l-.75-1.13a1 1 0 0 0-.92-.42l-1.35.09a1 1 0 0 1-1.15-1.08l.03-1.32a1 1 0 0 0-.5-.84l-1.1-.67a1 1 0 0 1-.34-1.57l.93-1.14a1 1 0 0 0 .13-1.04l-.52-1.03a1 1 0 0 1 .87-1.47h1.44a1 1 0 0 0 .9-.56l.94-1.32z"/>
        </svg>
        Chain Reactions
      </h3>
      <div className={styles.emojiReactions}>
        {DEFAULT_EMOJIS.map((emoji) => (
          <EmojiButton 
            key={emoji}
            emoji={emoji}
            count={reactions[emoji] || 0}
            onClick={() => onReaction?.(emoji, false)}
            onLongPress={() => onReaction?.(emoji, true)}
          />
        ))}
      </div>
      <EmojiCounter count={supporters} />
    </div>
  );
};

export default ChainReactionPanel;