// components/profile/CuratedTab.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CommunityArticleService, { CommunityArticle } from '@/lib/blockchain/contracts/CommunityArticleService';
import CommunityCard from '@/components/cards/types/CommunityCard';

interface CuratedTabProps {
  profile: {
    walletAddress: string;
    displayName?: string;
  };
}

const CONTRACT_ADDRESS = '0xD3d12E3b86Ed9f8Cdd095E0f90EDF7eE61Eb8611';

const CuratedTab: React.FC<CuratedTabProps> = ({ profile }) => {
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCuratedArticles() {
      if (!profile?.walletAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new CommunityArticleService(CONTRACT_ADDRESS, provider);
        
        // Get article IDs by author
        const articleIds = await service.getArticlesByAuthor(profile.walletAddress);
        
        if (articleIds.length === 0) {
          setArticles([]);
          return;
        }
        
        // Fetch full article details
        const articleDetails = await service.getArticlesBatch(articleIds);
        
        // Sort by timestamp (newest first)
        articleDetails.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        
        setArticles(articleDetails);
      } catch (error) {
        console.error('Error fetching curated articles:', error);
        setError('Failed to load curated articles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCuratedArticles();
  }, [profile?.walletAddress]);

  // Mock voting handlers (to be implemented with actual voting contract)
  const handleUpvote = (articleId: string) => {
    console.log('Upvote article:', articleId);
    // TODO: Implement actual upvote functionality
  };

  const handleDownvote = (articleId: string) => {
    console.log('Downvote article:', articleId);
    // TODO: Implement actual downvote functionality
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-digital-silver)',
            borderTop: '3px solid var(--color-alert-amber)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <span style={{ fontFamily: 'var(--font-ui)' }}>Loading curated content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-typewriter-red)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          marginBottom: '1rem',
        }}>
          Error Loading Curated Content
        </h3>
        <p>{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          🌐
        </div>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}>
          No Curated Content Yet
        </h3>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          This user hasn't curated any community content yet. Curated articles will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          margin: 0,
        }}>
          Curated Content ({articles.length})
        </h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {articles.map((article) => (
          <CommunityCard
            key={article.id}
            id={article.id}
            title={article.title}
            summary={article.description}
            submitter={{
              name: profile.displayName || `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`,
              id: profile.walletAddress,
              stats: {
                curated: articles.length,
                location: article.location
              }
            }}
            sourceUrl={article.contentUrl}
            sourceName={article.sourceDomain}
            createdAt={new Date(Number(article.timestamp) * 1000).toISOString()}
            sharedAt={new Date(Number(article.timestamp) * 1000).toISOString()}
            location={{
              city: article.location,
              state: 'FL' // Default for Miami
            }}
            category={article.category}
            tags={article.tags}
            voting={{
              upvotes: Math.floor(Math.random() * 50) + 5, // Mock data
              downvotes: Math.floor(Math.random() * 10) + 1, // Mock data
              percentage: Math.floor(Math.random() * 30) + 70 // Mock data 70-100%
            }}
            metrics={{
              reactions: {
                '👍': Math.floor(Math.random() * 20),
                '🔥': Math.floor(Math.random() * 15),
                '💯': Math.floor(Math.random() * 10),
              },
              supporters: Math.floor(Math.random() * 25) + 5
            }}
            distribution={{
              submitter: 60,
              platform: 40,
              total: 100
            }}
          />
        ))}
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

export default CuratedTab;