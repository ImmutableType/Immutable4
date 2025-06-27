// components/profile/Bookmarks.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BookmarkCard from './BookmarkCard';
import BookmarkDetailModal from './modals/BookmarkDetailModal';
import BookmarkContractService, { ContentType, Bookmark } from '@/lib/blockchain/contracts/BookmarkContract';
import EncryptedArticleReadService from '@/lib/blockchain/contracts/EncryptedArticleReadService';
import CommunityArticleService from '@/lib/blockchain/contracts/CommunityArticleService';
import PortfolioArticleService from '@/lib/blockchain/contracts/PortfolioArticleService';
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

// REAL CONTRACT ADDRESSES from deployments
const BOOKMARK_CONTRACT = '0x66f856f960AEF5011FdCc7383B9F81d2515930c9';
const ENCRYPTED_ARTICLES_CONTRACT = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const COMMUNITY_ARTICLES_CONTRACT = '0xD3d12E3b86Ed9f8Cdd095E0f90EDF7eE61Eb8611';
const PORTFOLIO_ARTICLES_CONTRACT = '0xF2Da11169CE742Ea0B75B7207E774449e26f8ee1';

// FIXED: Handle string IDs and determine article type from ID
const fetchContentById = async (contentId: string): Promise<any> => {
  console.log(`🔍 Analyzing content ID: "${contentId}"`);
  
  // Determine content type and actual ID from the bookmark contentId
  let actualId: string;
  let contentSource: 'native' | 'community' | 'portfolio';
  
  if (contentId.startsWith('encrypted_')) {
    // Native encrypted articles: "encrypted_1" -> "1"
    actualId = contentId.replace('encrypted_', '');
    contentSource = 'native';
  } else if (contentId.startsWith('native_')) {
    // Native articles: "native_2" -> "2"
    actualId = contentId.replace('native_', '');
    contentSource = 'native';
  } else if (contentId.startsWith('community_')) {
    // Community articles: "community_1" -> "1"
    actualId = contentId.replace('community_', '');
    contentSource = 'community';
  } else if (contentId.startsWith('portfolio_')) {
    // Portfolio articles: "portfolio_1" -> "1"
    actualId = contentId.replace('portfolio_', '');
    contentSource = 'portfolio';
  } else {
    // Fallback: try as numeric ID in native contract
    actualId = contentId;
    contentSource = 'native';
  }
  
  console.log(`📋 Parsed: "${contentId}" -> source: ${contentSource}, id: ${actualId}`);
  
  try {
    if (contentSource === 'native') {
      console.log(`🔍 Fetching native article ID: ${actualId}`);
      const service = new EncryptedArticleReadService();
      const articleData = await service.getArticle(parseInt(actualId));
      
      if (!articleData || !articleData.title) {
        throw new Error(`Native article ${actualId} not found or empty`);
      }
      
      console.log('✅ Native article found:', articleData.title);
      
      return {
        id: contentId, // Keep original bookmark ID
        title: articleData.title,
        summary: articleData.summary || 'Native article content',
        author: {
          name: `Author ${articleData.author?.slice(0, 8)}...`,
          address: articleData.author
        },
        createdAt: new Date(Number(articleData.publishedAt || 0) * 1000).toISOString(),
        category: articleData.category || 'Native Article',
        location: { 
          city: articleData.location?.split(',')[0] || 'Miami', 
          state: 'FL' 
        },
        articleType: 'native'
      };
    } 
    else if (contentSource === 'community') {
      console.log(`🔍 Fetching community article ID: ${actualId}`);
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const service = new CommunityArticleService(COMMUNITY_ARTICLES_CONTRACT, provider);
      const articleData = await service.getArticle(actualId);
      
      if (!articleData || !articleData.title) {
        throw new Error(`Community article ${actualId} not found or empty`);
      }
      
      console.log('✅ Community article found:', articleData.title);
      
      return {
        id: contentId,
        title: articleData.title,
        summary: articleData.description,
        author: {
          name: `Curator ${articleData.author.slice(0, 8)}...`,
          address: articleData.author
        },
        createdAt: new Date(Number(articleData.timestamp) * 1000).toISOString(),
        category: articleData.category,
        location: { 
          city: articleData.location?.split(',')[0] || 'Miami', 
          state: 'FL' 
        },
        articleType: 'community',
        tags: articleData.tags
      };
    }
    else if (contentSource === 'portfolio') {
      console.log(`🔍 Fetching portfolio article ID: ${actualId}`);
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const service = new PortfolioArticleService(PORTFOLIO_ARTICLES_CONTRACT, provider);
      const articleData = await service.getArticle(actualId);
      
      if (!articleData || !articleData.title) {
        throw new Error(`Portfolio article ${actualId} not found or empty`);
      }
      
      console.log('✅ Portfolio article found:', articleData.title);
      
      return {
        id: contentId,
        title: articleData.title,
        summary: articleData.description,
        author: {
          name: `Journalist ${articleData.author.slice(0, 8)}...`,
          address: articleData.author
        },
        createdAt: new Date(Number(articleData.timestamp) * 1000).toISOString(),
        category: articleData.category,
        location: { 
          city: articleData.location?.split(',')[0] || 'Miami', 
          state: 'FL' 
        },
        articleType: 'portfolio',
        tags: articleData.tags
      };
    }
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${contentSource} article ${actualId}:`, error);
    throw error;
  }
};

const Bookmarks: React.FC<BookmarksProps> = ({ profile, isOwner }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [enrichedBookmarks, setEnrichedBookmarks] = useState<BookmarkedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'articles' | 'proposals'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<BookmarkedContent | null>(null);

  // Load bookmarks from blockchain
  useEffect(() => {
    async function loadBookmarks() {
      if (!profile.walletAddress) return;

      try {
        setLoading(true);
        setError(null);

        console.log('🔖 Loading bookmarks from contract:', BOOKMARK_CONTRACT);
        console.log('🔖 For wallet:', profile.walletAddress);

        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new BookmarkContractService(BOOKMARK_CONTRACT, provider);
        
        const userBookmarks = await service.getUserBookmarks(profile.walletAddress);
        
        console.log('📊 Bookmarks found:', userBookmarks.length);
        userBookmarks.forEach((bookmark, i) => {
          console.log(`📑 Bookmark ${i + 1}: ${bookmark.contentType === ContentType.ARTICLE ? 'ARTICLE' : 'PROPOSAL'} #${bookmark.contentId}`);
        });
        
        setBookmarks(userBookmarks);
      } catch (err: any) {
        console.error('❌ Failed to load bookmarks:', err);
        setError(`Failed to load bookmarks: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadBookmarks();
  }, [profile.walletAddress]);

  // FIXED: Content fetching logic
  useEffect(() => {
    async function fetchRealContent() {
      if (bookmarks.length === 0) {
        setEnrichedBookmarks([]);
        setContentErrors([]);
        return;
      }

      setEnriching(true);
      setContentErrors([]);
      const enrichedData: BookmarkedContent[] = [];
      const errors: string[] = [];
      
      console.log('🔄 Fetching content for bookmarks:', bookmarks.map(b => b.contentId));

      for (const bookmark of bookmarks) {
        try {
          const bookmarkedAt = new Date(Number(bookmark.timestamp) * 1000).toISOString();
          
          // ALL bookmarks are content (ignore the PROPOSAL designation from contract)
          console.log(`📰 Processing bookmark: ${bookmark.contentId}`);
          
          const contentData = await fetchContentById(bookmark.contentId);
          
          enrichedData.push({
            id: bookmark.contentId,
            title: contentData.title,
            summary: contentData.summary,
            contentType: 'article', // All bookmarked content shows as articles
            author: contentData.author,
            createdAt: contentData.createdAt,
            bookmarkedAt,
            category: contentData.category,
            location: contentData.location,
            tags: contentData.tags
          });
          
          console.log(`✅ Successfully loaded: ${contentData.title}`);
          
        } catch (contentError: any) {
          const errorMsg = `Failed to load content "${bookmark.contentId}": ${contentError.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      console.log(`✅ Content loading complete:`, {
        totalBookmarks: bookmarks.length,
        successfullyLoaded: enrichedData.length,
        errors: errors.length
      });
      
      setEnrichedBookmarks(enrichedData);
      setContentErrors(errors);
      setEnriching(false);
    }

    fetchRealContent();
  }, [bookmarks]);

  // Filter bookmarks
  const filteredBookmarks = enrichedBookmarks.filter(bookmark => {
    if (filter === 'all') return true;
    if (filter === 'articles') return bookmark.contentType === 'article';
    if (filter === 'proposals') return bookmark.contentType === 'proposal';
    return true;
  });

  const articleBookmarks = enrichedBookmarks.filter(b => b.contentType === 'article');
  const proposalBookmarks = enrichedBookmarks.filter(b => b.contentType === 'proposal');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--color-digital-silver)',
            borderTop: '3px solid var(--color-verification-green)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto'
          }} />
          <span>Loading bookmarks from blockchain...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-typewriter-red)' }}>
        <h3>Error Loading Bookmarks</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
        <h3>No Bookmarks Found</h3>
        <p>{isOwner ? "You haven't bookmarked any content yet." : "This user hasn't bookmarked any content yet."}</p>
      </div>
    );
  }

  if (enriching) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid var(--color-digital-silver)',
          borderTop: '3px solid var(--color-verification-green)', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto'
        }} />
        <p>Loading real content from contracts...</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Checking {bookmarks.length} bookmarks across native, community, and portfolio contracts...
        </p>
      </div>
    );
  }

  if (enrichedBookmarks.length === 0 && contentErrors.length > 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>Bookmarks Found, Content Not Available</h3>
        <p>Found {bookmarks.length} bookmarks, but content could not be loaded.</p>
        <div style={{ 
          backgroundColor: 'rgba(179, 33, 30, 0.1)', 
          border: '1px solid var(--color-typewriter-red)',
          padding: '1rem', 
          borderRadius: '4px', 
          marginTop: '1rem',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '1rem auto'
        }}>
          <strong>Details:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            {contentErrors.map((error, index) => (
              <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{error}</li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem' }}>
          The bookmarked content may have been created with different content IDs or in contracts not yet checked.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Bookmarked Content ({enrichedBookmarks.length})</h2>
        <p style={{ opacity: 0.7 }}>
          Real blockchain content loaded from deployed contracts
        </p>
        
        {contentErrors.length > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(232, 163, 23, 0.1)', 
            border: '1px solid var(--color-alert-amber)',
            padding: '0.75rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            ⚠️ Some content couldn't be loaded ({contentErrors.length} errors). Showing {enrichedBookmarks.length} of {bookmarks.length} bookmarks.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-digital-silver)', marginBottom: '1.5rem' }}>
          {[
            { key: 'all', label: `All (${enrichedBookmarks.length})` },
            { key: 'articles', label: `Articles (${articleBookmarks.length})` },
            { key: 'proposals', label: `Proposals (${proposalBookmarks.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              style={{
                background: 'none', border: 'none', padding: '0.75rem 0', cursor: 'pointer',
                color: filter === tab.key ? 'var(--color-typewriter-red)' : 'var(--color-black)',
                borderBottom: filter === tab.key ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
                fontWeight: filter === tab.key ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={`${bookmark.contentType}-${bookmark.id}`}
            bookmark={bookmark}
            onClick={() => {
              setModalData(bookmark);
              setModalOpen(true);
            }}
          />
        ))}
      </div>

      <BookmarkDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookmark={modalData}
      />

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