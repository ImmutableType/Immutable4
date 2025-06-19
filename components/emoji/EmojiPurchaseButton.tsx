// components/emoji/EmojiPurchaseButton.tsx
'use client';

import React from 'react';

interface EmojiPurchaseButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'small';
  disabled?: boolean;
  className?: string;
}

export const EmojiPurchaseButton: React.FC<EmojiPurchaseButtonProps> = ({
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-[var(--color-typewriter-red)] hover:bg-[#8C1A17] text-[var(--color-white)] px-4 py-2 font-[var(--font-ui)]',
    secondary: 'bg-[var(--color-digital-silver)] hover:bg-[#C0C0C0] text-[var(--color-black)] px-3 py-1.5 text-sm font-[var(--font-ui)]',
    small: 'bg-[var(--color-blockchain-blue)] hover:bg-[#1E2B6B] text-[var(--color-white)] px-2 py-1 text-xs font-[var(--font-ui)]'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      style={{
        boxShadow: disabled ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: disabled ? 'none' : 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <span style={{ marginRight: '8px', fontSize: '16px' }}>🎉</span>
      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: '500' }}>
        {variant === 'small' ? 'Get EMOJIs' : 'Reload EMOJIs'}
      </span>
    </button>
  );
};