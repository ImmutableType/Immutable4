// app/(client)/profile/[identifier]/publish/community/page.tsx
'use client'

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import TokenGate from '../../../../../../components/publishing/TokenGate';
import FeePayment from '../../../../../../components/publishing/FeePayment';
import { useArticleCreation } from '../../../../../../lib/publishing/hooks/useArticleCreation';
import { PublishingFee } from '../../../../../../lib/publishing/types/fee';
import { PublishedArticle } from '../../../../../../lib/publishing/types/publishedArticle';

export default function CommunityMintPage({ params }: { params: Promise<{ identifier: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const identifier = resolvedParams.identifier;
  
  const [formData, setFormData] = useState({
    title: '',
    originalUrl: '',
    shortDescription: '',
    category: 'Technology',
    location: 'Miami, Florida',
    tags: '',
    originalAuthor: '',
    sourceDomain: '',
    createProposal: false,
  });
  
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { publishCommunityArticle, createProposalFromArticle, isSubmitting, error, createdArticle } = useArticleCreation(identifier);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      setValidationError('Title is required');
      return;
    }
    
    if (!formData.originalUrl.trim()) {
      setValidationError('Original URL is required');
      return;
    }
    
    if (!formData.shortDescription.trim()) {
      setValidationError('Description is required');
      return;
    }
    
    // Extract domain from URL
    try {
      const url = new URL(formData.originalUrl);
      setFormData(prev => ({ ...prev, sourceDomain: url.hostname }));
    } catch (err) {
      setValidationError('Please enter a valid URL');
      return;
    }
    
    setValidationError(null);
    setShowFeePayment(true);
  };

  const handlePaymentSuccess = async (fee: PublishingFee) => {
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const article = await publishCommunityArticle({
        title: formData.title,
        shortDescription: formData.shortDescription,
        category: formData.category,
        location: formData.location,
        tags: tagsArray,
        originalUrl: formData.originalUrl,
        sourceDomain: formData.sourceDomain,
        originalAuthor: formData.originalAuthor,
        mintType: 'community'
      });
      
      if (formData.createProposal && article.id) {
        await createProposalFromArticle(article.id);
      }
      
      // Show success message with transaction hash
      alert(`Article published successfully! Transaction: ${article.transactionHash}`);
      
      // Redirect to the profile page
      setTimeout(() => {
        router.push(`/profile/${identifier}/publish`);
      }, 3000);
    } catch (err: any) {
      console.error('Publishing error:', err);
      
      // Handle specific blockchain errors
      if (err.message?.includes('Membership token required')) {
        setValidationError('You need a membership token to publish articles');
      } else if (err.message?.includes('Daily post limit reached')) {
        setValidationError('You have reached your daily posting limit (20 posts)');
      } else if (err.message?.includes('URL already posted')) {
        setValidationError('This URL has already been posted by you');
      } else {
        setValidationError(err.message || 'Failed to publish article');
      }
    }
  };
  
  return (
    <div>
      <TokenGate profileId={identifier} publishingType="community">
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          marginBottom: '1.5rem',
        }}>
          Community Curation
        </h1>
        
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          padding: '1.5rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.95rem',
            margin: 0,
            lineHeight: '1.5',
          }}>
            Mint interesting articles from around the web to share with the ImmutableType community. This helps categorize and permanently record valuable content on the blockchain.
          </p>
        </div>
        
        {createdArticle ? (
          <div style={{
            backgroundColor: 'rgba(29, 127, 110, 0.1)',
            borderLeft: '3px solid var(--color-verification-green)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '4px',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.2rem',
              marginTop: 0,
              marginBottom: '1rem',
              color: 'var(--color-verification-green)',
            }}>
              Article Successfully Published!
            </h3>
            
            <p style={{
              fontSize: '1rem',
              margin: '0 0 1rem 0',
            }}>
              Your article has been minted on the blockchain.
            </p>
            
            <p style={{
              fontSize: '0.9rem',
              margin: '0 0 1.5rem 0',
              opacity: 0.8,
            }}>
              Transaction Hash: {createdArticle.transactionHash?.substring(0, 10)}...
            </p>
            
            <div style={{
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '0.9rem',
                opacity: 0.7,
                margin: 0,
              }}>
                Redirecting to your publishing dashboard...
              </p>
            </div>
          </div>
        ) : showFeePayment ? (
          <FeePayment
            authorId={identifier}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowFeePayment(false)}
          />
        ) : (
          <div style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-digital-silver)',
            borderRadius: '4px',
            padding: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              {validationError && (
                <div style={{
                  backgroundColor: 'rgba(179, 33, 30, 0.1)',
                  borderLeft: '3px solid var(--color-typewriter-red)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: 'var(--color-typewriter-red)',
                  fontSize: '0.9rem',
                }}>
                  {validationError}
                </div>
              )}
              
              {error && (
                <div style={{
                  backgroundColor: 'rgba(179, 33, 30, 0.1)',
                  borderLeft: '3px solid var(--color-typewriter-red)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: 'var(--color-typewriter-red)',
                  fontSize: '0.9rem',
                }}>
                  {error.message}
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="title"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Article Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-digital-silver)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="originalUrl"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Article URL *
                </label>
                <input
                  id="originalUrl"
                  name="originalUrl"
                  type="url"
                  value={formData.originalUrl}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-digital-silver)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="shortDescription"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Short Description *
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-digital-silver)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                    resize: 'vertical',
                  }}
                  required
                />
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-black)',
                  opacity: 0.7,
                  margin: '0.25rem 0 0 0',
                }}>
                  This will appear in Article Cards in the Reader feed ({formData.shortDescription.length}/150 characters)
                </p>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="originalAuthor"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Original Author (if known)
                </label>
                <input
                  id="originalAuthor"
                  name="originalAuthor"
                  type="text"
                  value={formData.originalAuthor}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-digital-silver)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                  }}
                />
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <label
                    htmlFor="category"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--color-digital-silver)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-ui)',
                      backgroundColor: 'var(--color-white)',
                    }}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Politics">Politics</option>
                    <option value="Business">Business</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="Arts">Arts</option>
                    <option value="Sports">Sports</option>
                    <option value="Opinion">Opinion</option>
                  </select>
                </div>
                
                <div>
                  <label
                    htmlFor="location"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Location
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--color-digital-silver)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-ui)',
                      backgroundColor: 'var(--color-white)',
                    }}
                  >
                    <option value="Miami, Florida">Miami, Florida</option>
                    <option value="Tampa, Florida">Tampa, Florida</option>
                    <option value="Orlando, Florida">Orlando, Florida</option>
                    <option value="Jacksonville, Florida">Jacksonville, Florida</option>
                    <option value="Global">Global</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="tags"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-digital-silver)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-ui)',
                  }}
                  placeholder="e.g. blockchain, miami, technology"
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-ui)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name="createProposal"
                    checked={formData.createProposal}
                    onChange={(e) => setFormData(prev => ({ ...prev, createProposal: e.target.checked }))}
                  />
                  <span>Also create a proposal for this article</span>
                </label>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-black)',
                  opacity: 0.7,
                  margin: '0.25rem 0 0 1.5rem',
                }}>
                  This will put the article up for voting and potential funding in the Proposals section
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => router.push(`/profile/${identifier}/publish`)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-black)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--color-digital-silver)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: 'var(--color-typewriter-red)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'default' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </TokenGate>
    </div>
  );
}