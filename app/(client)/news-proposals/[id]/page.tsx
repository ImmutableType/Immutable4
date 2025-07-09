// app/(client)/news-proposals/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { useProposal } from '@/lib/proposals/hooks/useProposal';
import { useProposalFunding } from '@/lib/proposals/hooks/useProposalFunding';
import { ProposalStatus } from '@/lib/blockchain/contracts/ProposalManager';
import ProposalStatusBadge from '../../../../components/proposals/cards/ProposalStatusBadge';

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const [id, setId] = useState<string>('');
  const [showFundingModal, setShowFundingModal] = useState(false);
  
  // Unwrap params
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  // Use the custom hooks
  const { proposal, loading, error } = useProposal(id);
  const {
    fundingInfo,
    userContribution,
    isInitialized,
    loading: fundingLoading,
    transactionState,
    initializeFunding,
    contributeFunding,
    withdrawFunding,
    refetch: refetchFunding
  } = useProposalFunding(id);

  // Convert status from contract enum to UI string
  const getUIStatus = (status: ProposalStatus): 'active' | 'completed' | 'canceled' => {
    switch (status) {
      case ProposalStatus.ACTIVE: return 'active';
      case ProposalStatus.FUNDED: return 'active'; // Show funded as active
      case ProposalStatus.CANCELLED: return 'canceled';
      case ProposalStatus.PUBLISHED: return 'completed';
      case ProposalStatus.ASSIGNED: return 'active';
      default: return 'active';
    }
  };

  // Format date to readable format
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate funding progress percentage
  const calculateFundingProgress = () => {
    if (!proposal || !fundingInfo) return 0;
    const funded = parseFloat(fundingInfo.totalFunded);
    const goal = parseFloat(proposal.fundingGoal);
    if (goal === 0) return 0;
    return Math.min(Math.round((funded / goal) * 100), 100);
  };

  // Truncate ethereum address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Render markdown content (simple version)
  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px' }}>{line.replace('## ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '20px' }}>{line.replace('- ', '')}</li>;
      } else if (line === '') {
        return <br key={i} />;
      } else {
        return <p key={i} style={{ marginBottom: '12px' }}>{line}</p>;
      }
    });
  };

  // Handle funding button click
  const handleFundingClick = async () => {
    if (!isConnected) {
      alert('Please connect your wallet to fund this proposal');
      return;
    }

    if (!isInitialized) {
      // Initialize funding first
      const success = await initializeFunding();
      if (success) {
        await refetchFunding();
      }
      return;
    }

    if (userContribution > 0) {
      // User already contributed
      const confirmWithdraw = window.confirm(
        'You have already contributed to this proposal. Do you want to withdraw your contribution? (10% penalty will apply)'
      );
      if (confirmWithdraw) {
        await withdrawFunding();
        await refetchFunding();
      }
      return;
    }

    // Show funding modal or directly fund
    setShowFundingModal(true);
  };

  // Handle actual funding
  const handleConfirmFunding = async () => {
    if (!proposal) return;
    
    const success = await contributeFunding(1, proposal.nftPrice); // 1 NFT for MVP
    if (success) {
      setShowFundingModal(false);
      await refetchFunding();
      alert('Successfully funded the proposal! You will receive a ClaimToken NFT.');
    }
  };

  // Get button text and style
  const getFundingButtonInfo = () => {
    if (!isConnected) {
      return { text: 'Connect Wallet to Fund', disabled: false, loading: false };
    }
    
    if (transactionState === 'pending' || transactionState === 'confirming') {
      return { text: 'Processing...', disabled: true, loading: true };
    }
    
    if (!isInitialized) {
      return { text: 'Initialize Funding', disabled: false, loading: false };
    }
    
    if (userContribution > 0) {
      return { text: 'Withdraw Contribution (10% penalty)', disabled: false, loading: false };
    }
    
    if (fundingInfo?.fundingComplete) {
      return { text: 'Funding Complete', disabled: true, loading: false };
    }
    
    return { text: 'Fund this Proposal', disabled: false, loading: false };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <p>Loading proposal from blockchain...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Proposal Not Found
        </h2>
        <p style={{ marginBottom: '24px' }}>{error || 'The requested proposal could not be found.'}</p>
        <Link
          href="/news-proposals"
          style={{
            padding: '10px 20px',
            backgroundColor: '#000000',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Back to Proposals
        </Link>
      </div>
    );
  }

  const fundingProgress = calculateFundingProgress();
  const statusString = getUIStatus(proposal.status);
  const buttonInfo = getFundingButtonInfo();
  const nftsSold = fundingInfo?.nftsSold || 0;

  return (
    <div className="proposal-detail-page">
      {/* Breadcrumb Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px',
        fontSize: '14px'
      }}>
        <Link 
          href="/news-proposals" 
          style={{ color: '#6c757d', textDecoration: 'none' }}
        >
          News Proposals
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#000000', fontWeight: '500' }}>Proposal #{proposal.id}</span>
      </div>

      {/* Proposal Header Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            fontFamily: "'Special Elite', monospace"
          }}>
            {proposal.title}
          </h1>
          <ProposalStatusBadge status={statusString} />
        </div>

        <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '16px' }}>
          Proposed by: {truncateAddress(proposal.proposer)} • {formatDate(proposal.createdAt)}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '4px 12px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {proposal.category}
            </span>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '4px 12px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {proposal.location}
            </span>
          </div>

          <p style={{ 
            fontSize: '18px', 
            lineHeight: '1.6',
            fontStyle: 'italic',
            marginBottom: '16px',
            padding: '16px',
            borderLeft: '3px solid #B3211E',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}>
            {proposal.tldr}
          </p>
        </div>

        {/* NFT Funding Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{nftsSold}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>NFTs Sold</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{proposal.nftCount}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Total NFTs</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{proposal.nftPrice} FLOW</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Per NFT</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{proposal.fundingGoal} FLOW</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Goal</div>
          </div>
        </div>
        
        {/* Funding Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontWeight: 'bold' }}>Funding Progress</span>
            <span>{nftsSold} of {proposal.nftCount} NFTs funded ({fundingProgress}%)</span>
          </div>
          <div style={{
            height: '10px',
            backgroundColor: '#E9ECEF',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${fundingProgress}%`,
              backgroundColor: '#B3211E',
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* User contribution info */}
        {isConnected && userContribution > 0 && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(43, 57, 144, 0.1)',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ✅ You have contributed {userContribution} NFT{userContribution > 1 ? 's' : ''} to this proposal
          </div>
        )}
      </div>

      {/* Proposal Content Section - same as before */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Proposal Details
        </h2>

        <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {proposal.description ? (
            renderMarkdown(proposal.description)
          ) : (
            <p>No detailed description provided for this proposal.</p>
          )}
        </div>

        {/* All other content sections remain the same */}
        {proposal.journalistRequirements && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Journalist Requirements
            </h3>
            <p>{proposal.journalistRequirements}</p>
          </div>
        )}

        {proposal.timeline && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Timeline
            </h3>
            <p>{proposal.timeline}</p>
          </div>
        )}

        {proposal.contentFormat && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Content Format
            </h3>
            <p>{proposal.contentFormat}</p>
          </div>
        )}

        {proposal.referenceUrls && proposal.referenceUrls.filter(url => url !== '').length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Reference Links
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              {proposal.referenceUrls.filter(url => url !== '').map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#B3211E' }}>
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposal.tags && proposal.tags.filter(tag => tag !== '').length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {proposal.tags.filter(tag => tag !== '').map((tag, index) => (
                <span 
                  key={index}
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    padding: '4px 12px', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Section - Updated with real funding */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Fund this Proposal
        </h2>

        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          border: '1px solid #D9D9D9',
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}>
          <p style={{ marginBottom: '16px' }}>
            Support this research by purchasing NFTs. Each NFT costs <strong>{proposal.nftPrice} FLOW</strong> and 
            represents your contribution to making this story happen.
            {fundingInfo && !fundingInfo.fundingComplete && (
              <span> Limited to 1 NFT per wallet during MVP.</span>
            )}
          </p>
          <button 
            style={{
              padding: '10px 0',
              backgroundColor: buttonInfo.disabled ? '#ccc' : '#B3211E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: buttonInfo.disabled ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: buttonInfo.loading ? 0.7 : 1
            }}
            disabled={buttonInfo.disabled || buttonInfo.loading}
            onClick={handleFundingClick}
          >
            {buttonInfo.text}
          </button>
          {!isInitialized && !fundingLoading && (
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px', textAlign: 'center' }}>
              First contributor will initialize the funding pool
            </p>
          )}
        </div>

        {/* Additional Actions */}
        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          gap: '16px'
        }}>
          <button 
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#2B3990',
              border: '1px solid #2B3990',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'not-allowed',
              opacity: 0.5
            }}
            disabled
          >
            Apply as Journalist
          </button>
          
          <button 
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={() => {
              const url = `${window.location.origin}/news-proposals/${proposal.id}`;
              navigator.clipboard.writeText(url);
              alert('Link copied to clipboard!');
            }}
          >
            Share Proposal
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '32px',
        marginBottom: '32px'
      }}>
        <Link
          href="/news-proposals"
          style={{
            padding: '10px 20px',
            backgroundColor: '#000000',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Back to Proposals
        </Link>
      </div>

      {/* Simple Funding Modal */}
      {showFundingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', fontFamily: "'Special Elite', monospace" }}>
              Confirm Funding
            </h3>
            <p style={{ marginBottom: '24px' }}>
              You are about to purchase 1 NFT for {proposal.nftPrice} FLOW to fund this proposal. 
              You will receive a ClaimToken NFT as proof of your contribution.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#B3211E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleConfirmFunding}
              >
                Confirm
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowFundingModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}