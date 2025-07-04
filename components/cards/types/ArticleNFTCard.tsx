// components/cards/types/ArticleNFTCard.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';

interface ArticleNFTCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    author: string;
    location: string;
    category: string;
    publishedAt: string;
    nftPrice?: string; // NFT price from initial load
  };
  availability?: {
    isAvailable: boolean;
    availableCount: number;
    status: 'loading' | 'loaded' | 'error';
  };
  onCardClick?: (articleId: string) => void;
  showPurchaseButton?: boolean;
  className?: string;
}

interface MarketplaceData {
  nftCount: number;
  nftPrice: string;
  mintedCount: number;
  availableCount: number;
  ownerCount: number;
  readerCount: number;
}

// ADDED: Simple ownership state
interface OwnershipState {
  isOwned: boolean;
  isAuthor: boolean;
  isChecking: boolean;
}

const ARTICLE_CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const AMM_CONTRACT_ADDRESS = '0x4E0f2A3A8AfEd1f86D83AAB1a989E01c316996d2';

// Reader license price range from contract constants
const READER_LICENSE_MIN = '0.01';
const READER_LICENSE_MAX = '1.00';

const ArticleNFTCard: React.FC<ArticleNFTCardProps> = ({ 
  article, 
  availability,
  onCardClick,
  showPurchaseButton = true,
  className = ''
}) => {
  const router = useRouter();
  const { provider, address } = useWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // ADDED: Ownership state (separate from market data loading)
  const [ownership, setOwnership] = useState<OwnershipState>({
    isOwned: false,
    isAuthor: false,
    isChecking: false
  });

  // ADDED: Lightweight ownership check (cached and lazy)
  const checkOwnership = async () => {
    if (!address) {
      setOwnership({ isOwned: false, isAuthor: false, isChecking: false });
      return;
    }

    // Check if author first (no RPC needed)
    const isAuthor = article.author.toLowerCase() === address.toLowerCase();
    
    // Use cache key
    const cacheKey = `ownership_${article.id}_${address.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const cachedData = JSON.parse(cached);
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) { // 5 minute cache
        setOwnership({ ...cachedData.data, isAuthor });
        return;
      }
    }

    setOwnership(prev => ({ ...prev, isChecking: true }));

    try {
      const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const contract = new ethers.Contract(
        ARTICLE_CONTRACT_ADDRESS,
        ["function holderNFTCount(uint256, address) view returns (uint256)"],
        provider
      );

      const ownedCount = await contract.holderNFTCount(parseInt(article.id), address);
      const isOwned = Number(ownedCount) > 0;
      
      const ownershipData = { isOwned, isAuthor, isChecking: false };
      setOwnership(ownershipData);
      
      // Cache result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: { isOwned, isChecking: false }, // Don't cache isAuthor
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.warn(`Ownership check failed for article ${article.id}:`, error);
      setOwnership({ isOwned: false, isAuthor, isChecking: false });
    }
  };

  // ADDED: Separate effect for ownership (lazy loaded)
  useEffect(() => {
    // Delay ownership check to avoid blocking main render
    const timer = setTimeout(() => {
      checkOwnership();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [article.id, address]);

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(article.id);
    } else {
      router.push(`/miami/news/general/native_${article.id}`);
    }
  };

  const parseContractError = (error: any): string => {
    if (error.code === 'ACTION_REJECTED') {
      return 'Transaction was cancelled by user';
    }
    
    // Look for specific contract error messages
    const errorMessage = error.message || error.reason || '';
    
    // IMPROVED: Better error message for ownership
    if (errorMessage.includes('Already owns NFT for this article')) {
      return 'You already own an NFT for this article. Each wallet can only own one NFT per article.';
    }
    
    if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
      return 'Insufficient FLOW balance for this purchase';
    }
    
    if (errorMessage.includes('sold out') || errorMessage.includes('no more editions')) {
      return 'All NFT editions have been sold';
    }
    
    if (errorMessage.includes('paused')) {
      return 'Contract is currently paused';
    }
    
    if (errorMessage.includes('gas')) {
      return 'Transaction failed due to gas issues. Please try again.';
    }
    
    // Generic fallback
    return `Purchase failed: ${errorMessage.slice(0, 100)}${errorMessage.length > 100 ? '...' : ''}`;
  };

  const handleBuyNFT = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!availability || !availability.isAvailable) {
      alert('All NFT editions have been sold');
      return;
    }

    // ADDED: Pre-purchase ownership check
    if (ownership.isOwned) {
      alert('You already own an NFT for this article. Each wallet can only own one NFT per article.');
      return;
    }

    if (!provider) {
      alert('Please connect your wallet');
      return;
    }

    setIsPurchasing(true);
    const displayPrice = article.nftPrice || '6'; // Use price from initial load or default
    console.log(`🛒 Starting purchase for article ${article.id} at ${displayPrice} FLOW`);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        ARTICLE_CONTRACT_ADDRESS,
        [
          "function mintNFTEdition(uint256) payable"
        ],
        signer
      );
      
      const totalPrice = ethers.parseEther(displayPrice) + ethers.parseEther('1'); // NFT price + 1 FLOW buyer fee
      
      console.log('💰 Total transaction cost:', ethers.formatEther(totalPrice), 'FLOW');
      
      const tx = await contract.mintNFTEdition(parseInt(article.id), {
        value: totalPrice,
        gasLimit: 500000
      });

      console.log('📝 Transaction sent:', tx.hash);
      await tx.wait();
      console.log('✅ NFT purchased successfully!');
      
      // ADDED: Clear ownership cache and refresh
      const cacheKey = `ownership_${article.id}_${address?.toLowerCase()}`;
      localStorage.removeItem(cacheKey);
      checkOwnership();
      
      // Reload availability data
      window.location.reload();
      
      alert('NFT purchased successfully!');
      
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      const userFriendlyError = parseContractError(error);
      alert(userFriendlyError);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleReadNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/miami/news/general/native_${article.id}`);
  };

  // ADDED: Smart button configuration
  const getButtonConfig = () => {
    if (ownership.isOwned) {
      return {
        text: 'Already Owned',
        disabled: true,
        backgroundColor: 'var(--color-verification-green)'
      };
    }
    
    if (!availability || !availability.isAvailable) {
      return {
        text: 'Sold Out',
        disabled: true,
        backgroundColor: '#9CA3AF'
      };
    }
    
    if (isPurchasing) {
      return {
        text: 'Purchasing...',
        disabled: true,
        backgroundColor: '#9CA3AF'
      };
    }
    
    const displayPrice = article.nftPrice || '6';
    return {
      text: `Buy NFT (${(parseFloat(displayPrice) + 1).toFixed(1)} FLOW)`,
      disabled: false,
      backgroundColor: 'var(--color-blockchain-blue)'
    };
  };

  const buttonConfig = getButtonConfig();

  // Get availability display
  const getAvailabilityDisplay = () => {
    if (!availability) {
      return null;
    }

    if (availability.status === 'error') {
      return (
        <span style={{
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '600',
          fontFamily: 'var(--font-ui)',
        }}>
          ⚠️ Availability Unavailable ATM
        </span>
      );
    }

    if (availability.status === 'loading') {
      return null; // Show nothing while loading
    }

    if (availability.isAvailable) {
      return (
        <span style={{
          backgroundColor: 'var(--color-blockchain-blue)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '600',
          fontFamily: 'var(--font-ui)',
        }}>
          ✨ Limited Available
        </span>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
          <span style={{
            backgroundColor: '#DC2626',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            fontFamily: 'var(--font-ui)',
          }}>
            🔴 Sold Out
          </span>
          <span style={{
            backgroundColor: 'var(--color-verification-green)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            fontFamily: 'var(--font-ui)',
          }}>
            ✅ Reader Licenses Available
          </span>
        </div>
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={className}
      style={{
        backgroundColor: 'var(--color-white)',
        border: '2px solid var(--color-digital-silver)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = 'var(--color-typewriter-red)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'var(--color-digital-silver)';
      }}
    >
      {/* NFT Edition Header - Updated with availability display */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: 'var(--color-parchment)',
        borderBottom: '1px solid var(--color-digital-silver)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          backgroundColor: 'var(--color-typewriter-red)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}>
          Native Article
        </span>

        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {getAvailabilityDisplay()}
        </div>
      </div>

      {/* Article Content (UNCHANGED) */}
      <div style={{
        padding: '1.5rem',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.3rem',
          margin: '0 0 0.75rem 0',
          lineHeight: '1.3',
          color: 'var(--color-black)',
        }}>
          {article.title}
        </h3>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--color-black)',
          opacity: 0.8,
          lineHeight: '1.5',
          margin: '0 0 1rem 0',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {article.summary}
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--color-black)',
          opacity: 0.7,
          marginBottom: '1.5rem',
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4l-6 6h6l-1 8 8-8h-6l1-8z"></path>
            </svg>
            {article.category}
          </span>
          
          <span>•</span>
          
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {article.location}
          </span>
          
          <span>•</span>
          
          <span>{article.publishedAt}</span>
        </div>

        {/* Market Information - Updated with static pricing */}
        <div style={{
          backgroundColor: 'rgba(43, 57, 144, 0.05)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-ui)',
              }}>
                Reading License Range
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--color-verification-green)',
              }}>
                {READER_LICENSE_MIN} - {READER_LICENSE_MAX} FLOW
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-ui)',
              }}>
                Mint Price
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--color-typewriter-red)',
              }}>
                {article.nftPrice || '6'} FLOW
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - UPDATED button logic only */}
        {showPurchaseButton && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}>
            <button
              onClick={handleReadNow}
              style={{
                backgroundColor: 'var(--color-verification-green)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#166B5C';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-verification-green)';
              }}
            >
              Read Now
            </button>

            <button
              onClick={handleBuyNFT}
              disabled={buttonConfig.disabled}
              style={{
                backgroundColor: buttonConfig.backgroundColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: buttonConfig.disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                fontFamily: 'var(--font-ui)',
                opacity: buttonConfig.disabled ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!buttonConfig.disabled && buttonConfig.backgroundColor === 'var(--color-blockchain-blue)') {
                  e.currentTarget.style.backgroundColor = '#1E2875';
                }
              }}
              onMouseOut={(e) => {
                if (!buttonConfig.disabled && buttonConfig.backgroundColor === 'var(--color-blockchain-blue)') {
                  e.currentTarget.style.backgroundColor = 'var(--color-blockchain-blue)';
                }
              }}
            >
              {buttonConfig.text}
            </button>
          </div>
        )}

        {/* Verification Badge (UNCHANGED) */}
        <div style={{
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-verification-green)',
          fontFamily: 'var(--font-ui)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>⛓️</span>
          <span>Blockchain Verified & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleNFTCard;