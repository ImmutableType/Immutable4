// components/article/EncryptionGate.tsx (ENHANCED - NFT + READER LICENSE + SPY DECRYPTION)
'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Article } from '../../lib/reader/types/article';
import { useWallet } from '../../lib/hooks/useWallet';
import { useContentDecryption } from '../../lib/encryption/hooks/useContentDecryption';
import { ReaderLicenseAMMService, LicenseAccess } from '../../lib/blockchain/contracts/ReaderLicenseAMMService';

interface EncryptionGateProps {
  article: Article;
  onDecrypt?: (success: boolean) => void;
}

const EncryptionGate: React.FC<EncryptionGateProps> = ({ article, onDecrypt }) => {
  const { address: userAddress, isConnected, connect } = useWallet();
  const { decryptContent } = useContentDecryption();
  
  // Enhanced State Management
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Access Detection State
  const [accessDetails, setAccessDetails] = useState<LicenseAccess | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  
  // Decryption State
  const [decryptedContent, setDecryptedContent] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  
  // ✨ NEW: Holographic Decryption UI State
  const [decryptionPhase, setDecryptionPhase] = useState<'hidden' | 'initializing' | 'verifying' | 'decrypting' | 'success' | 'collapse'>('hidden');
  const [showDecryptionPanel, setShowDecryptionPanel] = useState(false);
  
  // Reader License Activation
  const [showActivationConfirm, setShowActivationConfirm] = useState(false);
  const [activatingLicense, setActivatingLicense] = useState(false);
  
  // Purchase Infrastructure
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [licenseSellers, setLicenseSellers] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const [licenseService, setLicenseService] = useState<ReaderLicenseAMMService | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const service = new ReaderLicenseAMMService(undefined, provider);
      setLicenseService(service);
    }
  }, []);

  // Access Detection
  useEffect(() => {
    const checkAccess = async () => {
      if (!userAddress || !article || !licenseService) return;
      
      setIsCheckingAccess(true);
      try {
        const numericId = article.id.toString().replace(/[^0-9]/g, '');
        const accessInfo = await licenseService.getAccessDetails(numericId, userAddress);
        setAccessDetails(accessInfo);

        if (!accessInfo.hasAccess) {
          await fetchLicenseInfo();
        }
      } catch (err) {
        console.error('❌ Access check failed:', err);
        setAccessDetails({ hasAccess: false, accessType: 'none' });
        await fetchLicenseInfo();
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [userAddress, article, licenseService]);

  // ✨ ENHANCED: Decryption with Holographic UI
  useEffect(() => {
    const handleDecryption = async () => {
      if (!article || !accessDetails?.hasAccess || !accessDetails.tokenId || !userAddress) {
        return;
      }

      if (accessDetails.needsActivation && accessDetails.accessType !== 'nft_owner') {
        return;
      }

      const isEncrypted = article.content && article.content.startsWith('ENCRYPTED_V1:');
      if (!isEncrypted) {
        setDecryptedContent(article.content || '');
        return;
      }

      // Check cache first
      const cacheKey = `decrypted_${article.id}_${userAddress}_${accessDetails.tokenId}`;
      const cachedContent = localStorage.getItem(cacheKey);
      
      if (cachedContent) {
        setDecryptedContent(cachedContent);
        onDecrypt?.(true);
        return;
      }

      // ✨ START HOLOGRAPHIC DECRYPTION SEQUENCE
      setShowDecryptionPanel(true);
      setDecryptionPhase('initializing');
      
      // Phase progression with timing
      setTimeout(() => setDecryptionPhase('verifying'), 50);
      setTimeout(() => setDecryptionPhase('decrypting'), 150);
      
      setIsDecrypting(true);
      setDecryptionError(null);
      
      try {
        const result = await decryptContent(
          article.content,
          article.id.toString(),
          accessDetails.tokenId
        );

        if (result.success && result.content) {
          setDecryptedContent(result.content);
          
          // Cache the content
          const expiryTime = accessDetails.accessType === 'nft_owner' 
            ? Date.now() + (365 * 24 * 60 * 60 * 1000)
            : (accessDetails.expiryTime ? Number(accessDetails.expiryTime) * 1000 : Date.now() + (7 * 24 * 60 * 60 * 1000));
            
          localStorage.setItem(cacheKey, result.content);
          localStorage.setItem(`${cacheKey}_expiry`, expiryTime.toString());
          
          // ✨ SUCCESS PHASE
          setDecryptionPhase('success');
          setTimeout(() => {
            setDecryptionPhase('collapse');
            setTimeout(() => setShowDecryptionPanel(false), 300);
          }, window.innerWidth <= 768 ? 300 : 500); // Faster on mobile
          
          onDecrypt?.(true);
        } else {
          throw new Error(result.error || 'Decryption failed');
        }
      } catch (err) {
        console.error('❌ Decryption failed:', err);
        setDecryptionError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setShowDecryptionPanel(false);
      } finally {
        setIsDecrypting(false);
      }
    };

    handleDecryption();
  }, [article, accessDetails, userAddress, decryptContent, onDecrypt]);

  const fetchLicenseInfo = async () => {
    if (!licenseService || !article) return;

    try {
      const articleId = article.id.toString().replace(/[^0-9]/g, '');
      const price = await licenseService.getCurrentPrice(articleId);
      setCurrentPrice(ethers.formatEther(price));
      const { holders } = await licenseService.getLicenseHolders(articleId);
      setLicenseSellers(holders.filter(holder => holder !== userAddress));
    } catch (error) {
      console.error('Error fetching license info:', error);
      setCurrentPrice('0.05');
      setLicenseSellers([]);
    }
  };

  // ✨ HOLOGRAPHIC DECRYPTION PANEL COMPONENT
  const DecryptionPanel = () => {
    if (!showDecryptionPanel) return null;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    const getPhaseContent = () => {
      switch (decryptionPhase) {
        case 'initializing':
          return {
            icon: '🔐',
            title: 'CLASSIFIED CONTENT DETECTED',
            subtitle: 'Initializing decryption protocol...',
            progress: 20
          };
        case 'verifying':
          return {
            icon: '🔍',
            title: 'VERIFYING CREDENTIALS',
            subtitle: `${accessDetails?.accessType === 'nft_owner' ? 'NFT ownership' : 'Reader license'} confirmed`,
            progress: 60
          };
        case 'decrypting':
          return {
            icon: '⚡',
            title: 'DECRYPTION ACTIVE',
            subtitle: 'ChaCha20-Poly1305 encryption unlocked',
            progress: 90
          };
        case 'success':
          return {
            icon: '🎯',
            title: 'MISSION ACCOMPLISHED',
            subtitle: 'Premium content unlocked',
            progress: 100
          };
        default:
          return {
            icon: '🔐',
            title: 'CLASSIFIED CONTENT',
            subtitle: 'Initializing...',
            progress: 0
          };
      }
    };

    const { icon, title, subtitle, progress } = getPhaseContent();

    return (
      <div style={{
        position: 'relative',
        margin: '2rem 0',
        padding: isMobile ? '1.5rem' : '2rem',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        fontFamily: '"Courier New", monospace',
        color: '#1e3a8a',
        transform: decryptionPhase === 'collapse' ? 'scaleY(0)' : 'scaleY(1)',
        transformOrigin: 'top',
        transition: 'transform 0.3s ease-out',
        overflow: 'hidden'
      }}>
        {/* Corner brackets for spy aesthetic */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          borderTop: '2px solid #3b82f6',
          borderLeft: '2px solid #3b82f6'
        }} />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderTop: '2px solid #3b82f6',
          borderRight: '2px solid #3b82f6'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          borderBottom: '2px solid #3b82f6',
          borderLeft: '2px solid #3b82f6'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderBottom: '2px solid #3b82f6',
          borderRight: '2px solid #3b82f6'
        }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1rem' }}>
            {icon}
          </div>
          <div style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            letterSpacing: '1px'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            opacity: 0.8,
            marginBottom: '1.5rem'
          }}>
            {subtitle}
          </div>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }} />
          </div>
        </div>
      </div>
    );
  };

  const handleActivateReaderLicense = async () => {
    if (!accessDetails?.tokenId || !userAddress || !article) return;
    
    setActivatingLicense(true);
    try {
      const sessionKey = `article_${article.id}_${userAddress}`;
      const activationData = {
        tokenId: accessDetails.tokenId,
        activatedAt: Date.now(),
        expiryTime: accessDetails.expiryTime ? Number(accessDetails.expiryTime) * 1000 : Date.now() + (7 * 24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem(sessionKey, JSON.stringify(activationData));
      setAccessDetails(prev => prev ? { ...prev, needsActivation: false } : null);
      setShowActivationConfirm(false);
    } catch (err) {
      console.error('❌ License activation failed:', err);
    } finally {
      setActivatingLicense(false);
    }
  };

  const handleRealPurchase = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!licenseService || !userAddress) {
      setError('Wallet not properly connected');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const articleId = article.id.toString().replace(/[^0-9]/g, '');

      if (licenseSellers.length === 0) {
        throw new Error('No licenses available for purchase');
      }

      const buyTx = await licenseService.buyLicense(articleId, licenseSellers[0], signer);
      await buyTx.wait();

      const burnTx = await licenseService.burnLicenseForAccess(articleId, signer);
      await burnTx.wait();

      setShowPurchaseModal(false);
      setIsProcessing(false);
      
      setTimeout(async () => {
        if (licenseService) {
          const updatedAccess = await licenseService.getAccessDetails(articleId, userAddress);
          setAccessDetails(updatedAccess);
        }
      }, 2000);

    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      setError(error.message || 'Purchase failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // ✨ ENHANCED: Content Display with Decryption Panel
  if (accessDetails?.hasAccess && !accessDetails.needsActivation) {
    return (
      <main style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {/* ✨ Holographic Decryption Panel */}
        <DecryptionPanel />

        {/* Enhanced Access Status Display */}
        <div style={{
          padding: '1rem',
          backgroundColor: accessDetails.accessType === 'nft_owner' ? '#1D7F6E' : 'var(--color-verification-green)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {accessDetails.accessType === 'nft_owner' ? '🎨' : '✅'}
          </span>
          <div>
            <div style={{ fontWeight: '600' }}>
              {accessDetails.accessType === 'nft_owner' ? 'NFT Owner - Permanent Access' : 'Reader License Active'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {accessDetails.accessType === 'nft_owner' ? 'You own this article as an NFT' : 
               accessDetails.expiryTime ? `Expires: ${new Date(Number(accessDetails.expiryTime) * 1000).toLocaleDateString()}` : '7-day access'}
            </div>
          </div>
        </div>

        {/* Error Handling */}
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
            </div>
          </div>
        )}

        {/* Decrypted Content Display */}
        <div style={{
          fontSize: '1.125rem',
          lineHeight: '1.8',
          color: 'var(--color-black)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {(() => {
            const isEncrypted = article.content && article.content.startsWith('ENCRYPTED_V1:');
            const contentToDisplay = isEncrypted ? decryptedContent : article.content;
            
            if (!contentToDisplay) {
              return article.summary && (
                <p style={{ 
                  marginBottom: '1.5rem', 
                  textAlign: 'justify', 
                  fontStyle: 'italic',
                  color: '#333333' // ✨ FIXED: Better contrast for summary
                }}>
                  {article.summary}
                </p>
              );
            }
            
            return contentToDisplay.split(/\n\s*\n/).map((paragraph: string, index: number) => {
              const trimmedParagraph = paragraph.trim();
              if (!trimmedParagraph) return null;
              
              return (
                <p key={index} style={{ 
                  marginBottom: '1.5rem', 
                  textAlign: 'justify',
                  whiteSpace: 'pre-line'
                }}>
                  {trimmedParagraph}
                </p>
              );
            }).filter(Boolean);
          })()}
        </div>
      </main>
    );
  }

  // Reader License Activation
  if (accessDetails?.needsActivation) {
    return (
      <>
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
            Activate Your Reader License
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Start your 7-day reading period for this article
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
        </div>

        {/* Activation Confirmation Modal */}
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
              </div>

              {!activatingLicense ? (
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
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                  <p>Activating your reading period...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // ✨ ENHANCED: Encryption Gate for Locked Content
  return (
    <main style={{ 
      wordBreak: 'break-word', 
      overflowWrap: 'break-word',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#a00'
        }}>
          {error}
        </div>
      )}

      {/* Enhanced Encryption Gate */}
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
              Premium Content
            </h3>
            <p style={{ fontSize: '1rem', color: '#666666', margin: 0 }}> {/* ✨ FIXED: Better contrast */}
              Unlock with Reader License or NFT ownership
            </p>
          </div>
        </div>

        {article.summary && (
          <div style={{
            fontSize: '1.125rem',
            lineHeight: '1.6',
            color: '#333333', // ✨ FIXED: Better contrast for summary
            fontStyle: 'italic',
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-white)',
            borderRadius: '8px'
          }}>
            <strong>What you'll discover:</strong> {article.summary}
          </div>
        )}

        {/* Purchase Section */}
        <div style={{ textAlign: 'center' }}>
          {!isConnected ? (
            <button
              onClick={handleWalletConnect}
              style={{
                backgroundColor: 'var(--color-blockchain-blue)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)'
              }}
            >
              Connect Wallet to Purchase
            </button>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {currentPrice && parseFloat(currentPrice) > 0 ? 
                  `${parseFloat(currentPrice).toFixed(3)} FLOW` : 
                  'Loading price...'
                }
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                disabled={licenseSellers.length === 0}
                style={{
                  backgroundColor: licenseSellers.length > 0 ? 'var(--color-blockchain-blue)' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: licenseSellers.length > 0 ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-ui)'
                }}
              >
                {licenseSellers.length > 0 ? 'Purchase 7-Day Access' : 'No Licenses Available'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal (unchanged for brevity) */}
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
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
              <h3 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.4rem',
                marginBottom: '0.5rem',
                color: 'var(--color-blockchain-blue)'
              }}>
                Purchase Reader License
              </h3>
              <p style={{ color: '#666666', fontSize: '0.9rem', margin: 0 }}> {/* ✨ FIXED: Better contrast */}
                7-day access to this article
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
                    <span>License Cost:</span>
                    <span style={{ fontWeight: '500' }}>
                      {currentPrice ? `${parseFloat(currentPrice).toFixed(3)} FLOW` : 'Loading...'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666666' }}>
                    <span>Gas fee:</span>
                    <span>~0.005 FLOW</span>
                  </div>
                  <hr style={{ margin: '0.75rem 0', border: '1px solid var(--color-digital-silver)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span>
                      {currentPrice ? 
                        `${(parseFloat(currentPrice) + 0.005).toFixed(3)} FLOW` : 
                        'Calculating...'
                      }
                    </span>
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
                    onClick={handleRealPurchase}
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
                    Purchase Access
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                <p>Processing your purchase...</p>
                <p style={{ fontSize: '0.9rem', color: '#666666' }}>
                  Confirming on Flow blockchain
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default EncryptionGate;