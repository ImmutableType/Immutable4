// components/tipping/TipButton.tsx
'use client';

import React from 'react';

interface TipButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'small';
  disabled?: boolean;
  className?: string;
  profileName?: string;
}

export const TipButton: React.FC<TipButtonProps> = ({
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  profileName
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
      {/* Coffee cup icon - universal tipping symbol */}
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        style={{ marginRight: '8px' }}
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: '500' }}>
        {variant === 'small' 
          ? 'Tip' 
          : profileName 
            ? `Support ${profileName}` 
            : 'Support'
        }
      </span>
    </button>
  );
};