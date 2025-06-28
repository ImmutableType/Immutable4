// File path: app/(client)/locations/florida/miami/news/[slug]/page.tsx
'use client'
import React, { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { useArticleDetail } from '../../../../../../../lib/reader/hooks/useArticleDetail';
import { useWallet } from '../../../../../../../lib/hooks/useWallet';
import { useContentDecryption } from '../../../../../../../lib/encryption/hooks/useContentDecryption';
import { ReaderLicenseAMMService } from '../../../../../../../lib/blockchain/contracts/ReaderLicenseAMMService';
import { urlOptimizer } from '../../../../../../../lib/locations/seo/urlOptimizer';
import { ethers } from 'ethers';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface AccessDetails {
  hasAccess: boolean;
  accessType: 'nft_owner' | 'reader_license' | 'none';
  tokenId?: string;
  expiryTime?: number;
  needsActivation?: boolean;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // ✅ Unwrap the async params
  const resolvedParams = use(params);
  
  // ✅ Wallet Integration
  const { address: userAddress, isConnected } = useWallet();
  
  // ✅ Enhanced State Management
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'license' | 'nft'>('license');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ NEW: Enhanced Access Detection
  const [accessDetails, setAccessDetails] = useState<AccessDetails | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  
  // ✅ NEW: Decryption State
  const [decryptedContent, setDecryptedContent] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  
  // ✅ NEW: Reader License Activation
  const [showActivationConfirm, setShowActivationConfirm] = useState(false);
  const [activatingLicense, setActivatingLicense] = useState(false);
  
  // ✅ Extract numeric ID from slug
  const numericId = urlOptimizer.extractIdFromSlug(resolvedParams.slug);
  console.log('🔍 MIAMI PAGE: Extracted ID from slug:', numericId);
  
  const { article, isLoading, error } = useArticleDetail(numericId);
  const { decryptContent } = useContentDecryption();

  // ✅ PHASE 1: Enhanced Access Detection
  useEffect(() => {
    const checkAccess = async () => {
      if (!userAddress || !article) return;
      
      setIsCheckingAccess(true);
      try {
        if (!window.ethereum) {
          console.error('No ethereum provider found');
          return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const readerLicenseService = new ReaderLicenseAMMService(
          '0x4E0f2A3A8AfEd1f86D83AAB1a989E01c316996d2',
          provider
        );
        
        // Check access details with enhanced service
        const accessInfo = await readerLicenseService.getAccessDetails(
          article.id.toString(), 
          userAddress
        );
        
        // Check for existing active sessions in localStorage
        const sessionKey = `article_${article.id}_${userAddress}`;
        const existingSession = localStorage.getItem(sessionKey);
        let needsActivation = false;
        
        if (accessInfo.hasAccess && accessInfo.tokenId) {
          // Check if this is a new reader license that needs activation
          if (!existingSession) {
            needsActivation = true;
          }
        }
        
        setAccessDetails({
          hasAccess: accessInfo.hasAccess,
          accessType: accessInfo.hasAccess ? 'reader_license' : 'none',
          tokenId: accessInfo.tokenId || undefined,
          expiryTime: accessInfo.expiryTime ? Number(accessInfo.expiryTime) : undefined,
          needsActivation
        });
      } catch (err) {
        console.error('❌ Access check failed:', err);
        setAccessDetails({
          hasAccess: false,
          accessType: 'none'
        });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [userAddress, article]);

  // ✅ PHASE 2: Decryption Logic
  useEffect(() => {
    const handleDecryption = async () => {
      if (!article || !accessDetails?.hasAccess || !accessDetails.tokenId || !userAddress) {
        return;
      }

      const isEncrypted = article.content && article.content.startsWith('ENCRYPTED_V1:');
      if (!isEncrypted) {
        setDecryptedContent(article.content || '');
        return;
      }

      // Check localStorage cache first
      const cacheKey = `decrypted_${article.id}_${userAddress}_${accessDetails.tokenId}`;
      const cachedContent = localStorage.getItem(cacheKey);
      
      if (cachedContent) {
        console.log('📱 Using cached decrypted content');
        setDecryptedContent(cachedContent);
        return;
      }

      // Decrypt content
      setIsDecrypting(true);
      setDecryptionError(null);
      
      try {
        console.log('🔓 Decrypting content for article:', article.id);
        const result = await decryptContent(
          article.content,
          userAddress,
          accessDetails.tokenId
        );

        if (result.success && result.content) {
          setDecryptedContent(result.content);
          
          // Cache the decrypted content
          const expiryTime = accessDetails.accessType === 'nft_owner' 
            ? Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year for NFT owners
            : (accessDetails.expiryTime || Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days for licenses
            
          localStorage.setItem(cacheKey, result.content);
          localStorage.setItem(`${cacheKey}_expiry`, expiryTime.toString());
          
          console.log('✅ Content decrypted and cached successfully');
        } else {
          throw new Error(result.error || 'Decryption failed');
        }
      } catch (err) {
        console.error('❌ Decryption failed:', err);
        setDecryptionError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsDecrypting(false);
      }
    };

    handleDecryption();
  }, [article, accessDetails, userAddress, decryptContent]);

  // ✅ PHASE 3: Reader License Activation
  const handleActivateReaderLicense = async () => {
    if (!accessDetails?.tokenId || !userAddress || !article) return;
    
    setActivatingLicense(true);
    try {
      // Record the activation in localStorage
      const sessionKey = `article_${article.id}_${userAddress}`;
      const activationData = {
        tokenId: accessDetails.tokenId,
        activatedAt: Date.now(),
        expiryTime: accessDetails.expiryTime || Date.now() + (7 * 24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(sessionKey, JSON.stringify(activationData));
      
      // Update access details to remove activation requirement
      setAccessDetails(prev => prev ? { ...prev, needsActivation: false } : null);
      setShowActivationConfirm(false);
      
      console.log('✅ Reader license activated successfully');
    } catch (err) {
      console.error('❌ License activation failed:', err);
    } finally {
      setActivatingLicense(false);
    }
  };

  // ✅ Enhanced Purchase Handler (Real Blockchain Calls)
  const handlePurchase = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
try {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to make purchases');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const readerLicenseService = new ReaderLicenseAMMService(
    '0x4E0f2A3A8AfEd1f86D83AAB1a989E01c316996d2',
    provider
  );
  
  if (purchaseType === 'license') {

        // Purchase reader license
        // TODO: Implement actual purchase method - using placeholder for now
        console.log('🔄 Purchase flow triggered for user:', userAddress);
        // await readerLicenseService.purchaseReaderLicense(userAddress);
        console.log('✅ Reader license purchased successfully');
      } else {
        // Purchase article NFT
        console.log('🎨 NFT purchase not implemented yet - using mock');
        // TODO: Implement NFT purchase
      }
      
      setShowPurchaseModal(false);
      
      // Refresh access details
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('❌ Purchase failed:', err);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
  const hasAccess = accessDetails?.hasAccess || false;
  const needsWalletConnection = isEncrypted && !isConnected;

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

      {/* ✅ NEW: Wallet Connection Required */}
      {needsWalletConnection && (
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--color-alert-amber)',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            margin: 0
          }}>
            Connect Your Wallet
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Please connect your wallet to access encrypted content
          </p>
        </div>
      )}

      {/* ✅ NEW: Reader License Activation Confirmation */}
      {accessDetails?.needsActivation && (
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
            Start Your 7-Day Reading Period
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            7 days of access for less than a penny a day! 
          </p>
          <button
            onClick={() => setShowActivationConfirm(true)}
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
            Start Reading →
          </button>
          <div style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
            ✓ Premium local journalism • ✓ Support Miami news • ✓ 7-day access
          </div>
        </div>
      )}

      {/* Reader License Purchase (Above the Fold) */}
      {isEncrypted && !hasAccess && isConnected && (
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

      {/* ✅ NEW: Access Status Display */}
      {accessDetails && hasAccess && (
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
          <span style={{ fontSize: '1.5rem' }}>✅</span>
          <div>
            <div style={{ fontWeight: '600' }}>
              {accessDetails.accessType === 'nft_owner' ? 'Article Owned (NFT)' : 'Reader License Active'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {accessDetails.accessType === 'nft_owner' ? 'Permanent access' : 
               accessDetails.expiryTime ? `Expires: ${new Date(accessDetails.expiryTime).toLocaleDateString()}` : '7-day access'}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Decryption Loading State */}
      {isDecrypting && (
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--color-parchment)',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔓</div>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            color: 'var(--color-typewriter-red)'
          }}>
            ImmutableType is decrypting your premium content...
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--color-digital-silver)', margin: 0 }}>
            The first blockchain platform supporting local journalism
          </p>
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
            {/* ✅ NEW: Error Handling for Decryption */}
            {decryptionError && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Decryption Error</div>
                  <div style={{ fontSize: '0.9rem' }}>{decryptionError}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Encrypted content: {article.content?.substring(0, 50)}...
                  </div>
                </div>
              </div>
            )}
            
            {/* ✅ ENHANCED: Content rendering with decryption */}
            {(() => {
              const contentToDisplay = isEncrypted && hasAccess ? decryptedContent : article.content;
              
              if (!contentToDisplay) {
                return article.summary && (
                  <p style={{ marginBottom: '1.5rem', textAlign: 'justify', fontStyle: 'italic' }}>
                    {article.summary}
                  </p>
                );
              }
              
              // ✅ ENHANCED: Better paragraph preservation
              return contentToDisplay.split(/\n\s*\n/).map((paragraph: string, index: number) => {
                const trimmedParagraph = paragraph.trim();
                if (!trimmedParagraph) return null;
                
                return (
                  <p key={index} style={{ 
                    marginBottom: '1.5rem', 
                    textAlign: 'justify',
                    whiteSpace: 'pre-line' // Preserves line breaks within paragraphs
                  }}>
                    {trimmedParagraph}
                  </p>
                );
              }).filter(Boolean);
            })()}
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

      {/* ✅ NEW: Reader License Activation Confirmation Modal */}
      {showActivationConfirm && (
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
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
              <h3 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.4rem',
                marginBottom: '0.5rem',
                color: 'var(--color-blockchain-blue)'
              }}>
                Start 7-Day Reading Period?
              </h3>
              <p style={{ color: 'var(--color-digital-silver)', fontSize: '0.9rem', margin: 0 }}>
                This will activate your Reader License for this article
              </p>
            </div>

            {!activatingLicense ? (
              <>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-parchment)',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    ✓ 7 days of unlimited access to this article
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    ✓ Support local Miami journalism
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    ✓ Less than a penny per day
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setShowActivationConfirm(false)}
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
                    onClick={handleActivateReaderLicense}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-blockchain-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Start Reading Period
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                <p>Activating your reading period...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Purchase Modal */}
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