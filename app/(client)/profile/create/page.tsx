// app/(client)/profile/create/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { useHasMembershipToken } from '@/lib/hooks/useHasMembershipToken';
import { useHasPublisherToken } from '@/lib/hooks/useHasPublisherToken';
import { useProfileNFT } from '@/lib/profile/hooks/useProfileNFT';


export default function CreateProfilePage() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { hasMembershipToken, membershipTokenId, isLoading: membershipLoading } = useHasMembershipToken();
  const { hasPublisherToken } = useHasPublisherToken();
  const { createProfile, hasProfile, isLoading: profileLoading } = useProfileNFT();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: 'Miami, Florida', // Default location
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Check if address already has a profile
  useEffect(() => {
    if (address && isConnected) {
      hasProfile(address).then(hasExistingProfile => {
        if (hasExistingProfile) {
          setError('This wallet already has a profile');
        }
      });
    }
  }, [address, isConnected, hasProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle character limits
    if (name === 'displayName' && value.length > 50) return;
    if (name === 'bio' && value.length > 500) return;
    if (name === 'location' && value.length > 100) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setTxStatus('pending');
      
      // Validate form data
      if (!formData.displayName.trim()) {
        throw new Error('Display name is required');
      }
      
      // Create profile on blockchain
      const result = await createProfile(
        formData.displayName,
        formData.bio,
        '', // Empty string for avatarUrl - will use membership token
        formData.location
      );
      
      setProfileId(result.profileId);
      setTxStatus('success');
      
      // Wait a moment to show success, then redirect
      setTimeout(() => {
        router.push(`/profile/${result.profileId}-${formData.displayName.toLowerCase().replace(/\s+/g, '-')}`);
      }, 2000);
      
    } catch (err) {
      setTxStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gate 1: Check wallet connection
  if (!isConnected) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}>Connect Your Wallet</h2>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          color: 'var(--color-black)',
          opacity: 0.8,
        }}>Please connect your wallet to create a profile.</p>
      </div>
    );
  }
  
  // Gate 2: Check membership token while loading
  if (membershipLoading) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <p>Checking membership status...</p>
      </div>
    );
  }
  
  // Gate 3: Require membership token
  if (!hasMembershipToken) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}>Membership Required</h2>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          color: 'var(--color-black)',
          opacity: 0.8,
          marginBottom: '1rem'
        }}>You need an ImmutableType membership token (IT00-IT99) to create a profile.</p>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-black)',
          opacity: 0.6,
        }}>Membership tokens are currently distributed by the admin.</p>
      </div>
    );
  }
  
  // Show transaction status
  if (txStatus !== 'idle') {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '2rem'
      }}>
        {txStatus === 'pending' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-headlines)', fontSize: '2rem', marginBottom: '1rem' }}>
              Creating Your Profile...
            </h2>
            <p>Please confirm the transaction in your wallet and wait for confirmation.</p>
            <div style={{ margin: '2rem 0' }}>
              <div className="spinner" />
            </div>
          </>
        )}
        
        {txStatus === 'success' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-headlines)', fontSize: '2rem', marginBottom: '1rem', color: 'green' }}>
              Profile Created Successfully!
            </h2>
            <p>Your profile NFT has been minted. Profile ID: #{profileId}</p>
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>Redirecting to your profile...</p>
          </>
        )}
        
        {txStatus === 'error' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-headlines)', fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-typewriter-red)' }}>
              Creation Failed
            </h2>
            <p style={{ marginBottom: '2rem' }}>{error}</p>
            <button
              onClick={() => setTxStatus('idle')}
              style={{
                backgroundColor: 'var(--color-typewriter-red)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }
  
  // Main form
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <h1 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
      }}>Create Your Profile</h1>
      
      <p style={{
        fontSize: '1rem',
        lineHeight: '1.5',
        color: 'var(--color-black)',
        opacity: 0.8,
        marginBottom: '2rem'
      }}>
        Create your on-chain profile NFT to start publishing and engaging with content.
      </p>
      
      {membershipTokenId && (
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✓</span>
          <span>Membership Token: {membershipTokenId}</span>
          {hasPublisherToken && <span style={{ marginLeft: 'auto' }}>Publisher ✓</span>}
        </div>
      )}
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: 'var(--color-typewriter-red)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}>
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="John Doe"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'var(--font-ui)',
            }}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {formData.displayName.length}/50 characters
          </p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'var(--font-ui)',
              resize: 'vertical',
            }}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {formData.bio.length}/500 characters
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'var(--font-ui)',
            }}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {formData.location.length}/100 characters
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          lineHeight: '1.5',
        }}>
          <strong>Profile Avatar:</strong> Your membership token ({membershipTokenId || 'IT**'}) will be displayed as your profile avatar.
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || profileLoading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: isSubmitting ? 'var(--color-digital-silver)' : 'var(--color-typewriter-red)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'default' : 'pointer',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
      
      <p style={{
        marginTop: '2rem',
        fontSize: '0.8rem',
        opacity: 0.7,
        textAlign: 'center'
      }}>
        By creating a profile, you accept the ImmutableType Terms of Service v1.0
      </p>
    </div>
  );
}