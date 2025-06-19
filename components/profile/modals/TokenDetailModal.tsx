// components/profile/modals/TokenDetailModal.tsx
'use client'

import React from 'react';
import { MembershipToken } from '../../../lib/blockchain/contracts/MembershipTokens';
import { PublisherCredential } from '../../../lib/blockchain/contracts/PublisherCredentials';
import { Profile } from '../../../lib/profile/types/profile';

export interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'membership' | 'publisher' | 'profile' | 'emoji';
  data?: MembershipToken | PublisherCredential | Profile | { balance: string };
}

const TokenDetailModal: React.FC<TokenDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  if (!isOpen) return null;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'membership':
        const membershipData = data as MembershipToken;
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {membershipData.svgImage && (
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={membershipData.svgImage}
                    alt={`Token IT${membershipData.tokenId.toString().padStart(2, '0')}`}
                    style={{ 
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              )}
              <h2 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.8rem',
                margin: '0 0 0.5rem 0',
                color: '#FFD700',
              }}>
                IT{membershipData.tokenId.toString().padStart(2, '0')}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-black)',
                margin: 0,
              }}>
                {membershipData.name}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Token ID
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {membershipData.tokenId}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Owner
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontFamily: 'monospace' }}>
                  {formatAddress(membershipData.owner)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Minted
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {formatDate(membershipData.mintedAt)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Status
                </label>
                <p style={{ 
                  margin: '0.25rem 0 0 0', 
                  fontSize: '1rem',
                  color: membershipData.isActive ? 'var(--color-verification-green)' : 'var(--color-typewriter-red)',
                  fontWeight: 'bold'
                }}>
                  {membershipData.isActive ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-parchment)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}>
              <strong>Founding Member Token</strong><br/>
              This soulbound token grants access to the ImmutableType platform, including profile creation, community curation, and participation in local journalism governance.
            </div>
          </div>
        );

      case 'publisher':
        const publisherData = data as PublisherCredential;
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#2B3990',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'white',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.8rem',
                margin: '0 0 0.5rem 0',
                color: '#2B3990',
              }}>
                Publisher Credential
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-black)',
                margin: 0,
              }}>
                {publisherData.name}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Credential ID
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  #{publisherData.tokenId}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Journalist
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontFamily: 'monospace' }}>
                  {formatAddress(publisherData.journalist)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Geographic Rights
                </label>
                <div style={{ margin: '0.25rem 0 0 0' }}>
                  {publisherData.geographicRights.map((right, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#2B3990',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        margin: '0.25rem 0.25rem 0 0',
                      }}
                    >
                      {right}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Subject Rights
                </label>
                <div style={{ margin: '0.25rem 0 0 0' }}>
                  {publisherData.subjectRights.map((right, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'var(--color-verification-green)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        margin: '0.25rem 0.25rem 0 0',
                      }}
                    >
                      {right}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Issued
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {formatDate(publisherData.issuedAt)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Status
                </label>
                <p style={{ 
                  margin: '0.25rem 0 0 0', 
                  fontSize: '1rem',
                  color: publisherData.isActive ? 'var(--color-verification-green)' : 'var(--color-typewriter-red)',
                  fontWeight: 'bold'
                }}>
                  {publisherData.isActive ? '✓ Active' : '✗ Revoked'}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-parchment)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}>
              <strong>Publisher Credential</strong><br/>
              This soulbound credential grants professional publishing rights within specified geographic regions and subject matters on the ImmutableType platform.
            </div>
          </div>
        );

      case 'profile':
        const profileData = data as Profile;
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-verification-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'white',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.8rem',
                margin: '0 0 0.5rem 0',
                color: 'var(--color-verification-green)',
              }}>
                Profile NFT #{profileData.id}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-black)',
                margin: 0,
              }}>
                {profileData.displayName || 'Unnamed Profile'}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Profile ID
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  #{profileData.id}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Owner
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontFamily: 'monospace' }}>
                  {formatAddress(profileData.walletAddress)}
                </p>
              </div>

              {profileData.bio && (
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                    Bio
                  </label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', lineHeight: '1.5' }}>
                    {profileData.bio}
                  </p>
                </div>
              )}

              {profileData.location && (
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                    Location
                  </label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                    {profileData.location}
                  </p>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Created
                </label>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                  {formatDate(profileData.createdAt)}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-black)', opacity: 0.7 }}>
                  Activity
                </label>
                <div style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                  <span style={{ marginRight: '1rem' }}>📄 {profileData.metrics.articlesPublished} Articles</span>
                  <span style={{ marginRight: '1rem' }}>💡 {profileData.metrics.proposalsCreated} Proposals</span>
                  <span>💰 {profileData.metrics.totalTipsReceived} Tips</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-parchment)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}>
              <strong>Profile NFT</strong><br/>
              This NFT represents your identity on the ImmutableType platform. It contains your profile information and tracks your contributions to local journalism.
            </div>
          </div>
        );

      case 'emoji':
        const emojiData = data as { balance: string };
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-alert-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'white',
                fontSize: '3rem',
              }}>
                😊
              </div>
              <h2 style={{
                fontFamily: 'var(--font-headlines)',
                fontSize: '1.8rem',
                margin: '0 0 0.5rem 0',
                color: 'var(--color-alert-amber)',
              }}>
                EMOJI Token Balance
              </h2>
              <p style={{
                fontSize: '2rem',
                color: 'var(--color-black)',
                margin: 0,
                fontWeight: 'bold',
              }}>
                {parseFloat(emojiData.balance).toLocaleString()} EMOJI
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-parchment)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              textAlign: 'center',
            }}>
              <strong>EMOJI Credits</strong><br/>
              Use EMOJI tokens to engage with content through reactions, voting, and other platform activities. Earn more through daily participation and community contributions.
            </div>
          </div>
        );

      default:
        return <div>Unknown token type</div>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-black)',
            opacity: 0.7,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailModal;