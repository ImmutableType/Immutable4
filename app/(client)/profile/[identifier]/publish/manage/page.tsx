// app/(client)/profile/[identifier]/publish/manage/page.tsx
'use client'

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePublishedArticles } from '../../../../../../lib/publishing/hooks/usePublishedArticles';
import TokenGate from '../../../../../../components/publishing/TokenGate';

export default function ManagePublicationsPage({ params }: { params: Promise<{ identifier: string }> }) {
  const router = useRouter();
  const { identifier } = use(params);
  
  const { articles, isLoading, error, hasMore, loadMore } = usePublishedArticles(identifier);
  
  return (
    <div>
      <TokenGate profileId={identifier} publishingType="portfolio">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '2rem',
            margin: 0,
          }}>
            Manage Publications
          </h1>
          
          <button
            onClick={() => router.push(`/profile/${identifier}/publish`)}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              padding: '0.5rem 1rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Back to Dashboard
          </button>
        </div>
        
        {isLoading && articles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-black)',
            opacity: 0.7,
          }}>
            Loading publications...
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-typewriter-red)',
          }}>
            Error: {error.message}
          </div>
        ) : articles.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--color-parchment)',
            borderRadius: '4px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.3rem',
              marginTop: 0,
              marginBottom: '1rem',
            }}>
              No Publications Yet
            </h3>
            <p style={{
              fontSize: '1rem',
              margin: '0 0 1.5rem 0',
            }}>
              You haven't published any content yet. Start by creating your first publication.
            </p>
            <button
              onClick={() => router.push(`/profile/${identifier}/publish`)}
              style={{
                backgroundColor: 'var(--color-typewriter-red)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-ui)',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Start Publishing
            </button>
          </div>
        ) : (
          <>
            <div style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              marginBottom: '1.5rem',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid var(--color-digital-silver)',
                    backgroundColor: 'var(--color-parchment)',
                  }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '1rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                    }}>Title</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                    }}>Type</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                    }}>Published</th>
                    <th style={{
                      textAlign: 'center',
                      padding: '1rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(article => (
                    <tr 
                      key={article.id}
                      style={{
                        borderBottom: '1px solid var(--color-digital-silver)',
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        fontFamily: 'var(--font-body)',
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          marginBottom: '0.25rem',
                        }}>
                          {article.title}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.7,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '400px',
                        }}>
                          {article.shortDescription}
                        </div>
                      </td>
                      <td style={{
                        textAlign: 'center',
                        padding: '1rem',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.9rem',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: article.mintType === 'community' 
                            ? 'rgba(43, 57, 144, 0.1)' 
                            : article.mintType === 'portfolio'
                              ? 'rgba(29, 127, 110, 0.1)'
                              : 'rgba(179, 33, 30, 0.1)',
                          color: article.mintType === 'community' 
                            ? 'var(--color-blockchain-blue)' 
                            : article.mintType === 'portfolio'
                              ? 'var(--color-verification-green)'
                              : 'var(--color-typewriter-red)',
                          textTransform: 'capitalize',
                        }}>
                          {article.mintType}
                        </span>
                      </td>
                      <td style={{
                        textAlign: 'center',
                        padding: '1rem',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.9rem',
                      }}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </td>
                      <td style={{
                        textAlign: 'center',
                        padding: '1rem',
                        fontFamily: 'var(--font-ui)',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}>
                          <button style={{
                            backgroundColor: 'transparent',
                            color: 'var(--color-blockchain-blue)',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                          </button>
                          {article.mintType === 'community' && !article.proposalCreated && (
                            <button style={{
                              backgroundColor: 'transparent',
                              color: 'var(--color-verification-green)',
                              border: 'none',
                              padding: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                              Propose
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {hasMore && (
              <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-black)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    padding: '0.5rem 1.5rem',
                    border: '1px solid var(--color-digital-silver)',
                    borderRadius: '4px',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More Publications'}
                </button>
              </div>
            )}
          </>
        )}
      </TokenGate>
    </div>
  );
}