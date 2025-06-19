// components/article/ArticleHeader.tsx
'use client';
import React from 'react';
import { Article } from '../../lib/reader/types/article';
import { metadataService } from '../../lib/locations/seo/metadataService';
import { urlOptimizer } from '../../lib/locations/seo/urlOptimizer';

interface ArticleHeaderProps {
  article: Article;
  city: string;
  category: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article, city, category }) => {
  const categoryDisplay = urlOptimizer.getCategoryDisplayName(category);
  const freshness = metadataService.getFreshnessIndicator(article.createdAt);
  const formattedDate = metadataService.formatPublicationDate(article.createdAt);

  return (
    <header style={{ marginBottom: '2rem' }}>
      {/* Location and Category Tags */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: 'var(--color-digital-silver)'
      }}>
        <span style={{
          backgroundColor: 'var(--color-verification-green)',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {city.toUpperCase()}
        </span>
        <span style={{
          backgroundColor: 'var(--color-blockchain-blue)',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          textTransform: 'uppercase'
        }}>
          {categoryDisplay}
        </span>
        <span>{freshness || formattedDate}</span>
      </div>
      
      {/* Article Title */}
      <h1 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
        lineHeight: '1.2',
        marginBottom: '1rem',
        color: 'var(--color-black)',
        wordBreak: 'break-word'
      }}>
        {article.title}
      </h1>
      
      {/* Article Summary */}
      {article.summary && (
        <div style={{
          fontSize: '1.2rem',
          lineHeight: '1.5',
          color: 'var(--color-digital-silver)',
          marginBottom: '1.5rem',
          fontStyle: 'italic'
        }}>
          {article.summary}
        </div>
      )}
      
      {/* Author and Verification */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-digital-silver)',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <strong>By {article.authorName || article.author}</strong>
          <span style={{ color: 'var(--color-digital-silver)', marginLeft: '0.5rem' }}>
            ({article.authorType})
          </span>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--color-digital-silver)',
            marginTop: '0.25rem'
          }}>
            {formattedDate}
          </div>
        </div>
        
        {/* Blockchain Verification */}
        {article.contentHash && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}>
            <span style={{
              backgroundColor: 'var(--color-verification-green)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              ✓ VERIFIED
            </span>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--color-digital-silver)',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {article.contentHash.substring(0, 12)}...
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default ArticleHeader;