// app/(client)/profile/[identifier]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useProfile } from '../../../../lib/profile/hooks/useProfile';
import { useProfileActivity } from '../../../../lib/profile/hooks/useProfileActivity';
import ProfileHeader from '../../../../components/profile/ProfileHeader';
import ActivityFeed from '../../../../components/profile/ActivityFeed';
import TokenGate from '../../../../components/publishing/TokenGate';
import ArticleTypeSelector from '../../../../components/publishing/ArticleTypeSelector';
import { useRouter } from 'next/navigation';
import { useHasPublisherToken } from '../../../../lib/hooks/useHasPublisherToken';
import { useHasMembershipToken } from '../../../../lib/hooks/useHasMembershipToken';
import Collection from '../../../../components/profile/Collection';
import Bookmarks from '@/components/profile/Bookmarks';
import ArticlesTab from '@/components/profile/ArticlesTab';
import CuratedTab from '@/components/profile/CuratedTab';
import PortfolioTab from '@/components/profile/PortfolioTab';

// Membership token contract details
const MEMBERSHIP_TOKEN_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';
const MEMBERSHIP_TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function isTokenMinted(uint256 tokenId) external view returns (bool)",
  "function getMember(uint256 tokenId) external view returns (address owner, string memory name, uint256 mintedAt, bool isActive)"
];

