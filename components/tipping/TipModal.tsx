// components/tipping/TipModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TipAmountSelector } from './TipAmountSelector';
import { useTipping } from '@/lib/hooks/useTipping';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  profileName?: string;
  profileAddress?: string;
  isPlatformTip?: boolean; // For platform donations
  onSuccess?: (result: any) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  profileId,
  profileName,
  profileAddress,
  isPlatformTip = false,
  onSuccess
}) => {
  const [selectedFlowAmount, setSelectedFlowAmount] = useState<number>(0);
  const [selectedEmojiAmount, setSelectedEmojiAmount] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<'FLOW' | 'EMOJI'>('FLOW');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const {
    estimate,
    isProcessing,
    result,
    error,
    estimateTip,
    tipProfile,
    tipAddress,
    clearResult,
    clearError
  } = useTipping();

  // Add preset amounts locally since hook doesn't provide them
  const presetAmounts = [
    { flow: 1, emoji: 100 },
    { flow: 5, emoji: 500 },
    { flow: 10, emoji: 1000 },
    { flow: 25, emoji: 2500 },
    { flow: 50, emoji: 5000 }
  ];

  useEffect(() => {
    if (result?.success) {
      onSuccess?.(result);
      handleClose();
    }
  }, [result, onSuccess]);

  const handleClose = () => {
    setSelectedFlowAmount(0);
    setSelectedEmojiAmount(0);
    setSelectedCurrency('FLOW');
    setShowConfirmation(false);
    clearResult();
    clearError();
    onClose();
  };

  const handleAmountChange = (flowAmount: number, emojiAmount: number, currency: 'FLOW' | 'EMOJI') => {
    setSelectedFlowAmount(flowAmount);
    setSelectedEmojiAmount(emojiAmount);
    setSelectedCurrency(currency);
  };

  const handleContinue = async () => {
    if (selectedFlowAmount > 0 || selectedEmojiAmount > 0) {
      const amount = selectedCurrency === 'FLOW' ? selectedFlowAmount : selectedEmojiAmount;
      try {
        const tipEstimate = await estimateTip(amount, selectedCurrency);
        if (tipEstimate.withinLimits) {
          setShowConfirmation(true);
        }
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  const handleConfirmTip = async () => {
    const amount = selectedCurrency === 'FLOW' ? selectedFlowAmount : selectedEmojiAmount;
    
    if (isPlatformTip) {
      // For platform tips, we don't have a profileId or specific address
      // This would need to be handled by a separate platform tip function
      // For now, we'll use tipAddress with a treasury address (to be implemented)
      console.log('Platform tip not yet implemented');
    } else if (profileId) {
      await tipProfile(profileId, amount, selectedCurrency);
    } else if (profileAddress) {
      await tipAddress(profileAddress, amount, selectedCurrency);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  const tipAmount = selectedCurrency === 'FLOW' ? selectedFlowAmount : selectedEmojiAmount;
  const recipientName = isPlatformTip ? 'ImmutableType Platform' : (profileName || 'Profile');

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
            <span style={{ marginRight: '8px' }}>☕</span>
            {isPlatformTip ? 'Support Platform' : `Tip ${recipientName}`}
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'var(--color-digital-silver)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          {!showConfirmation ? (
            // Amount Selection
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <TipAmountSelector
                presetAmounts={presetAmounts}
                onAmountChange={handleAmountChange}
                disabled={isProcessing}
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
                  {selectedCurrency === 'FLOW' 
                    ? `Minimum tip amount is 1 FLOW`
                    : `Amount must be greater than 0`
                  }
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
                  Confirm Tip
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
                    {tipAmount.toLocaleString()} {selectedCurrency}
                  </div>
                  <div style={{
                    color: 'var(--color-black)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    marginBottom: '8px'
                  }}>
                    to {recipientName}
                  </div>
                  {selectedCurrency === 'FLOW' && (
                    <div style={{
                      color: '#666',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.9rem'
                    }}>
                      + {estimate?.fee} FLOW platform fee
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                fontSize: '14px',
                color: '#666',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.5'
              }}>
                {selectedCurrency === 'FLOW' ? (
                  <>
                    <p style={{ margin: '4px 0' }}>• {isPlatformTip ? 'Platform receives' : 'Recipient receives'}: {tipAmount} FLOW</p>
                    <p style={{ margin: '4px 0' }}>• Platform fee: {estimate?.fee} FLOW</p>
                    <p style={{ margin: '4px 0' }}>• You earn: {(tipAmount * 10).toLocaleString()} EMOJI rewards</p>
                    <p style={{ margin: '4px 0' }}>• Transaction requires gas fees</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '4px 0' }}>• {isPlatformTip ? 'Platform receives' : 'Recipient receives'}: {tipAmount.toLocaleString()} EMOJI</p>
                    <p style={{ margin: '4px 0' }}>• No platform fees for EMOJI tips</p>
                    <p style={{ margin: '4px 0' }}>• Transaction requires gas fees</p>
                  </>
                )}
              </div>

              {isProcessing && (
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
                  Processing tip...
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
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={tipAmount === 0 || isProcessing}
                style={{
                  padding: '10px 24px',
                  backgroundColor: tipAmount === 0 || isProcessing ? '#ccc' : 'var(--color-typewriter-red)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: tipAmount === 0 || isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelConfirmation}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500'
                }}
              >
                Back
              </button>
              <button
                onClick={handleConfirmTip}
                disabled={isProcessing}
                style={{
                  padding: '10px 24px',
                  backgroundColor: isProcessing ? '#ccc' : 'var(--color-typewriter-red)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isProcessing ? 'Processing...' : `Send Tip`}
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