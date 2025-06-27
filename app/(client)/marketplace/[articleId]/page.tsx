// app/(client)/marketplace/[articleId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';

// Contract addresses
const ENCRYPTED_ARTICLES_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
const MEMBERSHIP_TOKENS_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';

// Simplified ABIs
const ENCRYPTED_ARTICLES_ABI = [
  "function articles(uint256) view returns (uint256 id, string title, string encryptedContent, string summary, address author, string location, string category, string[] tags, uint256 publishedAt, uint256 nftCount, uint256 nftPrice, uint256 journalistRetained, uint256 readerLicenseRatio, uint8 creationSource, uint256 proposalId)",
  "function getAvailableEditions(uint256) view returns (uint256[])",
  "function editionsSold(uint256) view returns (uint256)",
  "function mintNFTEdition(uint256) payable"
];

const MEMBERSHIP_TOKENS_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

interface ArticleDetail {
  id: string;
  title: string;
  summary: string;
  author: string;
  location: string;
  category: string;
  tags: string[];
  nftPrice: string;
  totalEditions: number;
  availableEditions: number;
  editionsSold: number;
  journalistRetained: number;
  readerLicenseRatio: number;
  publishedAt: string;
}

interface ArticleDetailPageProps {
    params: Promise<{
      articleId: string;
    }>;
  }

  export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
    const { articleId } = await params;
  const { isConnected, address, provider, connect } = useWallet();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticleDetail();
    if (address) {
      checkMembership();
    }
  }, [articleId, address]);

  const loadArticleDetail = async () => {
    try {
      setError(null);
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const contract = new ethers.Contract(ENCRYPTED_ARTICLES_ADDRESS, ENCRYPTED_ARTICLES_ABI, rpcProvider);
      
      const articleData = await contract.articles(articleId);
      const availableEditions = await contract.getAvailableEditions(articleId);
      const editionsSold = await contract.editionsSold(articleId);

      setArticle({
        id: articleId,
        title: articleData.title,
        summary: articleData.summary,
        author: articleData.author,
        location: articleData.location,
        category: articleData.category,
        tags: articleData.tags,
        nftPrice: ethers.formatEther(articleData.nftPrice),
        totalEditions: Number(articleData.nftCount),
        availableEditions: availableEditions.length,
        editionsSold: Number(editionsSold),
        journalistRetained: Number(articleData.journalistRetained),
        readerLicenseRatio: Number(articleData.readerLicenseRatio),
        publishedAt: new Date(Number(articleData.publishedAt) * 1000).toLocaleDateString()
      });
    } catch (error: any) {
      console.error('Error loading article:', error);
      setError('Article not found or failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!address) return;
    
    try {
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const contract = new ethers.Contract(MEMBERSHIP_TOKENS_ADDRESS, MEMBERSHIP_TOKENS_ABI, rpcProvider);
      const balance = await contract.balanceOf(address);
      setHasMembership(Number(balance) > 0);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!hasMembership) {
      alert('Membership token required to purchase NFTs');
      return;
    }

    if (!provider || !article) {
      alert('Please connect your wallet');
      return;
    }

    setIsPurchasing(true);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ENCRYPTED_ARTICLES_ADDRESS, ENCRYPTED_ARTICLES_ABI, signer);
      const totalPrice = ethers.parseEther(article.nftPrice) + ethers.parseEther('1'); // NFT price + 1 FLOW buyer fee
      
      const tx = await contract.mintNFTEdition(articleId, {
        value: totalPrice,
        gasLimit: 500000
      });

      await tx.wait();
      alert('NFT purchased successfully!');
      loadArticleDetail(); // Refresh the data
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert('Purchase failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsPurchasing(false);
    }
  };

  // ... (rest of styles remain the same)
  // Inline styles following Collection.tsx pattern
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--color-black)',
    marginBottom: '1rem',
    fontFamily: 'var(--font-headlines)',
    lineHeight: '1.2'
  };

  const backLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--color-typewriter-red)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '1.5rem'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-digital-silver)',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem'
  };

  const metaGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: 'var(--color-parchment)',
    borderRadius: '6px'
  };

  const metaItemStyle: React.CSSProperties = {
    fontSize: '0.9rem'
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: 'var(--color-digital-silver)',
    color: 'var(--color-black)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    marginRight: '0.5rem',
    marginBottom: '0.5rem'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-typewriter-red)',
    color: 'var(--color-white)',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    width: '100%',
    maxWidth: '300px'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  };

  const membershipStyle: React.CSSProperties = {
    backgroundColor: hasMembership ? '#d4edda' : '#f8d7da',
    border: `1px solid ${hasMembership ? '#c3e6cb' : '#f5c6cb'}`,
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'center' as const
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={titleStyle}>Loading Article...</h2>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={containerStyle}>
        <Link href="/marketplace" style={backLinkStyle}>
          ← Back to Marketplace
        </Link>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--color-typewriter-red)', marginBottom: '1rem' }}>
            Article Not Found
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            {error || 'The requested article could not be loaded.'}
          </p>
          <Link 
            href="/marketplace"
            style={{
              ...buttonStyle,
              display: 'inline-block',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = (parseFloat(article.nftPrice) + 1).toFixed(2);
  const publicSaleEditions = article.totalEditions - article.journalistRetained;

  return (
    <div style={containerStyle}>
      {/* Back Link */}
      <Link href="/marketplace" style={backLinkStyle}>
        ← Back to Marketplace
      </Link>

      {/* Article Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{article.title}</h1>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span style={{
            backgroundColor: 'var(--color-blockchain-blue)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {article.category}
          </span>
          <span style={{
            backgroundColor: 'var(--color-verification-green)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {article.location}
          </span>
        </div>
      </div>

      {/* Membership Status */}
      {isConnected && (
        <div style={membershipStyle}>
          {hasMembership ? (
            <span style={{ color: '#155724', fontWeight: '500' }}>
              ✅ Verified Member - Ready to purchase NFT
            </span>
          ) : (
            <span style={{ color: '#721c24', fontWeight: '500' }}>
              ❌ Membership token required to purchase NFTs
            </span>
          )}
        </div>
      )}

      {/* Article Details */}
      <div style={cardStyle}>
        {/* Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'var(--color-black)',
            marginBottom: '0.5rem'
          }}>
            Summary
          </h3>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#333'
          }}>
            {article.summary}
          </p>
        </div>

        {/* Metadata Grid */}
        <div style={metaGridStyle}>
          <div style={metaItemStyle}>
            <strong>Author:</strong><br />
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {article.author.slice(0, 8)}...{article.author.slice(-6)}
            </span>
          </div>
          <div style={metaItemStyle}>
            <strong>Published:</strong><br />
            {article.publishedAt}
          </div>
          <div style={metaItemStyle}>
            <strong>NFT Price:</strong><br />
            {article.nftPrice} FLOW
          </div>
          <div style={metaItemStyle}>
            <strong>Total Cost:</strong><br />
            {totalPrice} FLOW <span style={{ fontSize: '0.8rem', color: '#666' }}>(+1 FLOW fee)</span>
          </div>
          <div style={metaItemStyle}>
            <strong>Available Editions:</strong><br />
            {article.availableEditions} / {publicSaleEditions}
          </div>
          <div style={metaItemStyle}>
            <strong>Editions Sold:</strong><br />
            {article.editionsSold}
          </div>
          <div style={metaItemStyle}>
            <strong>Reader Licenses:</strong><br />
            {article.readerLicenseRatio} per NFT
          </div>
          <div style={metaItemStyle}>
            <strong>Journalist Reserved:</strong><br />
            {article.journalistRetained} editions
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--color-black)',
              marginBottom: '0.5rem'
            }}>
              Tags
            </h4>
            <div>
              {article.tags.map((tag, index) => (
                <span key={index} style={tagStyle}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Section */}
        <div style={{
          borderTop: '1px solid var(--color-digital-silver)',
          paddingTop: '2rem',
          textAlign: 'center'
        }}>
          {article.availableEditions === 0 ? (
            <div>
              <h3 style={{ color: 'var(--color-typewriter-red)', marginBottom: '0.5rem' }}>
                Sold Out
              </h3>
              <p style={{ color: '#666' }}>
                All editions have been purchased
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--color-black)',
                marginBottom: '1rem'
              }}>
                Purchase NFT Edition
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#666',
                marginBottom: '2rem'
              }}>
                Get a limited edition NFT and {article.readerLicenseRatio} reader licenses
              </p>
              
              <button
                onClick={handlePurchase}
                disabled={!isConnected || !hasMembership || isPurchasing}
                style={
                  !isConnected || !hasMembership || isPurchasing
                    ? disabledButtonStyle
                    : buttonStyle
                }
                onMouseEnter={(e) => {
                  if (isConnected && hasMembership && !isPurchasing) {
                    (e.target as HTMLElement).style.backgroundColor = '#8C1A17';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isConnected && hasMembership && !isPurchasing) {
                    (e.target as HTMLElement).style.backgroundColor = 'var(--color-typewriter-red)';
                  }
                }}
              >
                {isPurchasing 
                  ? 'Purchasing...' 
                  : !isConnected 
                    ? 'Connect Wallet to Purchase' 
                    : !hasMembership
                      ? 'Membership Token Required'
                      : `Buy NFT for ${totalPrice} FLOW`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}