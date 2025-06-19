// components/engagement/bookmarkShare/BookmarkButton.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../../lib/hooks/useWallet';
import { useBookmarks } from '../../../lib/engagement/hooks/useBookmarks';
import bookmarkService from '../../../lib/engagement/services/bookmarkService';

interface BookmarkButtonProps {
  contentId: string;
  contentType: 'article' | 'proposal';
  onClick?: (e: React.MouseEvent) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  contentId,
  contentType,
  onClick
}) => {
  const { address, isConnected } = useWallet();
  const { addBookmark, removeBookmark, isBookmarked: checkBookmarked } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Check profile status when wallet connects
  useEffect(() => {
    async function checkProfile() {
      if (!isConnected || !address) {
        setHasProfile(false);
        return;
      }
      
      setCheckingProfile(true);
      try {
        const profileExists = await bookmarkService.hasProfile(address);
        setHasProfile(profileExists);
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    }

    checkProfile();
  }, [isConnected, address]);

  // Check bookmark status when component mounts or wallet connects
  useEffect(() => {
    async function checkStatus() {
      if (!isConnected || !contentId || !hasProfile) return;
      
      setChecking(true);
      try {
        const bookmarked = await checkBookmarked(contentId, contentType);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setChecking(false);
      }
    }

    checkStatus();
  }, [isConnected, contentId, contentType, checkBookmarked, hasProfile]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isConnected) {
      alert('Please connect your wallet to bookmark content');
      return;
    }

    if (!hasProfile) {
      alert('Please create a profile to bookmark content');
      return;
    }
    
    if (loading || checking || checkingProfile) return;
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(contentId, contentType);
        setIsBookmarked(false);
      } else {
        await addBookmark(contentId, contentType);
        setIsBookmarked(true);
      }
      
      onClick?.(e);
    } catch (error: any) {
      console.error('Bookmark error:', error);
      if (error.message.includes('Must have a profile')) {
        alert('Please create a profile to bookmark content');
      } else {
        alert(error.message || 'Failed to update bookmark');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking
  if (checking || checkingProfile) {
    return (
      <div 
        className="action-icon bookmark-icon tooltip" 
        data-tooltip="Checking..."
        style={{
          cursor: 'default',
          opacity: 0.6,
          padding: '8px',
          minWidth: '40px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          backgroundColor: 'rgba(0,0,0,0.05)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className="action-icon bookmark-icon tooltip" 
      data-tooltip={
        !isConnected 
          ? "Connect wallet to bookmark" 
          : !hasProfile
          ? "Create profile to bookmark"
          : loading 
          ? "Processing..." 
          : isBookmarked 
          ? "Remove bookmark (0.001 FLOW)" 
          : "Bookmark (0.001 FLOW)"
      }
      onClick={handleBookmark}
      style={{
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        color: isBookmarked ? 'var(--color-verification-green)' : 'inherit',
        padding: '8px',
        minWidth: '40px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        backgroundColor: isBookmarked ? 'rgba(29, 127, 110, 0.1)' : 'rgba(0,0,0,0.05)',
        border: isBookmarked ? '1px solid var(--color-verification-green)' : '1px solid transparent',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = isBookmarked 
            ? 'rgba(29, 127, 110, 0.2)' 
            : 'rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = isBookmarked 
            ? 'rgba(29, 127, 110, 0.1)' 
            : 'rgba(0,0,0,0.05)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d={isBookmarked 
          ? "M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"
          : "M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"
        }/>
      </svg>
    </div>
  );
};

export default BookmarkButton;