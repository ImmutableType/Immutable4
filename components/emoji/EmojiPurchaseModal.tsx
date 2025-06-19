// components/emoji/EmojiPurchaseModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { EmojiAmountSelector } from './EmojiAmountSelector';
import { useEmojiPurchase } from '@/lib/hooks/useEmojiPurchase';

interface EmojiPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

export const EmojiPurchaseModal: React.FC<EmojiPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const {
    estimate,
    isPurchasing,
    result,
    error,
    estimatePurchase,
    purchaseTokens,
    clearResult,
    clearError,
    presetAmounts
  } = useEmojiPurchase();

  useEffect(() => {
    if (selectedAmount > 0) {
      estimatePurchase(selectedAmount);
    }
  }, [selectedAmount, estimatePurchase]);

  useEffect(() => {
    if (result?.success) {
      onSuccess?.(result);
      handleClose();
    }
  }, [result, onSuccess]);

  const handleClose = () => {
    setSelectedAmount(0);
    setShowConfirmation(false);
    clearResult();
    clearError();
    onClose();
  };

  const handlePurchase = async () => {
    if (selectedAmount > 0) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmPurchase = async () => {
    await purchaseTokens(selectedAmount);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-digital-silver)',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--color-black)',
            margin: '0'
          }}>
            <span style={{ marginRight: '8px' }}>🎉</span>
            Reload Your EMOJIs
          </h2>
          <button
            onClick={handleClose}
            disabled={isPurchasing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'var(--color-digital-silver)',
              cursor: isPurchasing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)',
              padding: '4px'
            }}
            onMouseEnter={(e) => !isPurchasing && (e.currentTarget.style.color = 'var(--color-black)')}
            onMouseLeave={(e) => !isPurchasing && (e.currentTarget.style.color = 'var(--color-digital-silver)')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          {!showConfirmation ? (
            // Amount Selection
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <EmojiAmountSelector
                presetAmounts={presetAmounts}
                onAmountChange={setSelectedAmount}
                maxAmount={estimate?.maxPurchaseAmount}
                disabled={isPurchasing}
              />

              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {estimate && !estimate.withinLimits && (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#D97706',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px'
                }}>
                  Maximum purchase amount is {estimate.maxPurchaseAmount.toLocaleString()} EMOJI
                </div>
              )}
            </div>
          ) : (
            // Confirmation
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--color-black)',
                  marginBottom: '16px'
                }}>
                  Confirm Purchase
                </h3>
                <div style={{
                  backgroundColor: 'var(--color-parchment)',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'var(--color-typewriter-red)',
                    fontFamily: 'var(--font-headlines)',
                    marginBottom: '8px'
                  }}>
                    {selectedAmount.toLocaleString()} EMOJI
                  </div>
                  <div style={{
                    color: 'var(--color-black)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem'
                  }}>
                    for {estimate?.flowCost === "0" ? "< 1" : estimate?.flowCost} FLOW
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '14px',
                color: '#666',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.5'
              }}>
                <p style={{ margin: '4px 0' }}>• Tokens will be sent to your wallet</p>
                <p style={{ margin: '4px 0' }}>• FLOW will be sent to treasury</p>
                <p style={{ margin: '4px 0' }}>• Transaction requires gas fees</p>
              </div>

              {isPurchasing && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--color-blockchain-blue)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px'
                }}>
                  <div style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    border: '2px solid var(--color-blockchain-blue)',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  Processing transaction...
                </div>
              )}

              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid var(--color-digital-silver)',
          paddingTop: '16px',
          backgroundColor: 'var(--color-parchment)',
          margin: '0 -32px -32px -32px',
          padding: '16px 32px',
          borderRadius: '0 0 6px 6px'
        }}>
          {!showConfirmation ? (
            <>
              <button
                onClick={handleClose}
                disabled={isPurchasing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: isPurchasing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isPurchasing && (e.currentTarget.style.color = 'var(--color-black)')}
                onMouseLeave={(e) => !isPurchasing && (e.currentTarget.style.color = '#666')}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={selectedAmount === 0 || !estimate?.withinLimits || isPurchasing}
                style={{
                  padding: '10px 24px',
                  backgroundColor: selectedAmount === 0 || !estimate?.withinLimits || isPurchasing ? '#ccc' : 'var(--color-typewriter-red)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: selectedAmount === 0 || !estimate?.withinLimits || isPurchasing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedAmount > 0 && estimate?.withinLimits && !isPurchasing) {
                    e.currentTarget.style.backgroundColor = '#8C1A17';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAmount > 0 && estimate?.withinLimits && !isPurchasing) {
                    e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
                  }
                }}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelConfirmation}
                disabled={isPurchasing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: isPurchasing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isPurchasing && (e.currentTarget.style.color = 'var(--color-black)')}
                onMouseLeave={(e) => !isPurchasing && (e.currentTarget.style.color = '#666')}
              >
                Back
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isPurchasing}
                style={{
                  padding: '10px 24px',
                  backgroundColor: isPurchasing ? '#ccc' : 'var(--color-typewriter-red)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: isPurchasing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isPurchasing) {
                    e.currentTarget.style.backgroundColor = '#8C1A17';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPurchasing) {
                    e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
                  }
                }}
              >
                {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};