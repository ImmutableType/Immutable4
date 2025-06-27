// File: app/(client)/reader/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mockReaderService from '../../../../lib/reader/services/mockReaderService';

export default function ArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEngagement, setUserEngagement] = useState<{
    hasVoted: boolean;
    hasTipped: boolean;
    userVote?: {
      emoji?: string;
    };
    userTip?: any;
  }>({
    hasVoted: false,
    hasTipped: false
  });

  // Mock user ID (would come from wallet connection)
  const userId = "0x7h8i9j0k1l2m3n4o5p";

  // Load article on mount
  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load the article
        const articleData = await mockReaderService.getArticleById(params.id);
        if (!articleData) {
          setError('Article not found');
          return;
        }
        
        setArticle(articleData);
        
        // Record view
        await mockReaderService.recordView(params.id, userId);
        
        // Get user engagement with this article
        const engagement = await mockReaderService.getUserEngagement(params.id, userId);
        setUserEngagement(engagement);
        
      } catch (err) {
        setError('Failed to load article. Please try again later.');
        console.error('Error loading article:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticle();
  }, [params.id]);

  // Handle back button
  const handleBack = () => {
    router.push('/reader');
  };

  // Handle voting
  const handleVote = async (voteType: 'up' | 'down' | 'emoji', emoji?: string) => {
    if (!article) return;
    
    try {
      await mockReaderService.addVote(params.id, userId, voteType, emoji);
      
      // Refresh engagement data
      const engagement = await mockReaderService.getUserEngagement(params.id, userId);
      setUserEngagement(engagement);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Handle tipping
  const handleTip = async (amount: number, message?: string) => {
    if (!article) return;
    
    try {
      await mockReaderService.addTip(params.id, userId, amount, message);
      
      // Refresh engagement data
      const engagement = await mockReaderService.getUserEngagement(params.id, userId);
      setUserEngagement(engagement);
    } catch (err) {
      console.error('Error tipping:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render markdown content (simplified version)
  const renderContent = (content?: string) => {
    if (!content) return null;
    
    // In a real implementation, we would use a markdown renderer
    // For now, we'll just split paragraphs and handle basic formatting
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} style={{ fontFamily: 'var(--font-headlines)', marginBottom: '1rem' }}>{paragraph.substring(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} style={{ fontFamily: 'var(--font-headlines)', marginBottom: '1rem' }}>{paragraph.substring(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} style={{ fontFamily: 'var(--font-headlines)', marginBottom: '1rem' }}>{paragraph.substring(4)}</h3>;
      }
      if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
        return <p key={index} style={{ fontFamily: 'var(--font-body)', marginBottom: '1rem', fontStyle: 'italic' }}>{paragraph.substring(1, paragraph.length - 1)}</p>;
      }
      return <p key={index} style={{ fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>{paragraph}</p>;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.2rem' }}>
          Loading article...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div style={{ padding: '2rem' }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-typewriter-red)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          ← Back to Reader
        </button>
        <div style={{ 
          fontFamily: 'var(--font-ui)', 
          color: 'var(--color-typewriter-red)',
          textAlign: 'center',
          padding: '3rem 0'
        }}>
          {error || 'Article not found'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back button */}
      <button 
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-typewriter-red)',
          cursor: 'pointer',
          fontFamily: 'var(--font-ui)',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        ← Back to Reader
      </button>

      {/* Article Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{ 
            color: 'var(--color-typewriter-red)', 
            fontFamily: 'var(--font-ui)', 
            fontSize: '0.9rem',
            fontWeight: 500 
          }}>
            {article.category}
          </div>
          <div style={{ 
            color: 'var(--color-digital-silver)', 
            fontFamily: 'var(--font-ui)', 
            fontSize: '0.9rem' 
          }}>
            {formatDate(article.createdAt)}
          </div>
        </div>
        
        {/* Title */}
        <h1 style={{ 
          fontFamily: 'var(--font-headlines)', 
          fontSize: '2rem', 
          marginBottom: '1rem' 
        }}>
          {article.title}
        </h1>
        
        {/* Author info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            backgroundColor: 'var(--color-parchment)', 
            borderRadius: '50%', 
            width: '36px', 
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            {article.authorName ? article.authorName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-ui)', 
              fontSize: '1rem',
              fontWeight: 500
            }}>
              {article.authorName || article.author.substring(0, 6) + '...' + article.author.substring(article.author.length - 4)}
            </div>
            <div style={{ 
              fontFamily: 'var(--font-ui)', 
              fontSize: '0.85rem',
              color: 'var(--color-digital-silver)'
            }}>
              {article.authorType}
            </div>
          </div>
        </div>
        
        {/* Proposal indicator (if applicable) */}
        {article.proposalId && (
          <div style={{
            backgroundColor: 'var(--color-parchment)',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
              This article was community-funded through a proposal
            </div>
            <div>
              <a 
                href={`/news-proposals/${article.proposalId}`}
                style={{
                  color: 'var(--color-blockchain-blue)',
                  textDecoration: 'none'
                }}
              >
                View original proposal →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div style={{ marginBottom: '2rem' }}>
        {renderContent(article.content)}
      </div>

      {/* Blockchain Verification */}
      <div style={{
        backgroundColor: 'var(--color-parchment)',
        borderRadius: '4px',
        padding: '0.75rem',
        marginBottom: '1.5rem',
        fontFamily: 'var(--font-ui)',
        fontSize: '0.85rem'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontWeight: 500,
          color: 'var(--color-verification-green)'
        }}>
          <span style={{ marginRight: '0.5rem' }}>✓</span>
          Verified on Flow EVM blockchain
        </div>
        <div style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
          Content Hash: {article.contentHash}
        </div>
      </div>

      {/* Engagement Section */}
      <div style={{
        borderTop: '1px solid var(--color-digital-silver)',
        paddingTop: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            fontFamily: 'var(--font-headlines)', 
            fontSize: '1.2rem',
            margin: 0
          }}>
            Engage with this article
          </h3>
          <div style={{ 
            fontFamily: 'var(--font-ui)', 
            fontSize: '0.85rem',
            color: 'var(--color-digital-silver)'
          }}>
            {article.readerMetrics.viewCount} views • {article.readerMetrics.commentCount} comments
          </div>
        </div>

        {/* Voting */}
        <div style={{ 
          display: 'flex',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-ui)'
        }}>
          <button 
            onClick={() => handleVote('emoji', '👍')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: userEngagement.userVote?.emoji === '👍' ? 'var(--color-parchment)' : 'transparent',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              marginRight: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>👍</span>
            <span>Helpful</span>
          </button>
          <button 
            onClick={() => handleVote('emoji', '🧠')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: userEngagement.userVote?.emoji === '🧠' ? 'var(--color-parchment)' : 'transparent',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              marginRight: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>🧠</span>
            <span>Insightful</span>
          </button>
          <button 
            onClick={() => handleVote('emoji', '🔥')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: userEngagement.userVote?.emoji === '🔥' ? 'var(--color-parchment)' : 'transparent',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>🔥</span>
            <span>Important</span>
          </button>
        </div>

        {/* Tags */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          marginTop: '2rem',
          borderTop: '1px solid var(--color-digital-silver)',
          paddingTop: '1rem'
        }}>
          {article.tags.map((tag: string, index: number) => (
            <div key={index} style={{ 
              backgroundColor: 'var(--color-parchment)',
              color: 'var(--color-black)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-ui)',
              marginRight: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}