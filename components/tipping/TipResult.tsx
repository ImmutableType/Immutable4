// components/tipping/TipResult.tsx
'use client';

import React, { useEffect } from 'react';

interface TipResultProps {
  isVisible: boolean;
  isSuccess: boolean;
  tipAmount?: number;
  currency?: 'FLOW' | 'EMOJI';
  recipientName?: string;
  emojiRewards?: number;
  error?: string;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const TipResult: React.FC<TipResultProps> = ({
  isVisible,
  isSuccess,
  tipAmount,
  currency,
  recipientName,
  emojiRewards,
  error,
  onClose,
  autoCloseDelay = 5000
}) => {
  useEffect(() => {
    if (isVisible && isSuccess && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isSuccess, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        rounded-lg p-4 shadow-lg border-l-4 transition-all duration-300 transform
        ${isSuccess 
          ? 'bg-green-50 border-green-400' 
          : 'bg-red-50 border-red-400'
        }
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isSuccess ? (
              <div className="text-green-400 text-xl">✅</div>
            ) : (
              <div className="text-red-400 text-xl">❌</div>
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <div className={`text-sm font-medium ${
              isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {isSuccess ? 'Tip Sent!' : 'Tip Failed'}
            </div>
            
            <div className={`mt-1 text-sm ${
              isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {isSuccess ? (
                <div>
                  {tipAmount?.toLocaleString()} {currency} 
                  {recipientName && ` to ${recipientName}`}
                  {emojiRewards && (
                    <div className="text-xs mt-1">
                      +{emojiRewards.toLocaleString()} EMOJI earned!
                    </div>
                  )}
                </div>
              ) : (
                error || 'Transaction failed. Please try again.'
              )}
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex text-sm font-medium ${
                isSuccess 
                  ? 'text-green-400 hover:text-green-500' 
                  : 'text-red-400 hover:text-red-500'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};