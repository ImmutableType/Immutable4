// components/article/ArticleContent.tsx
'use client';
import React from 'react';
import { Article } from '../../lib/reader/types/article';

interface ArticleContentProps {
  article: Article;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  // Enhanced content rendering with better typography
  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph: string, index: number) => {
      if (paragraph.trim()) {
        return (
          <p key={index} style={{ 
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'var(--color-black)',
            textAlign: 'justify'
          }}>
            {paragraph}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <main>
      {/* Article Body */}
      <div style={{
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: 'var(--color-black)'
      }}>
        {renderContent(article.content)}
      </div>
      
      {/* Article Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--color-digital-silver)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Article Metrics */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.2rem',
              marginBottom: '1rem'
            }}>
              Article Metrics
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-digital-silver)' }}>
              <div>Views: {article.readerMetrics.viewCount.toLocaleString()}</div>
              <div>Comments: {article.readerMetrics.commentCount}</div>
              <div>Tips Received: {article.readerMetrics.tipAmount} FLOW</div>
            </div>
          </div>
          
          {/* Community Funding Info */}
          {article.proposalId && (
            <div>
              <h3 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                Community Funded
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-digital-silver)' }}>
                This article was funded by community proposal.
                <br />
                <a 
                  href={`/news-proposals/${article.proposalId}`}
                  style={{
                    color: 'var(--color-blockchain-blue)',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  View Original Proposal →
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--color-digital-silver)',
              marginRight: '0.5rem'
            }}>
              Tags:
            </span>
            {article.tags.map((tag: string, index: number) => (
              <span key={index} style={{
                backgroundColor: 'var(--color-parchment)',
                color: 'var(--color-black)',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-ui)'
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Blockchain Verification Footer */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--color-digital-silver)',
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-parchment)'
        }}>
          This article is permanently stored on the Flow EVM blockchain and cannot be altered or removed.
          {article.contentHash && (
            <>
              <br />
              Content Hash: <code style={{ fontFamily: 'monospace' }}>{article.contentHash}</code>
            </>
          )}
        </div>
      </footer>
    </main>
  );
};

export default ArticleContent;