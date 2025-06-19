// lib/engagement/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import bookmarkService from '../services/bookmarkService';
import { Bookmark } from '../../blockchain/contracts/BookmarkContract';

interface UseBookmarksReturn {
  bookmarks: {
    articles: Bookmark[];
    proposals: Bookmark[];
    total: Bookmark[];
  };
  bookmarkCount: number;
  isLoading: boolean;
  error: string | null;
  addBookmark: (contentId: string, contentType: 'article' | 'proposal') => Promise<void>;
  removeBookmark: (contentId: string, contentType: 'article' | 'proposal') => Promise<void>;
  isBookmarked: (contentId: string, contentType: 'article' | 'proposal') => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
}

export function useBookmarks(): UseBookmarksReturn {
  const { address, isConnected } = useWallet();
  const [bookmarks, setBookmarks] = useState<{
    articles: Bookmark[];
    proposals: Bookmark[];
    total: Bookmark[];
  }>({ articles: [], proposals: [], total: [] });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks for connected user
  const loadBookmarks = useCallback(async () => {
    if (!isConnected || !address) {
      setBookmarks({ articles: [], proposals: [], total: [] });
      setBookmarkCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [userBookmarks, count] = await Promise.all([
        bookmarkService.getUserBookmarks(address),
        bookmarkService.getUserBookmarkCount(address)
      ]);

      setBookmarks(userBookmarks);
      setBookmarkCount(count);
    } catch (err: any) {
      console.error('Error loading bookmarks:', err);
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Load bookmarks when wallet connects
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Add bookmark function
  const addBookmark = async (contentId: string, contentType: 'article' | 'proposal') => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await bookmarkService.addBookmark(contentId, contentType);
      // Refresh bookmarks after successful addition
      await loadBookmarks();
    } catch (err: any) {
      setError(err.message || 'Failed to add bookmark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove bookmark function
  const removeBookmark = async (contentId: string, contentType: 'article' | 'proposal') => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await bookmarkService.removeBookmark(contentId, contentType);
      // Refresh bookmarks after successful removal
      await loadBookmarks();
    } catch (err: any) {
      setError(err.message || 'Failed to remove bookmark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if content is bookmarked
  const isBookmarked = async (contentId: string, contentType: 'article' | 'proposal'): Promise<boolean> => {
    if (!isConnected || !address) {
      return false;
    }

    try {
      return await bookmarkService.isBookmarked(address, contentId, contentType);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
      return false;
    }
  };

  return {
    bookmarks,
    bookmarkCount,
    isLoading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refreshBookmarks: loadBookmarks
  };
}

export default useBookmarks;