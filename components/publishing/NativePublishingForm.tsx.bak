// components/publishing/NativePublishingForm.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../lib/hooks/useWallet';
import { useHasPublisherToken } from '../../lib/hooks/useHasPublisherToken';
import EncryptedArticleService from '../../lib/blockchain/contracts/EncryptedArticleService';
import NativeFeePayment from './NativeFeePayment';
import EncryptionStatus from './EncryptionStatus';


interface NativePublishingFormProps {
  authorId: string;
}

const NativePublishingForm: React.FC<NativePublishingFormProps> = ({ authorId }) => {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { hasPublisherToken, isLoading: tokenLoading } = useHasPublisherToken();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    location: 'Miami, FL', // Default to Miami
    category: 'News',
    tags: [] as string[],
    nftCount: 100,
    nftPrice: 10.0, // in FLOW
    journalistRetained: 25,
    readerLicenseRatio: 10
  });
  
  const [tagInput, setTagInput] = useState('');
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [encryptedContent, setEncryptedContent] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [userStats, setUserStats] = useState({ articlesToday: 0, remainingToday: 3 });

  // Contract configuration
  const ENCRYPTED_ARTICLES_CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';

  // Categories for dropdown
  const categories = [
    'News', 'Politics', 'Tech', 'Business', 'Sports', 
    'Entertainment', 'Health', 'Science', 'Opinion', 'Investigative'
  ];

  // Load user stats on mount
  useEffect(() => {
    async function loadUserStats() {
      if (!address || !isConnected) return;
      
      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const service = new EncryptedArticleService(ENCRYPTED_ARTICLES_CONTRACT_ADDRESS, provider);
        const stats = await service.getUserPostingStats(address);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    }
    
    loadUserStats();
  }, [address, isConnected]);

  // Simple client-side encryption (placeholder - in production use proper encryption)
  const encryptContent = async (content: string): Promise<string> => {
    setIsEncrypting(true);
    
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, implement proper encryption here
    // For now, we'll just base64 encode with a prefix
    const encrypted = `ENCRYPTED_V1:${btoa(unescape(encodeURIComponent(content)))}`;
    
    setIsEncrypting(false);
    return encrypted;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be 200 characters or less';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Article content is required';
    } else if (formData.content.length > 25000) {
      errors.content = 'Content must be 25,000 characters or less';
    }
    
    if (!formData.summary.trim()) {
      errors.summary = 'Summary is required';
    } else if (formData.summary.length > 500) {
      errors.summary = 'Summary must be 500 characters or less';
    }
    
    if (formData.nftCount < 1 || formData.nftCount > 10000) {
      errors.nftCount = 'NFT count must be between 1 and 10,000';
    }
    
    if (formData.nftPrice <= 0) {
      errors.nftPrice = 'NFT price must be greater than 0';
    }
    
    if (formData.journalistRetained > formData.nftCount) {
      errors.journalistRetained = 'Cannot retain more NFTs than total count';
    }
    
    if (formData.readerLicenseRatio < 1 || formData.readerLicenseRatio > 100) {
      errors.readerLicenseRatio = 'License ratio must be between 1 and 100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Check daily limit
    if (userStats.remainingToday <= 0) {
      alert('Daily publishing limit reached (3 articles per day)');
      return;
    }
    
    // Encrypt content
    const encrypted = await encryptContent(formData.content);
    setEncryptedContent(encrypted);
    setShowFeePayment(true);
  };

  const handlePublishSuccess = (result: any) => {
    // Redirect to profile with success message
    router.push(`/profile/${authorId}?published=${result.articleId}&type=native`);
  };

  const handleCancel = () => {
    if (showFeePayment) {
      setShowFeePayment(false);
    } else {
      router.push(`/profile/${authorId}/publish`);
    }
  };

  // Loading state
  if (tokenLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Loading publishing permissions...
      </div>
    );
  }

  // Access denied
  if (!hasPublisherToken) {
    return (
      <div style={{
        backgroundColor: 'var(--color-parchment)',
        borderRadius: '4px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.3rem',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Publisher Credential Required
        </h3>
        <p style={{
          fontSize: '1rem',
          margin: '0 0 1.5rem 0',
          lineHeight: '1.5',
        }}>
          Native publishing requires a publisher credential. This feature is restricted to verified journalists.
        </p>
        <button
          onClick={() => router.push(`/profile/${authorId}/publish`)}
          style={{
            backgroundColor: 'var(--color-typewriter-red)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Publishing Dashboard
        </button>
      </div>
    );
  }

  // Show fee payment screen
  if (showFeePayment) {
    return (
      <div>
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          marginBottom: '1.5rem',
        }}>
          Publish Native Article
        </h1>
        
        <EncryptionStatus 
          isEncrypting={isEncrypting}
          encryptedContentLength={encryptedContent.length}
          title={formData.title}
        />
        
        <NativeFeePayment
          authorId={authorId}
          articleData={{
            title: formData.title,
            encryptedContent: encryptedContent,
            summary: formData.summary,
            location: formData.location,
            category: formData.category,
            tags: formData.tags,
            nftCount: formData.nftCount,
            nftPrice: formData.nftPrice,
            journalistRetained: formData.journalistRetained,
            readerLicenseRatio: formData.readerLicenseRatio
          }}
          onSuccess={handlePublishSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Main form
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '2rem',
        marginBottom: '1.5rem',
      }}>
        Native Publication
      </h1>

      {/* Daily limit indicator */}
      <div style={{
        backgroundColor: 'var(--color-parchment)',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <strong>Daily Publishing Status:</strong> {userStats.articlesToday}/3 articles published today
        </div>
        <div style={{
          color: userStats.remainingToday > 0 ? 'var(--color-verification-green)' : 'var(--color-typewriter-red)',
          fontWeight: 'bold',
        }}>
          {userStats.remainingToday} remaining
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Article Information */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-digital-silver)',
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.3rem',
            margin: '0 0 1rem 0',
          }}>
            Article Information
          </h3>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter article title (max 200 characters)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${formErrors.title ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
            {formErrors.title && (
              <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {formErrors.title}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-black)', opacity: 0.6, marginTop: '0.25rem' }}>
              {formData.title.length}/200 characters
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}>
              Public Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Enter a public summary/teaser for your article (max 500 characters)"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${formErrors.summary ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
            {formErrors.summary && (
              <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {formErrors.summary}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-black)', opacity: 0.6, marginTop: '0.25rem' }}>
              {formData.summary.length}/500 characters
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}>
              Article Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your full article content here. This will be encrypted and only accessible to license holders."
              rows={12}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${formErrors.content ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'var(--font-body)',
              }}
            />
            {formErrors.content && (
              <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {formErrors.content}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-black)', opacity: 0.6, marginTop: '0.25rem' }}>
              {formData.content.length}/25,000 characters
            </div>
          </div>

          {/* Category and Location */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Miami, FL"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}>
              Tags (max 10)
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Enter a tag and press Enter"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 10}
                style={{
                  backgroundColor: 'var(--color-blockchain-blue)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: formData.tags.length >= 10 ? 'default' : 'pointer',
                  opacity: formData.tags.length >= 10 ? 0.6 : 1,
                }}
              >
                Add
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'var(--color-parchment)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-typewriter-red)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* NFT Economics */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-digital-silver)',
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.3rem',
            margin: '0 0 1rem 0',
          }}>
            NFT Economics
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            {/* NFT Count */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                Total NFT Count
              </label>
              <input
                type="number"
                value={formData.nftCount}
                onChange={(e) => handleInputChange('nftCount', parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${formErrors.nftCount ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
              {formErrors.nftCount && (
                <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {formErrors.nftCount}
                </div>
              )}
            </div>

            {/* NFT Price */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                NFT Price (FLOW)
              </label>
              <input
                type="number"
                value={formData.nftPrice}
                onChange={(e) => handleInputChange('nftPrice', parseFloat(e.target.value) || 0)}
                min="0.1"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${formErrors.nftPrice ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
              {formErrors.nftPrice && (
                <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {formErrors.nftPrice}
                </div>
              )}
            </div>

            {/* Journalist Retained */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                Journalist Retained
              </label>
              <input
                type="number"
                value={formData.journalistRetained}
                onChange={(e) => handleInputChange('journalistRetained', parseInt(e.target.value) || 0)}
                min="0"
                max={formData.nftCount}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${formErrors.journalistRetained ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
              {formErrors.journalistRetained && (
                <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {formErrors.journalistRetained}
                </div>
              )}
            </div>

            {/* Reader License Ratio */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}>
                Licenses per NFT
              </label>
              <input
                type="number"
                value={formData.readerLicenseRatio}
                onChange={(e) => handleInputChange('readerLicenseRatio', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${formErrors.readerLicenseRatio ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
              {formErrors.readerLicenseRatio && (
                <div style={{ color: 'var(--color-typewriter-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {formErrors.readerLicenseRatio}
                </div>
              )}
            </div>
          </div>

          {/* Economics Summary */}
          <div style={{
            backgroundColor: 'var(--color-parchment)',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}>
            <h4 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1rem',
              margin: '0 0 0.5rem 0',
            }}>
              Economics Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div><strong>Public Sale NFTs:</strong> {formData.nftCount - formData.journalistRetained}</div>
              <div><strong>Total Revenue Potential:</strong> {((formData.nftCount - formData.journalistRetained) * formData.nftPrice).toFixed(1)} FLOW</div>
              <div><strong>Total Licenses:</strong> {formData.nftCount * formData.readerLicenseRatio}</div>
              <div><strong>Your Share (98.1%):</strong> {(((formData.nftCount - formData.journalistRetained) * formData.nftPrice) * 0.981).toFixed(1)} FLOW</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={userStats.remainingToday <= 0}
            style={{
              backgroundColor: userStats.remainingToday > 0 ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-ui)',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: userStats.remainingToday > 0 ? 'pointer' : 'default',
              fontWeight: 'bold',
            }}
          >
            {userStats.remainingToday > 0 ? 'Continue to Publishing' : 'Daily Limit Reached'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NativePublishingForm;