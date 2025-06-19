// app/(client)/profile/[identifier]/edit/page.tsx
'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '../../../../../lib/profile/hooks/useProfile';
import { useProfileNFT } from '../../../../../lib/profile/hooks/useProfileNFT';
import { useWallet } from '@/lib/hooks/useWallet';

export default function EditProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = use(params);
  const router = useRouter();
  const { profile, isOwner, isLoading: profileLoading, error: profileError } = useProfile(identifier);
  const { updateProfile, isLoading: updating } = useProfileNFT();

  const { isConnected } = useWallet();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  
  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
    }
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle character limits
    if (name === 'displayName' && value.length > 50) return;
    if (name === 'bio' && value.length > 500) return;
    if (name === 'location' && value.length > 100) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setError(null);
      setTxStatus('pending');
      
      // Update profile on blockchain
      await updateProfile(
        profile.id,
        formData.displayName,
        formData.bio,
        '', // Empty string for avatarUrl - uses membership token
        formData.location
      );
      
      setTxStatus('success');
      
      // Redirect back to profile after short delay
      setTimeout(() => {
        router.push(`/profile/${identifier}`);
      }, 2000);
      
    } catch (err) {
      setTxStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };
  
  // Loading state
  if (profileLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        Loading profile...
      </div>
    );
  }
  
  // Error or not found
  if (profileError || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-typewriter-red)' }}>
        Error: {profileError?.message || 'Profile not found'}
      </div>
    );
  }
  
  // Not owner
  if (!isOwner) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Access Denied</h2>
        <p>You can only edit your own profile.</p>
        <button
          onClick={() => router.push(`/profile/${identifier}`)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-typewriter-red)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Profile
        </button>
      </div>
    );
  }
  
  // Not connected
  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Wallet Not Connected</h2>
        <p>Please connect your wallet to edit your profile.</p>
      </div>
    );
  }
  
  // Transaction status
  if (txStatus !== 'idle') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        {txStatus === 'pending' && (
          <>
            <h2>Updating Profile...</h2>
            <p>Please confirm the transaction in your wallet.</p>
          </>
        )}
        
        {txStatus === 'success' && (
          <>
            <h2 style={{ color: 'green' }}>Profile Updated!</h2>
            <p>Your changes have been saved on-chain.</p>
            <p style={{ opacity: 0.7 }}>Redirecting...</p>
          </>
        )}
        
        {txStatus === 'error' && (
          <>
            <h2 style={{ color: 'var(--color-typewriter-red)' }}>Update Failed</h2>
            <p>{error}</p>
            <button
              onClick={() => setTxStatus('idle')}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                backgroundColor: 'var(--color-typewriter-red)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }
  
  // Edit form
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '2rem',
        marginBottom: '2rem',
      }}>
        Edit Profile
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: 'var(--color-typewriter-red)',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Display Name
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {formData.displayName.length}/50 characters
          </p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {formData.bio.length}/500 characters
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              fontSize: '1rem',
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
          <strong>Profile Avatar:</strong> Your membership token is the default display for your profile avatar. We will provide avatar minting in a future update.
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => router.push(`/profile/${identifier}`)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={updating}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: updating ? 'var(--color-digital-silver)' : 'var(--color-typewriter-red)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: updating ? 'default' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {updating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}