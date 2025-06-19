// components/publishing/EncryptionStatus.tsx
'use client'

import React from 'react';

interface EncryptionStatusProps {
  isEncrypting: boolean;
  encryptedContentLength: number;
  title: string;
}

const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  isEncrypting,
  encryptedContentLength,
  title
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-parchment)',
      borderRadius: '4px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid var(--color-digital-silver)',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '1.2rem',
        margin: '0 0 1rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <circle cx="12" cy="16" r="1"></circle>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Content Encryption
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        alignItems: 'center',
      }}>
        <div>
          <p style={{
            fontSize: '0.95rem',
            margin: '0 0 0.5rem 0',
            fontWeight: 'bold',
            color: 'var(--color-black)',
          }}>
            Article: "{title}"
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: 'var(--color-black)',
            opacity: 0.8,
          }}>
            {isEncrypting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid var(--color-digital-silver)',
                  borderTop: '2px solid var(--color-typewriter-red)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <span>Encrypting content...</span>
              </>
            ) : encryptedContentLength > 0 ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--color-verification-green)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>Content successfully encrypted</span>
              </>
            ) : (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'var(--color-digital-silver)',
                  borderRadius: '50%',
                }} />
                <span>Ready to encrypt</span>
              </>
            )}
          </div>
          
          {encryptedContentLength > 0 && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-black)',
              opacity: 0.6,
            }}>
              Encrypted size: {encryptedContentLength} bytes
            </div>
          )}
        </div>
        
        {/* Encryption Status Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {isEncrypting ? (
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid var(--color-digital-silver)',
              borderTop: '4px solid var(--color-typewriter-red)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          ) : encryptedContentLength > 0 ? (
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-verification-green)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          ) : (
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-digital-silver)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Encryption Details */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '4px',
        fontSize: '0.85rem',
        color: 'var(--color-black)',
        opacity: 0.8,
      }}>
        <h4 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '0.95rem',
          margin: '0 0 0.5rem 0',
        }}>
          Encryption Details
        </h4>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          <li>• Content encrypted before blockchain storage</li>
          <li>• Only license holders can access full article</li>
          <li>• Summary remains publicly visible</li>
          <li>• Decryption keys managed through reader licenses</li>
        </ul>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EncryptionStatus;