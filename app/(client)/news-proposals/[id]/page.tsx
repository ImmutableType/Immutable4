// app/(client)/news-proposals/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Proposal, EngagementData } from '../../../../lib/types/proposal';
import { mockProposalService, mockEngagementService } from '../../../../lib/mockData/mockService';
import ProposalStatusBadge from '../../../../components/proposals/cards/ProposalStatusBadge';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      try {
        if (!params.id) {
          throw new Error('No proposal ID provided');
        }

        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        
        // Fetch proposal details
        const proposalData = await mockProposalService.getProposalById(id);
        setProposal(proposalData);
        
        // Fetch engagement data
        const engagementData = await mockEngagementService.getEngagement(id);
        setEngagement(engagementData);
        
      } catch (err) {
        console.error('Error fetching proposal details:', err);
        setError('Failed to load proposal details. The proposal may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposalDetails();
  }, [params.id]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate funding progress percentage
  const calculateFundingProgress = () => {
    if (!proposal) return 0;
    return Math.min(
      Math.round((proposal.fundingAmount / proposal.fundingGoal) * 100),
      100
    );
  };

  // Render markdown content (simple version)
  const renderMarkdown = (content: string) => {
    // This is a simple rendering - in a real app, you'd use a markdown parser
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <p>Loading proposal details...</p>
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
        <span style={{ color: '#000000', fontWeight: '500' }}>{proposal.title}</span>
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
          <ProposalStatusBadge status={proposal.status} />
        </div>

        <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '16px' }}>
          Proposed by: {proposal.proposer} • {formatDate(proposal.createdAt)}
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
            {proposal.summary}
          </p>
        </div>

        {/* Engagement Stats */}
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
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{proposal.voteCount}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Votes</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${proposal.fundingAmount.toFixed(1)}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Funded</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{proposal.journalistInterest || 0}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Journalists</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{engagement?.comments?.length || 0}</div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Comments</div>
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
            <span>${proposal.fundingAmount.toFixed(1)} of ${proposal.fundingGoal.toFixed(1)} ({fundingProgress}%)</span>
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
              borderRadius: '5px'
            }}></div>
          </div>
        </div>
      </div>

      {/* Proposal Content Section */}
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

        {/* Tags if available */}
        {proposal.tags && proposal.tags.length > 0 && (
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
              {proposal.tags.map((tag, index) => (
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

        {/* Timeline if available */}
        {proposal.timeline && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Estimated Timeline
            </h3>
            <p>{proposal.timeline}</p>
          </div>
        )}

        {/* Content Format if available */}
        {proposal.contentFormat && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Deliverable Format
            </h3>
            <p>{proposal.contentFormat}</p>
          </div>
        )}
      </div>

      {/* Engagement Section */}
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
          Engagement Options
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Vote Option */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #D9D9D9',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Vote on this Proposal
            </h3>
            <p style={{ marginBottom: '16px' }}>Support this proposal with your vote. Connect your wallet to participate.</p>
            <button 
              style={{
                padding: '10px 0',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => alert('Wallet connection required')}
            >
              Connect to Vote
            </button>
          </div>

          {/* Fund Option */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #D9D9D9',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Fund this Research
            </h3>
            <p style={{ marginBottom: '16px' }}>Contribute to making this proposal a reality. Connect your wallet to fund.</p>
            <button 
              style={{
                padding: '10px 0',
                backgroundColor: '#B3211E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => alert('Wallet connection required')}
            >
              Connect to Fund
            </button>
          </div>

          {/* Journalist Interest Option */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #D9D9D9',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Journalist Interest
            </h3>
            <p style={{ marginBottom: '16px' }}>Are you a journalist interested in covering this story? Connect your wallet to register.</p>
            <button 
              style={{
                padding: '10px 0',
                backgroundColor: '#2B3990',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => alert('Wallet connection required')}
            >
              Connect as Journalist
            </button>
          </div>
        </div>
      </div>

      {/* Updates Section */}
      {proposal.updates && proposal.updates.length > 0 && (
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
            Recent Updates
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {proposal.updates.map((update, index) => (
              <div 
                key={index}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #D9D9D9',
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px'
                }}>
                  <p style={{ fontWeight: 'bold' }}>Update #{index + 1}</p>
                  <p style={{ color: '#6c757d', fontSize: '14px' }}>
                    {formatDate(update.date)}
                  </p>
                </div>
                <p>{update.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}