// components/tipping/TipAmountSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface PresetTipAmount {
  flow: number;
  emoji: number;
}

interface TipAmountSelectorProps {
  presetAmounts: PresetTipAmount[];
  onAmountChange: (flowAmount: number, emojiAmount: number, currency: 'FLOW' | 'EMOJI') => void;
  maxFlowAmount?: number;
  maxEmojiAmount?: number;
  disabled?: boolean;
}

export const TipAmountSelector: React.FC<TipAmountSelectorProps> = ({
  presetAmounts,
  onAmountChange,
  maxFlowAmount,
  maxEmojiAmount,
  disabled = false
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'FLOW' | 'EMOJI'>('FLOW');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: PresetTipAmount) => {
    if (selectedCurrency === 'FLOW') {
      setSelectedAmount(amount.flow);
      onAmountChange(amount.flow, 0, 'FLOW');
    } else {
      setSelectedAmount(amount.emoji);
      onAmountChange(0, amount.emoji, 'EMOJI');
    }
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue) && numericValue > 0) {
      setSelectedAmount(numericValue);
      setIsCustom(true);
      if (selectedCurrency === 'FLOW') {
        onAmountChange(numericValue, 0, 'FLOW');
      } else {
        onAmountChange(0, numericValue, 'EMOJI');
      }
    } else {
      setSelectedAmount(0);
      onAmountChange(0, 0, selectedCurrency);
    }
  };

  const handleCurrencyChange = (currency: 'FLOW' | 'EMOJI') => {
    setSelectedCurrency(currency);
    setSelectedAmount(0);
    setCustomAmount('');
    setIsCustom(false);
    onAmountChange(0, 0, currency);
  };

  const calculateFee = (flowAmount: number): string => {
    if (selectedCurrency === 'EMOJI') return '0'; // No fees for EMOJI tips
    const fee = Math.max(1, flowAmount * 0.019); // 1.9% minimum 1 FLOW
    return fee.toFixed(3);
  };

  const isAmountExceedsMax = (amount: number): boolean => {
    if (selectedCurrency === 'FLOW') {
      return maxFlowAmount ? amount > maxFlowAmount : false;
    } else {
      return maxEmojiAmount ? amount > maxEmojiAmount : false;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Currency Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--color-black)',
          fontFamily: 'var(--font-ui)',
          margin: '0'
        }}>
          Choose Currency:
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleCurrencyChange('FLOW')}
            style={{
              padding: '8px 16px',
              border: selectedCurrency === 'FLOW' 
                ? '2px solid var(--color-typewriter-red)' 
                : '1px solid var(--color-digital-silver)',
              borderRadius: '6px',
              backgroundColor: selectedCurrency === 'FLOW' 
                ? 'rgba(179, 33, 30, 0.05)' 
                : 'var(--color-white)',
              color: selectedCurrency === 'FLOW' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontWeight: '500'
            }}
          >
            FLOW
          </button>
          <button
            onClick={() => handleCurrencyChange('EMOJI')}
            style={{
              padding: '8px 16px',
              border: selectedCurrency === 'EMOJI' 
                ? '2px solid var(--color-typewriter-red)' 
                : '1px solid var(--color-digital-silver)',
              borderRadius: '6px',
              backgroundColor: selectedCurrency === 'EMOJI' 
                ? 'rgba(179, 33, 30, 0.05)' 
                : 'var(--color-white)',
              color: selectedCurrency === 'EMOJI' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontWeight: '500'
            }}
          >
            EMOJI
          </button>
        </div>
      </div>

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
          {presetAmounts.map((preset) => {
            const amount = selectedCurrency === 'FLOW' ? preset.flow : preset.emoji;
            const isSelected = !isCustom && selectedAmount === amount;
            const exceedsMax = isAmountExceedsMax(amount);
            
            return (
              <button
                key={`${preset.flow}-${preset.emoji}`}
                onClick={() => handlePresetClick(preset)}
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
                    {amount.toLocaleString()} {selectedCurrency}
                  </span>
                  {selectedCurrency === 'FLOW' && (
                    <span style={{
                      color: '#666',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '12px'
                    }}>
                      Fee: {calculateFee(amount)} FLOW
                    </span>
                  )}
                </div>
                {exceedsMax && (
                  <div style={{
                    fontSize: '12px',
                    color: '#B91C1C',
                    marginTop: '4px',
                    fontFamily: 'var(--font-ui)'
                  }}>
                    Exceeds maximum tip limit
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
            placeholder={`Enter ${selectedCurrency} amount`}
            disabled={disabled}
            min={selectedCurrency === 'FLOW' ? "1" : "1"}
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
          />
          <span style={{
            color: '#666',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px'
          }}>
            {selectedCurrency}
          </span>
        </div>
        
        {isCustom && selectedAmount > 0 && (
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: 'var(--font-body)'
          }}>
            {selectedCurrency === 'FLOW' ? (
              <>
                Tip: {selectedAmount} FLOW | Fee: {calculateFee(selectedAmount)} FLOW
                <br />
                <span style={{ color: 'var(--color-verification-green)' }}>
                  You'll earn {(selectedAmount * 10).toLocaleString()} EMOJI rewards!
                </span>
              </>
            ) : (
              <>Amount: {selectedAmount.toLocaleString()} EMOJI (No fees!)</>
            )}
            {isAmountExceedsMax(selectedAmount) && (
              <span style={{
                color: '#B91C1C',
                marginLeft: '8px',
                fontFamily: 'var(--font-ui)'
              }}>
                Exceeds maximum limit
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
            Tip Summary:
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--color-typewriter-red)',
            fontFamily: 'var(--font-headlines)'
          }}>
            {selectedAmount.toLocaleString()} {selectedCurrency}
            {selectedCurrency === 'FLOW' && ` + ${calculateFee(selectedAmount)} FLOW fee`}
          </div>
        </div>
      )}
    </div>
  );
};