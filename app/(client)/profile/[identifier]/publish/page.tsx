// app/(client)/profile/[identifier]/publish/page.tsx
'use client'

import React, { use } from 'react';
import { usePublishedArticles } from '../../../../../lib/publishing/hooks/usePublishedArticles';
import ArticleTypeSelector from '../../../../../components/publishing/ArticleTypeSelector';

export default function PublishDashboardPage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = use(params);
  
  const { articles, isLoading: articlesLoading } = usePublishedArticles(identifier, 5);
  
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '2rem',
        marginBottom: '1.5rem',
      }}>
        Publish Content
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        <ArticleTypeSelector profileId={identifier} />
        
        {!articlesLoading && articles.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
            }}>
              Your Recent Publications
            </h2>
            
            <div style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              padding: '1rem',
            }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {articles.map(article => (
                  <li 
                    key={article.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--color-digital-silver)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-headlines)',
                        fontSize: '1.1rem',
                        margin: '0 0 0.25rem 0',
                      }}>
                        {article.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.8rem',
                        opacity: 0.7,
                      }}>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{article.mintType}</span>
                      </div>
                    </div>
                    
                    <div>
                      <button style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-black)',
                        fontFamily: 'var(--font-ui)',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--color-digital-silver)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}>
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div style={{
                textAlign: 'center',
                padding: '1rem',
              }}>
                <a 
                  href={`/profile/${identifier}/publish/manage`}
                  style={{
                    color: 'var(--color-blockchain-blue)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  View All Publications
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}