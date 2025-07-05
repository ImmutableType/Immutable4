// components/engagement/chainReactions/EmojiButton.tsx
"use client";

import React, { useState, useRef } from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { ReactionType } from '../../../lib/engagement/types/reactionTypes';

interface EmojiButtonProps {
  emoji: ReactionType;
  count: number;
  isActive?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({
  emoji,
  count,
  isActive = false,
  isPending = false,
  onClick,
  onLongPress,
  className = '',
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDelay = 500; // ms

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Stop event from bubbling up
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, longPressDelay);
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Stop event from bubbling up
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (isLongPress) {
      // Handle power-up
      onLongPress?.();
      setIsLongPress(false);
    } else {
      // Handle normal click
      onClick?.();
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };

  return (
    <button 
      className={`${styles.emojiButton} ${isActive ? styles.active : ''} ${isLongPress ? styles.longPress : ''} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseLeave}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Also stop propagation on click
      }}
      style={{
        animation: isPending ? 'pulse 1s ease-in-out infinite' : undefined,
        boxShadow: isPending ? '0 0 10px rgba(255, 215, 0, 0.5)' : undefined,
      }}
    >
      <span>{emoji}</span> {count}
      <div className={styles.powerUp}>+100</div>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  );
};

export default EmojiButton;