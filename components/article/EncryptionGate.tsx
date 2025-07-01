// components/article/EncryptionGate.tsx - NFT BANNER MOVED TO BOTTOM
'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Article } from '../../lib/reader/types/article';
import { useWallet } from '../../lib/hooks/useWallet';
import { useContentDecryption } from '../../lib/encryption/hooks/useContentDecryption';
import { ReaderLicenseAMMService, LicenseAccess } from '../../lib/blockchain/contracts/ReaderLicenseAMMService';

interface JournalistInfo {
  name: string;
  bio: string;
  profileUrl: string;
  walletAddress: string;
  memberSince: string;
  hasProfile: boolean;
}

interface EncryptionGateProps {
  article: Article;
  onDecrypt?: (success: boolean) => void;
  journalistInfo?: JournalistInfo | null;
}

const EncryptionGate: React.FC<EncryptionGateProps> = ({ 
  article, 
  onDecrypt, 
  journalistInfo
}) => {
  const { address: userAddress, isConnected, connect } = useWallet();
  const { decryptContent } = useContentDecryption();
  
  // Basic State Management
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Access Detection State
  const [accessDetails, setAccessDetails] = useState<LicenseAccess | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  
  // Decryption State
  const [decryptedContent, setDecryptedContent] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  
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
        console.log('🔍 ENCRYPTION GATE: Checking access for article:', numericId, 'user:', userAddress);
        
        const accessInfo = await licenseService.getAccessDetails(numericId, userAddress);
        console.log('🔍 ENCRYPTION GATE: Access result:', accessInfo);
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

  // Simple Decryption Logic
  useEffect(() => {
    const handleDecryption = async () => {
      if (!article || !accessDetails?.hasAccess || !accessDetails.tokenId || !userAddress) {
        return;
      }

      if (accessDetails.needsActivation && accessDetails.accessType !== 'nft_owner') {
        console.log('🔓 Reader license needs activation - skipping auto-decryption');
        return;
      }

      const isEncrypted = article.content && article.content.startsWith('ENCRYPTED_V1:');
      if (!isEncrypted) {
        console.log('📄 Content not encrypted, using plain content');
        setDecryptedContent(article.content || '');
        // ADDED: notify parent that content is accessible
        onDecrypt?.(true);
        return;
      }

      // Check localStorage cache first
      const cacheKey = `decrypted_${article.id}_${userAddress}_${accessDetails.tokenId}`;
      const cachedContent = localStorage.getItem(cacheKey);
      
      if (cachedContent) {
        console.log('📱 Using cached decrypted content');
        setDecryptedContent(cachedContent);
        onDecrypt?.(true);
        return;
      }

      setIsDecrypting(true);
      setDecryptionError(null);
      
      try {
        console.log('🔓 Decrypting content for article:', article.id);
        
        const result = await decryptContent(
          article.content,
          article.id.toString(),
          accessDetails.tokenId
        );

        if (result.success && result.content) {
          setDecryptedContent(result.content);
          
          // Cache the decrypted content
          const expiryTime = accessDetails.accessType === 'nft_owner' 
            ? Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year for NFT owners
            : (accessDetails.expiryTime ? Number(accessDetails.expiryTime) * 1000 : Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days for licenses
            
          localStorage.setItem(cacheKey, result.content);
          localStorage.setItem(`${cacheKey}_expiry`, expiryTime.toString());
          
          console.log('✅ Content decrypted and cached successfully');
          onDecrypt?.(true);
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
  }, [article, accessDetails, userAddress, decryptContent, onDecrypt]);

  // ADDED: Notify parent when we have access and are showing content
  useEffect(() => {
    if (accessDetails?.hasAccess && !accessDetails.needsActivation) {
      onDecrypt?.(true);
    }
  }, [accessDetails, onDecrypt]);

  const fetchLicenseInfo = async () => {
    if (!licenseService || !article) return;

    try {
      const articleId = article.id.toString().replace(/[^0-9]/g, '');
      
      // Get current price
      const price = await licenseService.getCurrentPrice(articleId);
      setCurrentPrice(ethers.formatEther(price));

      // Get available license sellers
      const { holders } = await licenseService.getLicenseHolders(articleId);
      setLicenseSellers(holders.filter(holder => holder !== userAddress));
    } catch (error) {
      console.error('Error fetching license info:', error);
      setCurrentPrice('0.05'); // Fallback price
      setLicenseSellers([]);
    }
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
      
      console.log('✅ Reader license activated successfully');
    } catch (err) {
      console.error('❌ License activation failed:', err);
    } finally {
      setActivatingLicense(false);
    }
  };

  const handlePurchase = async () => {
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

      console.log('🔄 Starting purchase flow for article:', articleId);
      
      // Step 1: Buy license from first available seller
      console.log('💰 Purchasing license from:', licenseSellers[0]);
      const buyTx = await licenseService.buyLicense(articleId, licenseSellers[0], signer);
      console.log('✅ Purchase transaction sent:', buyTx.hash);
      
      await buyTx.wait();
      console.log('✅ Purchase confirmed');

      // Step 2: Burn license for 7-day access
      console.log('🔥 Burning license for access...');
      const burnTx = await licenseService.burnLicenseForAccess(articleId, signer);
      console.log('✅ Burn transaction sent:', burnTx.hash);
      
      await burnTx.wait();
      console.log('✅ Burn confirmed - access granted');

      setShowPurchaseModal(false);
      setIsProcessing(false);
      
      // Re-check access after successful purchase
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

  // ✅ IF USER HAS ACCESS - SHOW DECRYPTED CONTENT
  if (accessDetails?.hasAccess && !accessDetails.needsActivation) {
    return (
      <main style={{ 
        wordBreak: 'break-word', 
        overflowWrap: 'break-word',
        maxWidth: '65ch',
        margin: '0 auto'
      }}>
        {/* Simple Decryption Loading State */}
        {isDecrypting && (
          <div style={{
            padding: '2rem',
            backgroundColor: '#f4f1e8',
            borderRadius: '12px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔓</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#B3211E' }}>
              Decrypting your content...
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>
              {accessDetails.accessType === 'nft_owner' ? 'NFT ownership verified' : 'Reader license validated'}
            </p>
          </div>
        )}

        {/* Error Handling for Decryption */}
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

        {/* ✅ CONTENT DISPLAY */}
        <div style={{
          fontSize: '1rem',
          fontFamily: "'Spectral', Georgia, serif",
          lineHeight: '1.8',
          color: '#333333',
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
                  fontStyle: 'italic'
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

        {/* Journalist Bio Section - Show at bottom for all decrypted content */}
        {journalistInfo && (
          <div style={{
            background: '#f0f7ff',
            borderLeft: '4px solid #2B3990',
            padding: '1.5rem',
            margin: '3rem 0 2rem 0',
            borderRadius: '0 8px 8px 0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '1rem' 
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  fontSize: '18px',
                  marginBottom: '0.25rem'
                }}>
                  {journalistInfo.name}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  opacity: 0.7,
                  marginBottom: '0.5rem' 
                }}>
                  Member since {journalistInfo.memberSince} • {journalistInfo.walletAddress.slice(0, 6)}...{journalistInfo.walletAddress.slice(-4)}
                </div>
                {journalistInfo.hasProfile && (
                  <a 
                    href={journalistInfo.profileUrl}
                    style={{ 
                      color: '#2B3990',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    View Profile →
                  </a>
                )}
              </div>
            </div>
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.5' 
            }}>
              {journalistInfo.bio}
            </div>
          </div>
        )}

        {/* NFT OWNERSHIP BANNER - MOVED TO BOTTOM */}
        {accessDetails.accessType === 'nft_owner' && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#1D7F6E',
            color: 'white',
            borderRadius: '8px',
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎨</span>
            <div>
              <div style={{ fontWeight: '600' }}>NFT Owner - Permanent Access</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>You own this article as an NFT</div>
            </div>
          </div>
        )}

        {/* READER LICENSE BANNER - Also at bottom for consistency */}
        {accessDetails.accessType !== 'nft_owner' && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#2B3990',
            color: 'white',
            borderRadius: '8px',
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: '600' }}>Reader License Active</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {accessDetails.expiryTime ? `Expires: ${new Date(Number(accessDetails.expiryTime) * 1000).toLocaleDateString()}` : '7-day access'}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // Reader License Activation
  if (accessDetails?.needsActivation) {
    return (
      <>
        <div style={{
          padding: '2rem',
          backgroundColor: '#2B3990',
          color: 'white',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', margin: 0 }}>
            Activate Your Reader License
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Start your 7-day reading period for this article
          </p>
          <button
            onClick={() => setShowActivationConfirm(true)}
            style={{
              backgroundColor: 'white',
              color: '#2B3990',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start Reading →
          </button>
        </div>

        {/* Simple Activation Modal */}
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
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              padding: '2rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#2B3990' }}>
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
                      border: '2px solid #ccc',
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
                      backgroundColor: '#2B3990',
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

  // Simple Encryption Gate for Locked Content
  return (
    <main style={{ 
      wordBreak: 'break-word', 
      overflowWrap: 'break-word',
      maxWidth: '65ch',
      margin: '0 auto'
    }}>
      {/* Error Display */}
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

      {/* Simple Encryption Gate */}
      <div style={{
        padding: '2rem',
        backgroundColor: '#f4f1e8',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem' }}>🔐</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#B3211E' }}>
              Premium Content
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>
              Military-grade encryption protects this content
            </p>
          </div>
        </div>

        {article.summary && (
          <div style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#333333',
            fontStyle: 'italic',
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: 'white',
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
                backgroundColor: '#2B3990',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
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
                  backgroundColor: licenseSellers.length > 0 ? '#2B3990' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: licenseSellers.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {licenseSellers.length > 0 ? 'Purchase 7-Day Access' : 'No Licenses Available'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simple Purchase Modal */}
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
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '2rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#2B3990' }}>
                Purchase Reader License
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                7-day access to this article
              </p>
            </div>

            {!isProcessing ? (
              <>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: '#f4f1e8',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666' }}>
                    <span>Gas fee:</span>
                    <span>~0.005 FLOW</span>
                  </div>
                  <hr style={{ margin: '0.75rem 0', border: '1px solid #ccc' }} />
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
                      border: '2px solid #ccc',
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
                      backgroundColor: '#2B3990',
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
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
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