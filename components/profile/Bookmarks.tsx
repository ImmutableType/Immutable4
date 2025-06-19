// components/profile/Bookmarks.tsx
'use client'

import React, { useState, useEffect } from 'react';
import BookmarkCard from './BookmarkCard';
import BookmarkDetailModal from './modals/BookmarkDetailModal';
import { Profile } from '../../lib/profile/types/profile';

interface BookmarksProps {
  profile: Profile;
  isOwner: boolean;
}

interface BookmarkedContent {
  id: string;
  title: string;
  summary: string;
  contentType: 'article' | 'proposal';
  author?: {
    name: string;
    address: string;
  };
  proposer?: {
    name: string;
    address: string;
  };
  createdAt: string;
  bookmarkedAt: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  location?: {
    city: string;
    state: string;
  };
  metrics?: {
    views?: number;
    comments?: number;
    reactions?: number;
    fundingAmount?: number;
    fundingGoal?: number;
  };
}

const Bookmarks: React.FC<BookmarksProps> = ({ profile, isOwner }) => {
  // State for bookmarks and data
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedContent[]>([]);
  const [bookmarkedProposals, setBookmarkedProposals] = useState<BookmarkedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'articles' | 'proposals'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<BookmarkedContent | null>(null);

  // Load bookmarks data (mock for now)
  useEffect(() => {
    async function loadBookmarks() {
      if (!profile.walletAddress) return;

      console.log('Bookmarks Debug - Profile wallet:', profile.walletAddress);

      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with real blockchain calls
        // For now, using mock data to match the Collection pattern
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock bookmarked articles
        const mockArticles: BookmarkedContent[] = [
          {
            id: 'article-1',
            title: 'Miami Beach Development Plans Spark Community Debate',
            summary: 'New high-rise proposals face resistance from local residents concerned about environmental impact and community character.',
            contentType: 'article',
            author: {
              name: 'Sarah Martinez',
              address: '0x1234...5678'
            },
            createdAt: '2025-06-01T10:00:00Z',
            bookmarkedAt: '2025-06-04T15:30:00Z',
            category: 'Real Estate & Development',
            tags: ['Miami Beach', 'Development', 'Community'],
            location: {
              city: 'Miami',
              state: 'Florida'
            },
            metrics: {
              views: 1247,
              comments: 23,
              reactions: 89
            }
          },
          {
            id: 'article-2',
            title: 'Climate Change Impact on South Florida Coastline',
            summary: 'Scientists release new study showing accelerated sea level rise affecting Miami-Dade infrastructure.',
            contentType: 'article',
            author: {
              name: 'Dr. James Wilson',
              address: '0x5678...9012'
            },
            createdAt: '2025-05-28T14:22:00Z',
            bookmarkedAt: '2025-06-03T09:15:00Z',
            category: 'Climate & Environment',
            tags: ['Climate Change', 'Sea Level Rise', 'Infrastructure'],
            location: {
              city: 'Miami',
              state: 'Florida'
            },
            metrics: {
              views: 2156,
              comments: 45,
              reactions: 156
            }
          }
        ];

        // Mock bookmarked proposals
        const mockProposals: BookmarkedContent[] = [
          {
            id: 'proposal-1',
            title: 'Investigation into Miami Port Authority Contracts',
            summary: 'Community proposal for investigative journalism into recent port authority contract awards and potential conflicts of interest.',
            contentType: 'proposal',
            proposer: {
              name: 'Miami Transparency Collective',
              address: '0x9012...3456'
            },
            createdAt: '2025-05-25T16:45:00Z',
            bookmarkedAt: '2025-06-02T11:20:00Z',
            category: 'Local Politics',
            tags: ['Investigation', 'Port Authority', 'Transparency'],
            location: {
              city: 'Miami',
              state: 'Florida'
            },
            metrics: {
              fundingAmount: 2400,
              fundingGoal: 5000,
              comments: 18,
              reactions: 67
            }
          }
        ];

        setBookmarkedArticles(mockArticles);
        setBookmarkedProposals(mockProposals);

      } catch (err: any) {
        console.error('Error loading bookmarks:', err);
        setError(err.message || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    }

    loadBookmarks();
  }, [profile.walletAddress]);

  const openModal = (bookmark: BookmarkedContent) => {
    setModalData(bookmark);
    setModalOpen(true);
  };

  const allBookmarks = [...bookmarkedArticles, ...bookmarkedProposals].sort(
    (a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
  );

  const filteredBookmarks = filter === 'all' 
    ? allBookmarks
    : filter === 'articles' 
    ? bookmarkedArticles
    : bookmarkedProposals;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-digital-silver)',
            borderTop: '3px solid var(--color-typewriter-red)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto',
          }} />
          Loading bookmarks from blockchain...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--color-typewriter-red)',
      }}>
        Error loading bookmarks: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Bookmarks Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          margin: '0 0 0.5rem 0',
        }}>
          Bookmarked Content
        </h2>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--color-black)',
          opacity: 0.7,
          margin: '0 0 1.5rem 0',
        }}>
          Articles and proposals you've saved for later reading
        </p>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--color-digital-silver)',
          marginBottom: '1.5rem',
        }}>
          {[
            { key: 'all', label: `All (${allBookmarks.length})` },
            { key: 'articles', label: `Articles (${bookmarkedArticles.length})` },
            { key: 'proposals', label: `Proposals (${bookmarkedProposals.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                color: filter === tab.key ? 'var(--color-typewriter-red)' : 'var(--color-black)',
                borderBottom: filter === tab.key ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
                fontWeight: filter === tab.key ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredBookmarks.map(bookmark => (
            <BookmarkCard
              key={`${bookmark.contentType}-${bookmark.id}`}
              bookmark={bookmark}
              onClick={() => openModal(bookmark)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--color-black)',
          opacity: 0.6,
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            🔖
          </div>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            margin: '0 0 1rem 0',
          }}>
            {filter === 'all' ? 'No Bookmarks Yet' : 
             filter === 'articles' ? 'No Bookmarked Articles' : 
             'No Bookmarked Proposals'}
          </h3>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.5',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            {isOwner 
              ? `Start bookmarking ${filter === 'all' ? 'content' : filter} to save them for later reading. Bookmarked items appear here.`
              : `This profile hasn't bookmarked any ${filter === 'all' ? 'content' : filter} yet.`
            }
          </p>
        </div>
      )}

      {/* Bookmark Detail Modal */}
      <BookmarkDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookmark={modalData}
      />

      {/* Spinner Animation CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Bookmarks;