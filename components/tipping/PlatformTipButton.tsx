// components/tipping/PlatformTipButton.tsx
'use client';

import React, { useState } from 'react';
import { TipModal } from './TipModal';
import { TipResult } from './TipResult';

interface PlatformTipButtonProps {
  variant?: 'primary' | 'secondary' | 'small';
  className?: string;
}

export const PlatformTipButton: React.FC<PlatformTipButtonProps> = ({
  variant = 'primary',
  className = ''
}) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [tipResult, setTipResult] = useState<any>(null);

  const handleTipSuccess = (result: any) => {
    setTipResult(result);
    setShowResult(true);
    setShowTipModal(false);
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-[var(--color-typewriter-red)] hover:bg-[#8C1A17] text-[var(--color-white)] px-4 py-2 font-[var(--font-ui)]',
    secondary: 'bg-[var(--color-digital-silver)] hover:bg-[#C0C0C0] text-[var(--color-black)] px-3 py-1.5 text-sm font-[var(--font-ui)]',
    small: 'bg-[var(--color-blockchain-blue)] hover:bg-[#1E2B6B] text-[var(--color-white)] px-2 py-1 text-xs font-[var(--font-ui)]'
  };

  return (
    <>
      <button
        onClick={() => setShowTipModal(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={{
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        {/* Heart icon for platform support */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          style={{ marginRight: '8px' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: '500' }}>
          {variant === 'small' ? 'Donate' : 'Support Platform'}
        </span>
      </button>

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        isPlatformTip={true}
        onSuccess={handleTipSuccess}
      />

      <TipResult
        isVisible={showResult}
        isSuccess={tipResult?.success || false}
        tipAmount={tipResult?.tipAmount}
        currency={tipResult?.currency}
        recipientName="ImmutableType Platform"
        emojiRewards={tipResult?.emojiRewards}
        error={tipResult?.error}
        onClose={() => setShowResult(false)}
      />
    </>
  );
};