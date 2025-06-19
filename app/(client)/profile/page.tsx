// app/(client)/profile/page.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import ProfileCard from '@/components/profile/ProfileCard';
import Leaderboard from '@/components/profile/Leaderboard';
import { useProfiles } from '@/lib/profile/hooks/useProfiles';
import { useWallet } from '@/lib/hooks/useWallet';

type TabType = 'profiles' | 'leaderboard';

export default function ProfilesPage() {
  const { profiles, isLoading, isRefreshing, error, hasMore, loadMore, refresh } = useProfiles(10); // Start with 10, load more as needed
  const { address } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('profiles');
  
  // Filter profiles for the profiles tab (show first 9)
  const displayProfiles = profiles.slice(0, 9);
  
  const filteredProfiles = searchTerm
    ? displayProfiles.filter(
        profile => 
          profile.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.id.includes(searchTerm) ||
          profile.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.membershipTokenId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayProfiles;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '2rem',
          margin: 0,
        }}>
          Community
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {isRefreshing && (
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--color-digital-silver)',
            }}>
              Refreshing...
            </span>
          )}
          
          <button
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              padding: '0.5rem 1rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              cursor: isLoading || isRefreshing ? 'default' : 'pointer',
              opacity: isLoading || isRefreshing ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔄</span>
            Refresh
          </button>
          
          <Link href="/profile/create">
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
              Create Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--color-digital-silver)',
      }}>
        <button
          onClick={() => setActiveTab('profiles')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0',
            fontFamily: 'var(--font-ui)',
            fontSize: '1.1rem',
            fontWeight: activeTab === 'profiles' ? 'bold' : 'normal',
            color: activeTab === 'profiles' ? 'var(--color-black)' : 'var(--color-digital-silver)',
            borderBottom: activeTab === 'profiles' ? '3px solid var(--color-typewriter-red)' : 'none',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Profiles
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0',
            fontFamily: 'var(--font-ui)',
            fontSize: '1.1rem',
            fontWeight: activeTab === 'leaderboard' ? 'bold' : 'normal',
            color: activeTab === 'leaderboard' ? 'var(--color-black)' : 'var(--color-digital-silver)',
            borderBottom: activeTab === 'leaderboard' ? '3px solid var(--color-typewriter-red)' : 'none',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profiles' && (
        <>
          {/* Search Bar */}
          <div style={{
            marginBottom: '2rem',
          }}>
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-digital-silver)',
                fontSize: '1rem',
                fontFamily: 'var(--font-ui)',
              }}
            />
          </div>

          {isLoading && profiles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-black)',
              opacity: 0.7,
            }}>
              Loading profiles from blockchain...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-typewriter-red)',
            }}>
              Error loading profiles: {error.message}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-black)',
              opacity: 0.7,
            }}>
              {searchTerm 
                ? `No profiles found matching "${searchTerm}"`
                : 'No profiles available yet'
              }
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}>
                {filteredProfiles.map((profile) => (
                  <ProfileCard 
                    key={profile.id} 
                    profile={profile} 
                  />
                ))}
              </div>
              
              {hasMore && displayProfiles.length < profiles.length && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '2rem',
                }}>
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-black)',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 500,
                      padding: '0.5rem 1.5rem',
                      border: '1px solid var(--color-digital-silver)',
                      borderRadius: '4px',
                      cursor: isLoading ? 'default' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          {isLoading && profiles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-black)',
              opacity: 0.7,
            }}>
              Loading leaderboard data...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-typewriter-red)',
            }}>
              Error loading leaderboard: {error.message}
            </div>
          ) : (
            <Leaderboard 
              profiles={profiles} 
              currentUserAddress={address || undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}