// components/profile/ProfileCard.tsx
import React from 'react';
import Link from 'next/link';
import { Profile } from '@/lib/profile/types/profile';

interface ProfileCardProps {
  profile: Profile;
  isCompact?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isCompact = false }) => {
  // Format wallet address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      border: '1px solid var(--color-digital-silver)',
      borderRadius: '4px',
      padding: isCompact ? '1rem' : '1.5rem',
      marginBottom: '1rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }} 
    className="article-card"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: isCompact ? '0.5rem' : '1rem',
      }}>
        {/* Avatar */}
        <div style={{
          width: isCompact ? '48px' : '64px',
          height: isCompact ? '48px' : '64px',
          borderRadius: '50%',
          overflow: 'hidden',
          marginRight: '1rem',
          backgroundColor: 'var(--color-digital-silver)',
          flexShrink: 0,
        }}>
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl.replace('ipfs://', 'https://magenta-magic-haddock-509.mypinata.cloud/ipfs/')} 
              alt={profile.displayName || formatAddress(profile.walletAddress)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-parchment)',
              fontSize: isCompact ? '16px' : '20px',
              fontFamily: 'var(--font-headlines)',
            }}>
              {(profile.displayName || formatAddress(profile.walletAddress)).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: isCompact ? '1.1rem' : '1.4rem',
            margin: 0,
            marginBottom: '0.25rem',
          }}>
            {profile.displayName || formatAddress(profile.walletAddress)}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--color-digital-silver)',
            fontFamily: 'var(--font-ui)',
          }}>
            {/* Profile ID */}
            <span>Profile ID #{profile.id}</span>
            
            {/* Membership Token ID */}
            {profile.membershipTokenId && (
              <>
                <span>•</span>
                <span>IT{profile.membershipTokenId.padStart(2, '0')}</span>
              </>
            )}
            
            {/* Verification Badge */}
            {profile.isVerified && (
              <>
                <span>•</span>
                <span className="verification-indicator" style={{ color: 'var(--color-earth-brown)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio - Only show if not compact and bio exists */}
      {!isCompact && profile.bio && (
        <p style={{
          margin: '0 0 1rem 0',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          color: 'var(--color-black)',
        }}>
          {profile.bio}
        </p>
      )}

      {/* Location - Only show if exists */}
      {profile.location && (
        <div style={{
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'var(--color-digital-silver)',
          fontFamily: 'var(--font-ui)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {profile.location}
        </div>
      )}

      {/* Metrics */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: isCompact ? '0.5rem' : '1rem',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-ui)',
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>{profile.metrics.articlesPublished}</span> Articles
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>{profile.metrics.proposalsCreated}</span> Proposals
        </div>
        {!isCompact && (
          <>
            <div>
              <span style={{ fontWeight: 'bold' }}>{profile.metrics.proposalsFunded}</span> Funded
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>{profile.metrics.totalTipsReceived}</span> Tips
            </div>
          </>
        )}
      </div>

      {/* View Profile Button - Only on non-compact cards */}
      {!isCompact && (
        <div style={{ marginTop: '1.25rem' }}>
          <Link href={`/profile/${profile.id}`}>
            <button style={{
              backgroundColor: 'var(--color-typewriter-red)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#8C1A17';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
            }}
            >
              View Profile
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;