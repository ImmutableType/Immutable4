// components/emoji/EmojiAmountSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface PresetAmount {
  emoji: number;
  flow: string;
}

interface EmojiAmountSelectorProps {
  presetAmounts: PresetAmount[];
  onAmountChange: (emojiAmount: number) => void;
  maxAmount?: number;
  disabled?: boolean;
}

export const EmojiAmountSelector: React.FC<EmojiAmountSelectorProps> = ({
  presetAmounts,
  onAmountChange,
  maxAmount,
  disabled = false
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue) && numericValue > 0) {
      setSelectedAmount(numericValue);
      setIsCustom(true);
      onAmountChange(numericValue);
    } else {
      setSelectedAmount(0);
      onAmountChange(0);
    }
  };

  const calculateFlowCost = (emojiAmount: number): string => {
    const cost = emojiAmount * 0.01;
    return cost < 1 ? "< 1" : cost.toFixed(0);
  };

  const isAmountExceedsMax = (amount: number): boolean => {
    return maxAmount ? amount > maxAmount : false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Preset Amounts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--color-black)',
          fontFamily: 'var(--font-ui)',
          margin: '0'
        }}>
          Choose Amount:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {presetAmounts.map(({ emoji, flow }) => {
            const isSelected = !isCustom && selectedAmount === emoji;
            const exceedsMax = isAmountExceedsMax(emoji);
            
            return (
              <button
                key={emoji}
                onClick={() => handlePresetClick(emoji)}
                disabled={disabled || exceedsMax}
                style={{
                  width: '100%',
                  padding: '16px',
                  textAlign: 'left',
                  border: isSelected 
                    ? '2px solid var(--color-typewriter-red)' 
                    : '1px solid var(--color-digital-silver)',
                  borderRadius: '6px',
                  backgroundColor: isSelected 
                    ? 'rgba(179, 33, 30, 0.05)' 
                    : 'var(--color-white)',
                  cursor: (disabled || exceedsMax) ? 'not-allowed' : 'pointer',
                  opacity: (disabled || exceedsMax) ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-ui)'
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !exceedsMax && !isSelected) {
                    e.currentTarget.style.borderColor = '#999';
                    e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !exceedsMax && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-digital-silver)';
                    e.currentTarget.style.backgroundColor = 'var(--color-white)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontWeight: '500',
                    color: isSelected ? 'var(--color-typewriter-red)' : 'var(--color-black)',
                    fontFamily: 'var(--font-body)'
                  }}>
                    {emoji.toLocaleString()} EMOJI
                  </span>
                  <span style={{
                    color: '#666',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px'
                  }}>
                    {flow} FLOW
                  </span>
                </div>
                {exceedsMax && (
                  <div style={{
                    fontSize: '12px',
                    color: '#B91C1C',
                    marginTop: '4px',
                    fontFamily: 'var(--font-ui)'
                  }}>
                    Exceeds maximum purchase limit
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--color-black)',
          fontFamily: 'var(--font-ui)',
          margin: '0'
        }}>
          Custom Amount:
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Enter EMOJI amount"
            disabled={disabled}
            min="1"
            max={maxAmount}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'var(--font-ui)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-blockchain-blue)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(43, 57, 144, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-digital-silver)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <span style={{
            color: '#666',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px'
          }}>
            EMOJI
          </span>
        </div>
        
        {isCustom && selectedAmount > 0 && (
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: 'var(--font-body)'
          }}>
            Cost: {calculateFlowCost(selectedAmount)} FLOW
            {isAmountExceedsMax(selectedAmount) && (
              <span style={{
                color: '#B91C1C',
                marginLeft: '8px',
                fontFamily: 'var(--font-ui)'
              }}>
                Exceeds maximum limit of {maxAmount?.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedAmount > 0 && !isAmountExceedsMax(selectedAmount) && (
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          border: '1px solid var(--color-digital-silver)',
          padding: '16px',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-black)',
            fontFamily: 'var(--font-ui)',
            marginBottom: '4px'
          }}>
            Purchase Summary:
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--color-typewriter-red)',
            fontFamily: 'var(--font-headlines)'
          }}>
            {selectedAmount.toLocaleString()} EMOJI = {calculateFlowCost(selectedAmount)} FLOW
          </div>
        </div>
      )}
    </div>
  );
};