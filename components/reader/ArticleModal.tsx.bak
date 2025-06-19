// File: components/reader/ArticleModal.tsx (updated version)
import React from 'react';
import { useArticleDetail } from '../../lib/reader/hooks/useArticleDetail';
import { useReaderEngagement } from '../../lib/reader/hooks/useReaderEngagement';

interface ArticleModalProps {
  articleId: string;
  onClose: () => void;
  proposalDetails?: any; // From proposal system
}

const ArticleModal: React.FC<ArticleModalProps> = ({ 
  articleId, 
  onClose,
  proposalDetails
}) => {
  // Mock user ID (would come from wallet connection)
  const userId = "0x7h8i9j0k1l2m3n4o5p";
  
  const { article, isLoading, error } = useArticleDetail(articleId);
  const { engagement, addVote, addTip } = useReaderEngagement(articleId, userId);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  // Render markdown content
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '6px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.2rem' }}>
            Loading article...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !article) {
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '6px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ fontFamily: 'var(--font-headlines)' }}>Error</h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-typewriter-red)' }}>
            {error || 'Unable to load article'}
          </div>
        </div>
      </div>
    );
  }

  // Render article content
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: '6px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          ×
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
                  target="_blank"
                  rel="noopener noreferrer"
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
              onClick={() => addVote('emoji', '👍')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: engagement.userVote?.emoji === '👍' ? 'var(--color-parchment)' : 'transparent',
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
              onClick={() => addVote('emoji', '🧠')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: engagement.userVote?.emoji === '🧠' ? 'var(--color-parchment)' : 'transparent',
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
              onClick={() => addVote('emoji', '🔥')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: engagement.userVote?.emoji === '🔥' ? 'var(--color-parchment)' : 'transparent',
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

          {/* Tipping */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              fontFamily: 'var(--font-ui)', 
              fontSize: '1rem',
              fontWeight: 500,
              marginBottom: '0.75rem'
            }}>
              Support the author with a tip
            </h4>
            <div style={{ 
              display: 'flex',
              marginBottom: '0.75rem'
            }}>
              <button 
                onClick={() => addTip(0.01)}
                style={{
                  backgroundColor: 'var(--color-typewriter-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  marginRight: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                Tip 0.01 ETH
              </button>
              <button 
                onClick={() => addTip(0.05)}
                style={{
                  backgroundColor: 'var(--color-typewriter-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  marginRight: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                Tip 0.05 ETH
              </button>
              <button 
                onClick={() => addTip(0.1)}
                style={{
                  backgroundColor: 'var(--color-typewriter-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500
                }}
              >
                Tip 0.1 ETH
              </button>
            </div>
            <div style={{ 
              fontFamily: 'var(--font-ui)', 
              fontSize: '0.85rem',
              color: 'var(--color-digital-silver)'
            }}>
              {engagement.hasTipped 
                ? 'Thanks for supporting this author!' 
                : 'Tips go directly to the author\'s wallet. Connect your wallet to tip.'}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          marginTop: '1rem',
          borderTop: '1px solid var(--color-digital-silver)',
          paddingTop: '1rem'
        }}>
          {article.tags.map((tag, index) => (
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
};

export default ArticleModal;