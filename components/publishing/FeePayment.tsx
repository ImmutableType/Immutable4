// components/publishing/FeePayment.tsx
import React, { useState } from 'react';
import { PublishingFee } from '../../lib/publishing/types/fee';
import { mockFeesService } from '../../lib/publishing/services/feesService';

interface FeePaymentProps {
  authorId: string;
  onSuccess: (fee: PublishingFee) => void;
  onCancel: () => void;
}

const FeePayment: React.FC<FeePaymentProps> = ({ authorId, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const standardFee = 0.5; // FLOW
  
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await mockFeesService.processPayment(authorId, standardFee);
      
      if (response.success) {
        onSuccess(response.fee);
      } else {
        setError(response.error || 'Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div style={{
      backgroundColor: 'var(--color-parchment)',
      borderRadius: '4px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '1.2rem',
        margin: '0 0 1rem 0',
      }}>
        Publishing Fee
      </h3>
      
      <p style={{
        fontSize: '0.95rem',
        margin: '0 0 1.5rem 0',
        lineHeight: '1.5',
      }}>
        A small fee of {standardFee} FLOW is required to publish content on ImmutableType. This fee helps maintain the network and prevents spam.
      </p>
      
      {error && (
        <div style={{
          backgroundColor: 'rgba(179, 33, 30, 0.1)',
          borderLeft: '3px solid var(--color-typewriter-red)',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-typewriter-red)',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-black)',
            fontFamily: 'var(--font-ui)',
            padding: '0.75rem 1rem',
            border: '1px solid var(--color-digital-silver)',
            borderRadius: '4px',
            cursor: isProcessing ? 'default' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          style={{
            backgroundColor: 'var(--color-typewriter-red)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-ui)',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: isProcessing ? 'default' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isProcessing ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Pay {standardFee} FLOW</>
          )}
        </button>
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

export default FeePayment;