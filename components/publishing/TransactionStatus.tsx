// components/publishing/TransactionStatus.tsx
import React from 'react';
import { TransactionState, TransactionProgress } from '../../lib/publishing/types/transaction';

interface TransactionStatusProps {
  transaction: TransactionState;
  progress: TransactionProgress;
  onRetry?: () => void;
  onCancel?: () => void;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transaction,
  progress,
  onRetry,
  onCancel
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      border: '1px solid var(--color-digital-silver)',
      borderRadius: '4px',
      padding: '2rem',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '1.2rem',
        margin: '0 0 1rem 0',
      }}>
        {transaction.status === 'confirmed' && 'Portfolio Article Published!'}
        {transaction.status === 'failed' && 'Transaction Failed'}
        {transaction.status === 'pending' && 'Publishing Article...'}
        {transaction.status === 'signing' && 'Waiting for Signature...'}
        {transaction.status === 'preparing' && 'Preparing Transaction...'}
        {transaction.status === 'idle' && 'Ready to Publish'}
      </h3>
      
      <p style={{ margin: '0 0 1rem 0' }}>
        {progress.message}
      </p>

      {transaction.txHash && (
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
            Transaction Hash:
          </p>
          <code style={{
            fontSize: '0.8rem',
            backgroundColor: 'var(--color-white)',
            padding: '0.5rem',
            borderRadius: '2px',
            display: 'block',
          }}>
            {transaction.txHash}
          </code>
        </div>
      )}

      {transaction.error && (
        <div style={{
          backgroundColor: 'rgba(179, 33, 30, 0.1)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: 'var(--color-typewriter-red)',
        }}>
          {transaction.error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-digital-silver)',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        
        {onRetry && transaction.status === 'failed' && (
          <button
            onClick={onRetry}
            style={{
              backgroundColor: 'var(--color-typewriter-red)',
              color: 'var(--color-white)',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;