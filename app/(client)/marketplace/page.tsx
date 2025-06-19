// app/(client)/marketplace/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useLicenseValue } from '@/lib/hooks/useLicenseValue';

// Add this right after your imports and before the main MarketplacePage function
const LicenseValueSection = ({ articleId }: { articleId: string }) => {
    const { licensePrice, totalLicenses, totalValue, isLoading } = useLicenseValue(articleId);
    
    if (isLoading) {
      return (
        <div style={{
          backgroundColor: 'rgba(43, 57, 144, 0.05)',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          Loading license value...
        </div>
      );
    }
    
    return (
      <div style={{
        backgroundColor: 'rgba(43, 57, 144, 0.05)',
        border: '1px solid rgba(43, 57, 144, 0.2)',
        borderRadius: '6px',
        padding: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          📄 Reader Licenses: {totalLicenses} @ {parseFloat(licensePrice).toFixed(3)} FLOW
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-blockchain-blue)' }}>
          {parseFloat(totalValue).toFixed(3)} FLOW license value
        </div>
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
          Bonding curve pricing • Tradeable licenses
        </div>
      </div>
    );
  };

// Contract addresses
const ENCRYPTED_ARTICLES_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const MEMBERSHIP_TOKENS_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';

// MINIMAL ABI - Only fetch what we need for display
const ENCRYPTED_ARTICLES_ABI = [
    "function getTotalArticles() view returns (uint256)",
    "function getAvailableEditions(uint256) view returns (uint256[])",
    "function mintNFTEdition(uint256) payable",
    "event ArticlePublished(uint256 indexed articleId, address indexed author, string title, string location, uint256 nftCount, uint256 nftPrice)"
  ];

// Separate calls for individual data pieces
const METADATA_ABI = [
  "function articles(uint256) view returns (uint256, string, string, string, address, string, string)"
];

const PRICING_ABI = [
  "function articles(uint256) view returns (uint256, string, string, string, address, string, string, string[], uint256, uint256, uint256)"
];

const MEMBERSHIP_TOKENS_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

interface Article {
  id: string;
  title: string;
  summary: string;
  author: string;
  location: string;
  category: string;
  nftPrice: string;
  totalEditions: number;
  availableEditions: number;
  publishedAt: string;
}

interface DebugInfo {
  totalArticles: number;
  articlesProcessed: number;
  errors: string[];
  contractConnected: boolean;
}

export default function MarketplacePage() {
  const { isConnected, address, provider, connect } = useWallet();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    totalArticles: 0,
    articlesProcessed: 0,
    errors: [],
    contractConnected: false
  });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadArticles();
    if (address) {
      checkMembership();
    }
  }, [address]);





  const loadArticles = async () => {
    console.log('🔍 Starting EVENT-BASED marketplace article loading...');
    console.log('📍 EncryptedArticles address:', ENCRYPTED_ARTICLES_ADDRESS);
    
    const debug: DebugInfo = {
      totalArticles: 0,
      articlesProcessed: 0,
      errors: [],
      contractConnected: false
    };
  
    try {
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      console.log('✅ RPC Provider created');
      
      // Simplified ABI - only what we need for events and availability
      const EVENT_ABI = [
        "function getTotalArticles() view returns (uint256)",
        "function getAvailableEditions(uint256) view returns (uint256[])",
        "event ArticlePublished(uint256 indexed articleId, address indexed author, string title, string location, uint256 nftCount, uint256 nftPrice)"
      ];
      
      const contract = new ethers.Contract(ENCRYPTED_ARTICLES_ADDRESS, EVENT_ABI, rpcProvider);
      console.log('✅ Contract instance created');
      debug.contractConnected = true;
      
      // Get total articles for debug info
      const totalArticles = await contract.getTotalArticles();
      console.log('📊 Total articles in contract:', totalArticles.toString());
      debug.totalArticles = Number(totalArticles);
      
      // Get articles from events (this works!)
      console.log('🔍 Fetching ArticlePublished events...');
      const filter = contract.filters.ArticlePublished();
      const events = await contract.queryFilter(filter, 0, 'latest');
      console.log('📋 Found events:', events.length);
      
      const articlesList: Article[] = [];
  
      for (const event of events) {
        try {
            const eventLog = event as ethers.EventLog;
            const { articleId, author, title, location, nftCount, nftPrice } = eventLog.args;
          console.log(`🔍 Processing article ${articleId}: ${title}`);
          
          // Check if still available for purchase
          const availableEditions = await contract.getAvailableEditions(articleId);
          console.log(`🎫 Article ${articleId} available editions:`, availableEditions.length);
  
          if (availableEditions.length > 0) {
            articlesList.push({
              id: articleId.toString(),
              title: title,
              summary: `Published in ${location} - ${availableEditions.length} editions available for purchase`,
              author: author,
              location: location,
              category: 'News', // Default since not in events
              nftPrice: ethers.formatEther(nftPrice),
              totalEditions: Number(nftCount),
              availableEditions: availableEditions.length,
              publishedAt: 'Recent' // Could get from event block if needed
            });
            
            console.log(`✅ Article ${articleId} added to marketplace`);
          } else {
            console.log(`❌ Article ${articleId} has no available editions, skipping`);
            debug.errors.push(`Article ${articleId}: No public sale editions available`);
          }
  
          debug.articlesProcessed++;
        } catch (error) {
          console.error(`❌ Error processing event:`, error);
          debug.errors.push(`Event processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
  
      console.log(`📈 Final results: ${articlesList.length} articles available for purchase`);
      setArticles(articlesList);
      setDebugInfo(debug);
      
    } catch (error) {
      console.error('❌ Critical error loading articles:', error);
      debug.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugInfo(debug);
    } finally {
      setIsLoading(false);
    }
  };








  const checkMembership = async () => {
    if (!address) return;
    
    try {
      console.log('🔍 Checking membership for:', address);
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const contract = new ethers.Contract(MEMBERSHIP_TOKENS_ADDRESS, MEMBERSHIP_TOKENS_ABI, rpcProvider);
      const balance = await contract.balanceOf(address);
      const hasMembershipToken = Number(balance) > 0;
      console.log('🎫 Membership token balance:', balance.toString(), hasMembershipToken ? '✅ HAS MEMBERSHIP' : '❌ NO MEMBERSHIP');
      setHasMembership(hasMembershipToken);
    } catch (error) {
      console.error('❌ Error checking membership:', error);
    }
  };

  const handlePurchase = async (articleId: string, nftPrice: string) => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!hasMembership) {
      alert('Membership token required to purchase NFTs');
      return;
    }

    if (!provider) {
      alert('Please connect your wallet');
      return;
    }

    setPurchasingId(articleId);
    console.log(`🛒 Starting purchase for article ${articleId} at ${nftPrice} FLOW`);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ENCRYPTED_ARTICLES_ADDRESS, ENCRYPTED_ARTICLES_ABI, signer);
      const totalPrice = ethers.parseEther(nftPrice) + ethers.parseEther('1'); // NFT price + 1 FLOW buyer fee
      
      console.log('💰 Total transaction cost:', ethers.formatEther(totalPrice), 'FLOW');
      
      const tx = await contract.mintNFTEdition(articleId, {
        value: totalPrice,
        gasLimit: 500000
      });

      console.log('📝 Transaction sent:', tx.hash);
      await tx.wait();
      console.log('✅ NFT purchased successfully!');
      alert('NFT purchased successfully!');
      loadArticles(); // Refresh the list
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      alert('Purchase failed: ' + (error.message || 'Unknown error'));
    } finally {
      setPurchasingId(null);
    }
  };

  // [Keep all the existing styles exactly the same...]
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
    textAlign: 'center' as const
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--color-black)',
    marginBottom: '1rem',
    fontFamily: 'var(--font-headlines)'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem'
  };

  const debugStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    fontSize: '0.9rem',
    fontFamily: 'monospace'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-digital-silver)',
    borderRadius: '8px',
    padding: '1.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const cardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const membershipStyle: React.CSSProperties = {
    backgroundColor: hasMembership ? '#d4edda' : '#f8d7da',
    border: `1px solid ${hasMembership ? '#c3e6cb' : '#f5c6cb'}`,
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'center' as const
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-typewriter-red)',
    color: 'var(--color-white)',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    width: '100%',
    marginTop: '1rem'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Loading Marketplace...</h1>
          <p>Connecting to EncryptedArticles contract (MINIMAL MODE)</p>
        </div>
        <div style={gridStyle}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              ...cardStyle,
              backgroundColor: '#f0f0f0',
              height: '300px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Article NFT Marketplace</h1>
        <p style={subtitleStyle}>
          Collect limited edition article NFTs (MINIMAL MODE - Testing)
        </p>
        
        {/* Debug Toggle */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div style={debugStyle}>
          <h4>🔍 Debug Information (MINIMAL MODE)</h4>
          <p><strong>Contract Connected:</strong> {debugInfo.contractConnected ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Total Articles in Contract:</strong> {debugInfo.totalArticles}</p>
          <p><strong>Articles Processed:</strong> {debugInfo.articlesProcessed}</p>
          <p><strong>Articles Available for Purchase:</strong> {articles.length}</p>
          <p><strong>Contract Address:</strong> {ENCRYPTED_ARTICLES_ADDRESS}</p>
          <p><strong>Mode:</strong> Minimal - Skipping encrypted content</p>
          
          {debugInfo.errors.length > 0 && (
            <div>
              <h5>⚠️ Issues Found:</h5>
              <ul>
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Membership Status */}
      {isConnected && (
        <div style={membershipStyle}>
          {hasMembership ? (
            <span style={{ color: '#155724', fontWeight: '500' }}>
              ✅ Verified Member - Ready to purchase NFTs
            </span>
          ) : (
            <span style={{ color: '#721c24', fontWeight: '500' }}>
              ❌ Membership token required to purchase NFTs
            </span>
          )}
        </div>
      )}

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>No articles available for purchase</h3>
          <p>
            {debugInfo.totalArticles === 0 
              ? 'No articles found in the contract'
              : `Found ${debugInfo.totalArticles} articles, but none have public sale editions available`
            }
          </p>
          {showDebug && (
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
              Check debug info above for details
            </p>
          )}
        </div>

) : (
    <div style={gridStyle}>
      {articles.map((article) => {
        const LicenseValueSection = ({ articleId }: { articleId: string }) => {
          const { licensePrice, totalLicenses, totalValue, isLoading } = useLicenseValue(articleId);
          
          if (isLoading) {
            return (
              <div style={{
                backgroundColor: 'rgba(43, 57, 144, 0.05)',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: '#666'
              }}>
                Loading license value...
              </div>
            );
          }
          
          return (
            <div style={{
              backgroundColor: 'rgba(43, 57, 144, 0.05)',
              border: '1px solid rgba(43, 57, 144, 0.2)',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                📄 Reader Licenses: {totalLicenses} @ {parseFloat(licensePrice).toFixed(3)} FLOW
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-blockchain-blue)' }}>
                {parseFloat(totalValue).toFixed(3)} FLOW license value
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Bonding curve pricing • Tradeable licenses
              </div>
            </div>
          );
        };

        return (
          <div
            key={article.id}
            style={cardStyle}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              Object.assign(target.style, cardHoverStyle);
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              Object.assign(target.style, cardStyle);
            }}
          >
            {/* Article Header */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'var(--color-black)',
                marginBottom: '0.5rem',
                lineHeight: '1.3'
              }}>
                {article.title} 🧪
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.8rem'
              }}>
                <span style={{
                  backgroundColor: 'var(--color-blockchain-blue)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {article.category}
                </span>
                <span style={{
                  backgroundColor: 'var(--color-parchment)',
                  color: 'var(--color-black)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {article.location}
                </span>
                <span style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}>
                  MINIMAL
                </span>
              </div>
            </div>

            {/* Summary */}
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              lineHeight: '1.4',
              marginBottom: '1rem'
            }}>
              {article.summary} <em>(Placeholder data - contract found {debugInfo.totalArticles} articles)</em>
            </p>

            {/* NFT Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <strong>Price:</strong><br />
                {(parseFloat(article.nftPrice) + 1).toFixed(2)} FLOW
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  {article.nftPrice} + 1.00 fee
                </div>
              </div>
              <div>
                <strong>Available:</strong><br />
                {article.availableEditions}/{article.totalEditions}
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  Real data: {article.availableEditions} editions
                </div>
              </div>
            </div>

            {/* License Value Section */}
            <LicenseValueSection articleId={article.id} />

         

            <button
              onClick={() => handlePurchase(article.id, article.nftPrice)}
              disabled={!isConnected || !hasMembership || purchasingId === article.id}
              style={
                !isConnected || !hasMembership || purchasingId === article.id
                  ? disabledButtonStyle
                  : buttonStyle
              }
              onMouseEnter={(e) => {
                if (isConnected && hasMembership && purchasingId !== article.id) {
                  (e.target as HTMLElement).style.backgroundColor = '#8C1A17';
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected && hasMembership && purchasingId !== article.id) {
                  (e.target as HTMLElement).style.backgroundColor = 'var(--color-typewriter-red)';
                }
              }}
            >
              {purchasingId === article.id 
                ? 'Purchasing...' 
                : !isConnected 
                  ? 'Connect Wallet' 
                  : !hasMembership
                    ? 'Membership Required'
                    : 'Buy NFT (Test)'}
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>
);
}