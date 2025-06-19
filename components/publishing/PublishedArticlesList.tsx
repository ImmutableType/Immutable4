// components/publishing/PublishedArticlesList.tsx
import React from 'react';
import Link from 'next/link';
import { PublishedArticle } from '../../lib/publishing/types/publishedArticle';

interface PublishedArticlesListProps {
  articles: PublishedArticle[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  showViewButton?: boolean;
  showCreateProposalButton?: boolean;
  onCreateProposal?: (articleId: string) => void;
}

const PublishedArticlesList: React.FC<PublishedArticlesListProps> = ({
  articles,
  isLoading,
  error,
  hasMore,
  loadMore,
  showViewButton = true,
  showCreateProposalButton = true,
  onCreateProposal
}) => {
  if (isLoading && articles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Loading publications...
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
        Error: {error.message}
      </div>
    );
  }
  
  if (articles.length === 0) {
    return (
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
          No Publications Found
        </h3>
        <p style={{
          fontSize: '1rem',
          margin: 0,
        }}>
          There are no published articles to display.
        </p>
      </div>
    );
  }
  
  return (
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
                    {showViewButton && (
                      <Link href={`/reader/${article.id}`}>
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
                      </Link>
                    )}
                    
                    {showCreateProposalButton && 
                     article.mintType === 'community' && 
                     !article.proposalCreated && 
                     onCreateProposal && (
                      <button 
                        onClick={() => onCreateProposal(article.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-verification-green)',
                          border: 'none',
                          padding: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
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
  );
};

export default PublishedArticlesList;