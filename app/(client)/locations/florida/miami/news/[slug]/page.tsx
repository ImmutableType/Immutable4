'use client'
import React, { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { useArticleDetail } from '../../../../../../../lib/reader/hooks/useArticleDetail';
import { urlOptimizer } from '../../../../../../../lib/locations/seo/urlOptimizer';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // ✅ FIX: Unwrap the async params
  const resolvedParams = use(params);
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'license' | 'nft'>('license');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasReaderLicense, setHasReaderLicense] = useState(false);
  
  // ✅ FIX: Extract just the numeric ID, no prefixes
  const numericId = urlOptimizer.extractIdFromSlug(resolvedParams.slug);
  console.log('🔍 MIAMI PAGE: Extracted ID from slug:', numericId);
  
  const { article, isLoading, error } = useArticleDetail(numericId);

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPurchaseModal(false);
      setHasReaderLicense(true);
    }, 2000);
  };
  
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏖️</div>
        <div>Loading Miami article from blockchain...</div>
      </div>
    );
  }
  
  if (error || !article) return notFound();

  const isEncrypted = article.content && article.content.startsWith('ENCRYPTED_V1:');
  const hasAccess = hasReaderLicense || article.hasAccess;

  return (
    <div style={{ padding: '1rem', maxWidth: '100%' }}>
      {/* Article Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            backgroundColor: 'var(--color-verification-green)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            MIAMI
          </span>
          <span style={{
            backgroundColor: 'var(--color-blockchain-blue)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            {article.category.toUpperCase()}
          </span>
          <span style={{ color: 'var(--color-digital-silver)', fontSize: '0.9rem' }}>
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          lineHeight: '1.2',
          marginBottom: '1rem',
          color: 'var(--color-black)'
        }}>
          {article.title}
        </h1>
        
        <div style={{
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-digital-silver)',
          marginBottom: '2rem'
        }}>
          <strong>By {article.authorName || article.author}</strong>
          <span style={{ color: 'var(--color-digital-silver)', marginLeft: '0.5rem' }}>
            ({article.authorType})
          </span>
          {article.contentHash && (
            <span style={{
              backgroundColor: 'var(--color-verification-green)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginLeft: '1rem'
            }}>
              ✓ VERIFIED
            </span>
          )}
        </div>
      </header>

      {/* Reader License Purchase (Above the Fold) */}
      {isEncrypted && !hasAccess && (
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--color-blockchain-blue)',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            margin: 0
          }}>
            Quick Reader License
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Unlock this article for 7 days with a micro-payment
          </p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            $0.15 FLOW
          </div>
          <button
            onClick={() => {
              setPurchaseType('license');
              setShowPurchaseModal(true);
            }}
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-blockchain-blue)',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)'
            }}
          >
            Unlock Article Now →
          </button>
          <div style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
            ✓ Instant access • ✓ Support local journalism • ✓ No subscription
          </div>
        </div>
      )}

      {/* Article Content */}
      <main>
        {isEncrypted && !hasAccess ? (
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--color-parchment)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2rem' }}>🔐</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                  color: 'var(--color-typewriter-red)'
                }}>
                  Encrypted Premium Content
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-digital-silver)', margin: 0 }}>
                  This article contains exclusive insights worth unlocking
                </p>
              </div>
            </div>

            {article.summary && (
              <div style={{
                fontSize: '1.2rem',
                lineHeight: '1.6',
                color: 'var(--color-black)',
                fontStyle: 'italic',
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--color-white)',
                borderRadius: '8px'
              }}>
                <strong>What you'll discover:</strong> {article.summary}
              </div>
            )}

            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-white)',
              padding: '1.5rem',
              borderRadius: '8px',
              position: 'relative'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                Miami-Dade County stands as one of the most hurricane-vulnerable regions in the United States, with its unique geographic position making it a frequent target for Atlantic basin storms.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                The 2024 hurricane season brings new challenges and updated emergency protocols that every resident should understand. From evacuation routes to supply preparation, this comprehensive guide covers...
              </p>
              
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(transparent, var(--color-white) 80%)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-digital-silver)', fontStyle: 'italic' }}>
                  Continue reading with premium access...
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-black)' }}>
            {hasAccess && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--color-verification-green)',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>��</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Article Unlocked Successfully</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Reader license active</div>
                </div>
              </div>
            )}
            
            {/* ✅ FIX: Better content rendering */}
            {article.content && article.content.split('\n').map((paragraph: string, index: number) => (
              paragraph.trim() && (
                <p key={index} style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>
                  {paragraph}
                </p>
              )
            ))}
            
            {/* ✅ Show summary if no content */}
            {!article.content && article.summary && (
              <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontStyle: 'italic' }}>
                {article.summary}
              </p>
            )}
          </div>
        )}
      </main>

      {/* NFT Collection Upsell */}
      <div style={{
        padding: '2rem',
        backgroundColor: 'var(--color-typewriter-red)',
        color: 'white',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginBottom: '1rem',
          margin: 0
        }}>
          Collect This Article as NFT
        </h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          Own this article forever • Tradeable digital collectible
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          $3.50 FLOW
        </div>
        <button
          onClick={() => {
            setPurchaseType('nft');
            setShowPurchaseModal(true);
          }}
          style={{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-typewriter-red)',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)'
          }}
        >
          Collect Forever →
        </button>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
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
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                {purchaseType === 'license' ? '⚡' : '🎨'}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.4rem',
                marginBottom: '0.5rem',
                color: purchaseType === 'license' ? 'var(--color-blockchain-blue)' : 'var(--color-typewriter-red)'
              }}>
                {purchaseType === 'license' ? 'Unlock Article' : 'Collect as NFT'}
              </h3>
              <p style={{ color: 'var(--color-digital-silver)', fontSize: '0.9rem', margin: 0 }}>
                {purchaseType === 'license' ? 
                  '7-day access for just a few cents' :
                  'Own this article forever as an NFT'
                }
              </p>
            </div>

            {!isProcessing ? (
              <>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-parchment)',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Article Access:</span>
                    <span style={{ fontWeight: '500' }}>
                      {purchaseType === 'license' ? '$0.15' : '$3.50'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-digital-silver)' }}>
                    <span>Network fee:</span>
                    <span>~$0.02</span>
                  </div>
                  <hr style={{ margin: '0.75rem 0', border: '1px solid var(--color-digital-silver)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span>{purchaseType === 'license' ? '$0.17' : '$3.52'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '2px solid var(--color-digital-silver)',
                      backgroundColor: 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      backgroundColor: purchaseType === 'license' ? 'var(--color-blockchain-blue)' : 'var(--color-typewriter-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {purchaseType === 'license' ? 'Unlock Now' : 'Collect NFT'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                <p>Processing your purchase...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
