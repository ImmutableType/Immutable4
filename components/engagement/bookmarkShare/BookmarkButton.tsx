// components/engagement/bookmarkShare/BookmarkButton.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BookmarkContractService, { ContentType } from '@/lib/blockchain/contracts/BookmarkContract';

interface BookmarkButtonProps {
  contentId: string;
  contentType: 'article' | 'proposal';
  className?: string;
}

const CONTRACT_ADDRESS = '0x66f856f960AEF5011FdCc7383B9F81d2515930c9';

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  contentId, 
  contentType,
  className = '' 
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get wallet connection status
  useEffect(() => {
    async function checkWallet() {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    }
    checkWallet();
  }, []);

  // Check bookmark status when wallet is connected
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!walletAddress || !contentId) return;

      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new BookmarkContractService(CONTRACT_ADDRESS, provider);
        
        const isAlreadyBookmarked = await service.isBookmarked(
          walletAddress,
          contentId,
          contentType === 'article' ? ContentType.ARTICLE : ContentType.PROPOSAL
        );
        
        setIsBookmarked(isAlreadyBookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    }

    checkBookmarkStatus();
  }, [walletAddress, contentId, contentType]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!walletAddress) {
      alert('Please connect your wallet to bookmark content');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log(`🔖 ${isBookmarked ? 'Removing' : 'Adding'} bookmark for ${contentType} #${contentId}`);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const service = new BookmarkContractService(CONTRACT_ADDRESS, provider);

      const contractContentType = contentType === 'article' ? ContentType.ARTICLE : ContentType.PROPOSAL;

      if (isBookmarked) {
        // Remove bookmark
        const tx = await service.removeBookmark(contentId, contractContentType, signer);
        console.log('🗑️ Remove bookmark transaction:', tx.hash);
        
        // Wait for confirmation
        await tx.wait();
        console.log('✅ Bookmark removed successfully');
        
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const tx = await service.addBookmark(contentId, contractContentType, signer);
        console.log('📌 Add bookmark transaction:', tx.hash);
        
        // Wait for confirmation
        await tx.wait();
        console.log('✅ Bookmark added successfully');
        
        setIsBookmarked(true);
      }
    } catch (error: any) {
      console.error('❌ Bookmark operation failed:', error);
      
      // Handle user rejection
      if (error.code === 4001) {
        alert('Transaction cancelled by user');
      } else if (error.message?.includes('insufficient fee')) {
        alert('Insufficient FLOW for bookmark fee (0.001 FLOW required)');
      } else {
        alert(`Bookmark operation failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'not-allowed',
          opacity: 0.5,
        }}
        title="Connect wallet to bookmark"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={handleBookmarkClick}
      style={{
        width: '32px',
        height: '32px',
        backgroundColor: isBookmarked ? 'var(--color-verification-green)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoading ? 'wait' : 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        border: isBookmarked ? '2px solid var(--color-verification-green)' : '2px solid transparent',
        color: isBookmarked ? 'white' : 'var(--color-black)',
        opacity: isLoading ? 0.7 : 1,
      }}
      onMouseOver={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseOut={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
      title={isLoading ? 'Processing...' : isBookmarked ? 'Remove bookmark (0.001 FLOW)' : 'Add bookmark (0.001 FLOW)'}
    >
      {isLoading ? (
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      ) : (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d={isBookmarked 
            ? "M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"
            : "M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"
          }/>
        </svg>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookmarkButton;