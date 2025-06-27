// components/article/EncryptionGate.tsx (REAL BLOCKCHAIN VERSION)
'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Article } from '../../lib/reader/types/article';
import { useWallet } from '../../lib/hooks/useWallet';
import { ReaderLicenseAMMService } from '../../lib/blockchain/contracts/ReaderLicenseAMMService';
import { CONTRACT_ADDRESSES } from '../../lib/constants/deployments';

interface EncryptionGateProps {
  article: Article;
  onDecrypt?: (success: boolean) => void;
}

const EncryptionGate: React.FC<EncryptionGateProps> = ({ article, onDecrypt }) => {
  const { address, provider, isConnected, connect } = useWallet();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'license' | 'nft'>('license');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasReaderLicense, setHasReaderLicense] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [licenseSellers, setLicenseSellers] = useState<string[]>([]);
  const [accessExpiryTime, setAccessExpiryTime] = useState<bigint | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize license service
  const [licenseService, setLicenseService] = useState<ReaderLicenseAMMService | null>(null);

  useEffect(() => {
    if (provider) {
      const service = new ReaderLicenseAMMService(CONTRACT_ADDRESSES.READER_LICENSE_AMM, provider);
      setLicenseService(service);
    }
  }, [provider]);

  // Check user's access status when wallet connects or article changes
  useEffect(() => {
    if (isConnected && address && licenseService && article.id) {
      checkReaderAccess();
      fetchLicenseInfo();
    }
  }, [isConnected, address, licenseService, article.id]);

  const checkReaderAccess = async () => {
    if (!licenseService || !address) return;

    try {
      // Extract numeric ID from article ID (remove any prefixes)
      const articleId = article.id.replace(/[^0-9]/g, '');
      
      const hasAccess = await licenseService.hasActiveAccess(articleId, address);
      setHasReaderLicense(hasAccess);

      if (hasAccess) {
        // Get access expiry time
        const accessInfo = await licenseService.getAccessInfo(articleId, address);
        if (accessInfo) {
          setAccessExpiryTime(accessInfo.expiryTime);
        }
      }
    } catch (error) {
      console.error('Error checking reader access:', error);
    }
  };

  const fetchLicenseInfo = async () => {
    if (!licenseService) return;

    try {
      const articleId = article.id.replace(/[^0-9]/g, '');
      
      // Get current price
      const price = await licenseService.getCurrentPrice(articleId);
      setCurrentPrice(ethers.formatEther(price));

      // Get available license sellers
      const { holders } = await licenseService.getLicenseHolders(articleId);
      setLicenseSellers(holders.filter(holder => holder !== address)); // Exclude self
    } catch (error) {
      console.error('Error fetching license info:', error);
      setCurrentPrice('0.05'); // Fallback price
    }
  };

  const handleRealPurchase = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!licenseService || !provider || !address) {
      setError('Wallet not properly connected');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const signer = await provider.getSigner();
      const articleId = article.id.replace(/[^0-9]/g, '');

      if (licenseSellers.length === 0) {
        throw new Error('No licenses available for purchase');
      }

      // Step 1: Buy license from first available seller
      console.log('Purchasing license from:', licenseSellers[0]);
      const buyTx = await licenseService.buyLicense(articleId, licenseSellers[0], signer);
      console.log('Purchase transaction sent:', buyTx.hash);
      
      await buyTx.wait();
      console.log('Purchase confirmed');

      // Step 2: Burn license for 7-day access
      console.log('Burning license for access...');
      const burnTx = await licenseService.burnLicenseForAccess(articleId, signer);
      console.log('Burn transaction sent:', burnTx.hash);
      
      await burnTx.wait();
      console.log('Burn confirmed');

      // Step 3: Verify access granted
      const hasAccess = await licenseService.hasActiveAccess(articleId, address);
      
      if (hasAccess) {
        setHasReaderLicense(true);
        setShowPurchaseModal(false);
        onDecrypt?.(true);
        
        // Get new expiry time
        const accessInfo = await licenseService.getAccessInfo(articleId, address);
        if (accessInfo) {
          setAccessExpiryTime(accessInfo.expiryTime);
        }
      } else {
        throw new Error('Access verification failed after purchase');
      }

    } catch (error: any) {
      console.error('Purchase failed:', error);
      setError(error.message || 'Purchase failed. Please try again.');
    } finally {
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

  // Calculate remaining access time
  const getRemainingTime = () => {
    if (!accessExpiryTime) return '';
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remaining = accessExpiryTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Number(remaining) / (24 * 60 * 60);
    if (days >= 1) {
      return `${Math.floor(days)} days remaining`;
    } else {
      const hours = Number(remaining) / (60 * 60);
      return `${Math.floor(hours)} hours remaining`;
    }
  };

  // If user has access, show decrypted content
  if (article.hasAccess || hasReaderLicense) {
    return (
      <main style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {/* Success Banner */}
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, var(--color-verification-green), #1a6b5c)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🔓</span>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Article Unlocked Successfully
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {accessExpiryTime ? `Reader license active - ${getRemainingTime()}` : 'Full access granted'}
            </div>
          </div>
        </div>

        {/* Decrypted Content */}
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: 'var(--color-black)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {article.content.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() && (
              <p key={index} style={{ marginBottom: '1.5rem' }}>
                {paragraph}
              </p>
            )
          ))}
        </div>
      </main>
    );
  }

  // Encryption gate for locked content
  return (
    <main style={{ 
      wordBreak: 'break-word', 
      overflowWrap: 'break-word',
      maxWidth: '100%',
      overflow: 'hidden'
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

      {/* Responsive Encryption Gate */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--color-parchment), #f8f6f0)',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid var(--color-digital-silver)',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>🔐</div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
              marginBottom: '0.5rem',
              color: 'var(--color-typewriter-red)',
              lineHeight: '1.2'
            }}>
              Encrypted Premium Content
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--color-digital-silver)',
              margin: 0,
              lineHeight: '1.4'
            }}>
              This article contains exclusive insights worth unlocking
            </p>
          </div>
        </div>

        {/* Content Preview */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid var(--color-digital-silver)',
          marginBottom: '1.5rem',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* Summary */}
          {article.summary && (
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: 'var(--color-black)',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(43, 57, 144, 0.05)',
              borderLeft: '3px solid var(--color-blockchain-blue)',
              borderRadius: '0 4px 4px 0',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              <strong>What you'll discover:</strong> {article.summary}
            </div>
          )}

          {/* Content Preview */}
          <div style={{
            position: 'relative',
            fontSize: '1rem',
            lineHeight: '1.7',
            color: 'var(--color-black)',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <p style={{ 
              marginBottom: '1rem',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {article.content && article.content.length > 250 ? 
                `${article.content.substring(0, 250)}...` : 
                'Premium content preview available after unlock...'
              }
            </p>
            
            {/* Fade overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(transparent, var(--color-white) 70%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--color-digital-silver)',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                Continue reading with premium access...
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
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
            maxHeight: '90vh',
            overflow: 'auto',
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
              <p style={{
                color: 'var(--color-digital-silver)',
                fontSize: '0.9rem',
                margin: 0
              }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-digital-silver)' }}>
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
                      cursor: 'pointer',
                      fontSize: '0.9rem'
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
                      fontWeight: '500',
                      fontSize: '0.9rem'
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
                <p style={{ fontSize: '0.9rem', color: 'var(--color-digital-silver)' }}>
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