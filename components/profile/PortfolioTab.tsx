// components/profile/PortfolioTab.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PortfolioArticleService, { PortfolioArticle } from '@/lib/blockchain/contracts/PortfolioArticleService';
import PortfolioCard from '@/components/cards/types/PortfolioCard';

interface PortfolioTabProps {
  profile: {
    walletAddress: string;
    displayName?: string;
  };
}

const CONTRACT_ADDRESS = '0xF2Da11169CE742Ea0B75B7207E774449e26f8ee1';

const PortfolioTab: React.FC<PortfolioTabProps> = ({ profile }) => {
  const [articles, setArticles] = useState<PortfolioArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolioArticles() {
      if (!profile?.walletAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new PortfolioArticleService(CONTRACT_ADDRESS, provider);
        
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
        console.error('Error fetching portfolio articles:', error);
        setError('Failed to load portfolio articles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPortfolioArticles();
  }, [profile?.walletAddress]);

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
            borderTop: '3px solid var(--color-typewriter-red)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <span style={{ fontFamily: 'var(--font-ui)' }}>Loading portfolio...</span>
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
          Error Loading Portfolio
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
          📰
        </div>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }}>
          No Portfolio Content Yet
        </h3>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          This user hasn't added any portfolio content yet. Portfolio articles will appear here.
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
          Portfolio ({articles.length})
        </h2>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {articles.map((article) => (
          <PortfolioCard
            key={article.id}
            id={article.id}
            title={article.title}
            summary={article.description}
            author={{
              name: profile.displayName || `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`,
              id: profile.walletAddress,
              stats: {
                articlesPublished: articles.length,
                credibility: 95 // Mock data
              }
            }}
            originalUrl={article.contentUrl}
            publicationName={article.publicationName}
            originalAuthor={article.originalAuthor}
            originalPublishDate={article.originalPublishDate}
            createdAt={new Date(Number(article.timestamp) * 1000).toISOString()}
            verifiedAt={new Date(Number(article.timestamp) * 1000).toISOString()}
            location={{
              city: article.location,
              state: 'FL' // Default for Miami
            }}
            category={article.category}
            tags={article.tags}
            portfolioType={article.portfolioType as 'verification' | 'showcase'}
            metrics={{
              reactions: {
                '👏': Math.floor(Math.random() * 30),
                '🔥': Math.floor(Math.random() * 20),
                '💯': Math.floor(Math.random() * 15),
              },
              supporters: Math.floor(Math.random() * 40) + 10
            }}
            distribution={{
              author: 70,
              platform: 30,
              total: 100
            }}
            onClick={() => {
              window.open(article.contentUrl, '_blank');
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

export default PortfolioTab;