export default async function ProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const router = useRouter();
  
  const { profile, isOwner, isLoading: profileLoading, error: profileError } = useProfile(identifier);
  const { activities, isLoading: activitiesLoading, error: activitiesError, hasMore, loadMore } = useProfileActivity(identifier);

  const [activeTab, setActiveTab] = useState<'activity' | 'articles' | 'curated' | 'portfolio' | 'collection' | 'bookmarked' | 'publish'>('activity');
  const [membershipTokenId, setMembershipTokenId] = useState<string | undefined>(undefined);
  const [tokenImageUrl, setTokenImageUrl] = useState<string | undefined>(undefined);
  const { hasMembershipToken } = useHasMembershipToken();
  const { hasPublisherToken } = useHasPublisherToken();

  // Get membership token for this specific profile
  useEffect(() => {
    async function fetchMembershipToken() {
      if (!profile?.walletAddress) return;
      
      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const contract = new ethers.Contract(
          MEMBERSHIP_TOKEN_ADDRESS,
          MEMBERSHIP_TOKEN_ABI,
          provider
        );
        
        const balance = await contract.balanceOf(profile.walletAddress);
        if (balance > BigInt(0)) {
          console.log('Wallet has membership token(s)');
          
          // Check tokens 0-99 to find which one this wallet owns
          for (let i = 0; i <= 99; i++) {
            try {
              // Check if token exists
              const exists = await contract.isTokenMinted(i);
              if (!exists) continue;
              
              // Check if this wallet owns this token
              const owner = await contract.ownerOf(i);
              if (owner.toLowerCase() === profile.walletAddress.toLowerCase()) {
                console.log(`Found token ID: ${i}`);
                const formattedTokenId = `IT${i.toString().padStart(2, '0')}`;
                setMembershipTokenId(formattedTokenId);
                
                // Get the tokenURI which contains the SVG
                try {
                  const tokenURI = await contract.tokenURI(i);
                  console.log('Token URI:', tokenURI);
                  
                  // The tokenURI is a data URI with base64 encoded JSON
                  if (tokenURI.startsWith('data:application/json;base64,')) {
                    const base64Data = tokenURI.replace('data:application/json;base64,', '');
                    const jsonString = atob(base64Data);
                    const metadata = JSON.parse(jsonString);
                    console.log('Token metadata:', metadata);
                    
                    // The image is an SVG data URI
                    setTokenImageUrl(metadata.image);
                  }
                } catch (metadataError) {
                  console.error('Error parsing token metadata:', metadataError);
                  // Generate a fallback
                  setTokenImageUrl(`https://api.dicebear.com/7.x/shapes/svg?seed=${i}`);
                }
                
                break; // Found the token, exit loop
              }
            } catch (e) {
              // This token doesn't exist or error checking ownership
              continue;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching membership token:', error);
      }
    }
    
    fetchMembershipToken();
  }, [profile?.walletAddress]);

  if (profileLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Loading profile...
      </div>
    );
  }
  
  if (profileError || !profile) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--color-typewriter-red)',
      }}>
        Error: {profileError?.message || 'Profile not found'}
      </div>
    );
  }
  
  return (
    <div style={{ marginTop: '-20px' }}> {/* Negative margin to pull content up */}
      {/* Miami-themed Cover Image Area */}
      <div style={{
        height: '200px',
        borderRadius: '4px',
        marginBottom: '1rem',
        position: 'relative',
        background: `linear-gradient(135deg, 
          #FF6B9D 0%, 
          #C44569 25%, 
          #F8B500 50%, 
          #00CDAC 75%, 
          #4ECDC4 100%)`,
        overflow: 'hidden',
      }}>
        {/* Miami Art Deco Pattern Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }} />
        
        {/* Member Token Display */}
        {membershipTokenId && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            <span style={{
              color: 'var(--color-typewriter-red)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-ui)',
            }}>
              Member Token ID {membershipTokenId}
            </span>
          </div>
        )}
      </div>
    
      <ProfileHeader 
        profile={profile} 
        isOwner={isOwner} 
        membershipTokenId={membershipTokenId}
        tokenImageUrl={tokenImageUrl}
      />
      
      {/* Responsive Tabs */}
      <div style={{
        marginBottom: '1.5rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-digital-silver)',
          minWidth: 'fit-content',
        }}>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'activity' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'activity' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'activity' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Activity
          </button>
          
          <button
            onClick={() => setActiveTab('articles')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'articles' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'articles' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'articles' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Articles
          </button>
          
          <button
            onClick={() => setActiveTab('curated')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'curated' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'curated' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'curated' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Curated
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'portfolio' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'portfolio' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'portfolio' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Portfolio
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'collection' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'collection' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'collection' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Collection
          </button>
          
          <button
            onClick={() => setActiveTab('bookmarked')}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === 'bookmarked' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: activeTab === 'bookmarked' ? 'bold' : 'normal',
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'bookmarked' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Bookmarked
          </button>

          {/* Only show Publish tab for profile owner */}
          {isOwner && (
            <button
              onClick={() => setActiveTab('publish')}
              style={{
                backgroundColor: 'transparent',
                color: activeTab === 'publish' ? 'var(--color-typewriter-red)' : 'var(--color-black)',
                fontFamily: 'var(--font-ui)',
                fontWeight: activeTab === 'publish' ? 'bold' : 'normal',
                padding: '0.75rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'publish' ? '2px solid var(--color-typewriter-red)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Publish
            </button>
          )}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'activity' && (
        <>
          <ActivityFeed 
            activities={activities} 
            isLoading={activitiesLoading} 
          />
          
          {hasMore && (
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              marginBottom: '2rem',
            }}>
              <button
                onClick={loadMore}
                disabled={activitiesLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-black)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500,
                  padding: '0.5rem 1.5rem',
                  border: '1px solid var(--color-digital-silver)',
                  borderRadius: '4px',
                  cursor: activitiesLoading ? 'default' : 'pointer',
                  opacity: activitiesLoading ? 0.7 : 1,
                }}
              >
                {activitiesLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          
          {activitiesError && (
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              color: 'var(--color-typewriter-red)',
            }}>
              Error loading activities: {activitiesError.message}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'articles' && (
        <ArticlesTab profile={profile} />
      )}
      
      {activeTab === 'curated' && (
        <CuratedTab profile={profile} />
      )}

      {activeTab === 'portfolio' && (
        <PortfolioTab profile={profile} />
      )}
      
      {activeTab === 'collection' && (
        <Collection profile={profile} isOwner={isOwner} />
      )}
      
      {activeTab === 'bookmarked' && (
        <Bookmarks profile={profile} isOwner={isOwner} />
      )}

      {activeTab === 'publish' && isOwner && (
        <div style={{
          padding: '1rem 0',
        }}>
          <TokenGate 
            profileId={identifier} 
            publishingType="community"
            fallback={
              <div style={{
                backgroundColor: 'var(--color-parchment)',
                padding: '2rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.3rem',
                  marginTop: 0,
                  marginBottom: '1rem',
                }}>
                  Publishing Access Required
                </h3>
                <p style={{
                  fontSize: '1rem',
                  margin: '0 0 1.5rem 0',
                  lineHeight: '1.5',
                }}>
                  You need a membership token (IT00-IT99) to access community publishing features, or a publisher credential for full access.
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  opacity: 0.8,
                }}>
                  Membership tokens are currently distributed by the admin.
                </p>
              </div>
            }
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}>
              {/* Publishing Options Section */}
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.5rem',
                  margin: '0 0 1rem 0',
                }}>
                  Publishing Options
                </h2>
                <ArticleTypeSelector profileId={identifier} />
              </div>

              {/* Additional Actions Section */}
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.5rem',
                  margin: '0 0 1rem 0',
                }}>
                  Additional Actions
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {/* Create Proposal Card */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-digital-silver)',
                      borderRadius: '4px',
                      padding: '1.5rem',
                      cursor: (hasMembershipToken || hasPublisherToken) ? 'pointer' : 'default',
                      opacity: (hasMembershipToken || hasPublisherToken) ? 1 : 0.6,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                    onClick={() => (hasMembershipToken || hasPublisherToken) && router.push('/news-proposals/create')}
                    onMouseOver={(e) => {
                      if (hasMembershipToken || hasPublisherToken) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (hasMembershipToken || hasPublisherToken) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      color: (hasMembershipToken || hasPublisherToken) ? 'var(--color-verification-green)' : 'var(--color-digital-silver)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: (hasMembershipToken || hasPublisherToken) ? 'rgba(29, 127, 110, 0.1)' : 'var(--color-parchment)',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </div>
                    
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-headlines)',
                        fontSize: '1.2rem',
                        margin: '0 0 0.5rem 0',
                      }}>
                        Create Proposal
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        margin: 0,
                        lineHeight: '1.5',
                      }}>
                        Submit a new story proposal for community funding
                      </p>
                    </div>
                    
                    {!(hasMembershipToken || hasPublisherToken) && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-typewriter-red)',
                        marginTop: 'auto',
                      }}>
                        Requires membership token or publisher credential
                      </div>
                    )}
                  </div>

                  {/* Manage Publications Card */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-digital-silver)',
                      borderRadius: '4px',
                      padding: '1.5rem',
                      cursor: hasPublisherToken ? 'pointer' : 'default',
                      opacity: hasPublisherToken ? 1 : 0.6,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                    onClick={() => hasPublisherToken && router.push(`/profile/${identifier}/publish/manage`)}
                    onMouseOver={(e) => {
                      if (hasPublisherToken) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (hasPublisherToken) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      color: hasPublisherToken ? 'var(--color-blockchain-blue)' : 'var(--color-digital-silver)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: hasPublisherToken ? 'rgba(43, 57, 144, 0.1)' : 'var(--color-parchment)',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                      </svg>
                    </div>
                    
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-headlines)',
                        fontSize: '1.2rem',
                        margin: '0 0 0.5rem 0',
                      }}>
                        Manage Publications
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        margin: 0,
                        lineHeight: '1.5',
                      }}>
                        View and manage your published articles
                      </p>
                    </div>
                    
                    {!hasPublisherToken && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-typewriter-red)',
                        marginTop: 'auto',
                      }}>
                        Requires publisher credential
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TokenGate>
        </div>
      )}
    </div>
  );
}