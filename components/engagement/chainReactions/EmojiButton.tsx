// components/engagement/chainReactions/EmojiButton.tsx
"use client";

import React, { useState, useRef } from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { ReactionType } from '../../../lib/engagement/types/reactionTypes';

interface EmojiButtonProps {
  emoji: ReactionType;
  count: number;
  isActive?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({
  emoji,
  count,
  isActive = false,
  onClick,
  onLongPress,
  className = '',
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDelay = 500; // ms

  // Handle mouse events
  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, longPressDelay);
  };

  const handleMouseUp = () => {
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

  // Create animation effect when button is clicked
  const createEmojiAnimation = () => {
    // This would be implemented with actual animation in a real component
    console.log(`Animating ${emoji}`);
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
      onClick={(e) => e.preventDefault()} // Prevent default to avoid double firing
    >
      <span>{emoji}</span> {count}
      <div className={styles.powerUp}>+100</div>
    </button>
  );
};

export default EmojiButton;