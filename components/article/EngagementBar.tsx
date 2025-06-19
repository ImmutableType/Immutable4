// components/article/EngagementBar.tsx
'use client';
import React, { useState } from 'react';
import { Article } from '../../lib/reader/types/article';

interface EngagementBarProps {
  article: Article;
  onEmojiReaction?: (emoji: string) => void;
  onTip?: (amount: number) => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

const EngagementBar: React.FC<EngagementBarProps> = ({
  article,
  onEmojiReaction,
  onTip,
  onBookmark,
  onShare
}) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState(1);

  const emojiReactions = [
    { emoji: '👍', label: 'Like', count: 42 },
    { emoji: '🧠', label: 'Insightful', count: 28 },
    { emoji: '🔥', label: 'Hot Take', count: 15 },
    { emoji: '💡', label: 'Eye Opening', count: 33 }
  ];

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji);
    onEmojiReaction?.(emoji);
    
    // Visual feedback
    setTimeout(() => setSelectedEmoji(null), 1000);
  };

  return (
    <div style={{
      position: 'sticky',
      top: '2rem',
      backgroundColor: 'var(--color-white)',
      border: '1px solid var(--color-digital-silver)',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '2rem 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      {/* Emoji Reactions */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-black)'
        }}>
          React to this article
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        }}>
          {emojiReactions.map(({ emoji, label, count }) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: `2px solid ${selectedEmoji === emoji ? 'var(--color-verification-green)' : 'var(--color-digital-silver)'}`,
                borderRadius: '8px',
                backgroundColor: selectedEmoji === emoji ? 'rgba(29, 127, 110, 0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => {
                if (selectedEmoji !== emoji) {
                  e.currentTarget.style.borderColor = 'var(--color-blockchain-blue)';
                  e.currentTarget.style.backgroundColor = 'rgba(43, 57, 144, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedEmoji !== emoji) {
                  e.currentTarget.style.borderColor = 'var(--color-digital-silver)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
              <div>
                <div style={{ fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-digital-silver)' }}>
                  {count}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip Author */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-black)'
        }}>
          Support the author
        </h4>
        <button
          onClick={() => setShowTipModal(true)}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--color-typewriter-red)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: '500',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#8C1A17';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>☕</span>
          Tip with FLOW
        </button>
      </div>

      {/* Share & Bookmark */}
      <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          onClick={onBookmark}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '2px solid var(--color-blockchain-blue)',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            color: 'var(--color-blockchain-blue)',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <span>🔖</span>
          Save
        </button>
        <button
          onClick={onShare}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '2px solid var(--color-blockchain-blue)',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            color: 'var(--color-blockchain-blue)',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          <span>📤</span>
          Share
        </button>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ☕ Tip the Author
            </h3>
            <p style={{
              color: 'var(--color-digital-silver)',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Support {article.authorName || 'this journalist'} directly with FLOW
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '2rem'
            }}>
              {[1, 2, 5].map(amount => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${tipAmount === amount ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                    backgroundColor: tipAmount === amount ? 'rgba(179, 33, 30, 0.1)' : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                >
                  {amount} FLOW
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-digital-silver)', marginTop: '0.25rem' }}>
                    ~${(amount * 0.65).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowTipModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid var(--color-digital-silver)',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTip?.(tipAmount);
                  setShowTipModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-typewriter-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Send Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementBar;