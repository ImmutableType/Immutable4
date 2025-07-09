// app/(client)/news-proposals/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Proposal } from '../../../lib/types/proposal';
import ProposalCardGrid from '../../../components/proposals/cards/ProposalCardGrid';
import ProposalCardList from '../../../components/proposals/cards/ProposalCardList';
import { useProposals } from '@/lib/proposals/hooks/useProposals';
import { useUserClaimTokens } from '@/lib/proposals/hooks/useUserClaimTokens';
import { useWallet } from '@/lib/hooks/useWallet';

export default function NewsProposalsPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { proposals, loading, error, totalProposals, refetch } = useProposals();
  const { claimableArticles, loading: claimsLoading } = useUserClaimTokens();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Page state:', {
      proposals: proposals.length,
      loading,
      error,
      totalProposals
    });
  }, [proposals, loading, error, totalProposals]);

  // Filter proposals based on category
  const filteredProposals = categoryFilter
    ? proposals.filter(p => p.category === categoryFilter)
    : proposals;

  // Handle proposal card click for grid (expects Proposal object)
  const handleProposalClick = (proposal: Proposal) => {
    router.push(`/news-proposals/${proposal.id}`);
  };

  // Handle proposal card click for list (expects string id)
  const handleProposalClickById = (id: string) => {
    window.location.href = `/news-proposals/${id}`;
  };

  // Get unique categories from actual proposals
  const categories = ['All'];
  const uniqueCategories = new Set(proposals.map(p => p.category));
  categories.push(...Array.from(uniqueCategories).filter(c => c));

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="news-proposals-page">
      {/* Claimable Articles Alert */}
      {isConnected && claimableArticles.length > 0 && !claimsLoading && (
        <div style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFE8A1',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px',
            fontFamily: "'Special Elite', monospace",
            color: '#856404'
          }}>
            🎉 You have articles ready to claim!
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {claimableArticles.map((article) => (
              <div
                key={article.proposalId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(133, 100, 4, 0.1)'
                }}
              >
                <div>
                  <span style={{ fontWeight: '500' }}>{article.proposalTitle}</span>
                  <span style={{ color: '#856404', marginLeft: '8px' }}>
                    - {article.nftCount} NFT{article.nftCount > 1 ? 's' : ''} claimable
                  </span>
                </div>
                <button
                  style={{
                    padding: '6px 16px',
                    backgroundColor: article.isPublished ? '#856404' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: article.isPublished ? 'pointer' : 'not-allowed',
                    fontWeight: '500'
                  }}
                  disabled={!article.isPublished}
                  onClick={() => {
                    if (article.isPublished) {
                      alert('Claiming functionality coming soon!');
                    }
                  }}
                >
                  {article.isPublished ? 'Claim Now' : 'Article Pending'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          News Proposals
        </h1>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          Welcome to the News Proposals hub. This is where community members and journalists can submit news story ideas, collaborate on reporting, and vote on which stories should be covered next.
        </p>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          Connect your wallet to participate in the governance of community journalism.
          {totalProposals > 0 && (
            <span style={{ fontWeight: '500' }}> Currently {totalProposals} proposal{totalProposals > 1 ? 's' : ''} on-chain.</span>
          )}
        </p>
      </div>
     
      {/* Controls for filtering and view mode */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category === 'All' ? null : category)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                backgroundColor: 
                  (category === 'All' && categoryFilter === null) || 
                  category === categoryFilter 
                    ? '#000000' 
                    : 'white',
                color: 
                  (category === 'All' && categoryFilter === null) || 
                  category === categoryFilter 
                    ? 'white' 
                    : '#000000',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {category}
            </button>
          ))}
        </div>
       
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px 0 0 4px',
              border: '1px solid #D9D9D9',
              borderRight: viewMode === 'grid' ? '1px solid #D9D9D9' : 'none',
              backgroundColor: viewMode === 'grid' ? '#000000' : 'white',
              color: viewMode === 'grid' ? 'white' : '#000000',
              cursor: 'pointer'
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 12px',
              borderRadius: '0 4px 4px 0',
              border: '1px solid #D9D9D9',
              borderLeft: viewMode === 'list' ? '1px solid #D9D9D9' : 'none',
              backgroundColor: viewMode === 'list' ? '#000000' : 'white',
              color: viewMode === 'list' ? 'white' : '#000000',
              cursor: 'pointer'
            }}
          >
            List
          </button>
        </div>
      </div>
     
      <div style={{
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          {categoryFilter ? `${categoryFilter} Proposals` : 'Active Proposals'}
        </h2>
       
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p>Loading proposals from blockchain...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: '#B3211E', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={refetch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : totalProposals === 0 ? (
          // Only show "no proposals" if totalProposals is actually 0
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p>No proposals have been created yet. Be the first to create one!</p>
          </div>
        ) : proposals.length === 0 && totalProposals > 0 ? (
          // Show loading error if we know proposals exist but couldn't fetch them
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: '#B3211E', marginBottom: '16px' }}>
              Failed to load proposals. We know there are {totalProposals} proposal{totalProposals > 1 ? 's' : ''} on-chain but couldn't fetch them.
            </p>
            <button
              onClick={refetch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredProposals.length === 0 && categoryFilter ? (
          // Category filter with no results
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p>No {categoryFilter} proposals found. Try selecting a different category.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {filteredProposals.map(proposal => (
              <ProposalCardGrid 
                key={proposal.id} 
                proposal={proposal} 
                onClick={handleProposalClick}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {filteredProposals.map(proposal => (
              <ProposalCardList 
                key={proposal.id} 
                proposal={proposal} 
                onClick={handleProposalClickById}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if there are more proposals) */}
        {!loading && proposals.length > 0 && totalProposals > proposals.length && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ marginBottom: '16px', color: '#6c757d' }}>
              Showing {proposals.length} of {totalProposals} proposals
            </p>
            <button
              onClick={() => alert('Pagination coming soon!')}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#000',
                border: '1px solid #000',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Load More
            </button>
          </div>
        )}
      </div>
     
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Have a Story Idea?
        </h2>
        <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
          Submit your own news proposal and let the community decide if it should be covered. Connect your wallet to get started.
        </p>
        <Link 
          href="/news-proposals/create"
          style={{
            padding: '12px 24px',
            backgroundColor: '#B3211E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Submit a Proposal
        </Link>
      </div>
    </div>
  );
}