// components/proposals/cards/ProposalCardList.tsx
import React from 'react';
import Link from 'next/link';
import { ProposalCardProps } from '../../../lib/types/proposal';
import ProposalStatusBadge from './ProposalStatusBadge';

const ProposalCardList: React.FC<ProposalCardProps> = ({ proposal, onClick }) => {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate funding progress percentage
  const fundingProgress = Math.min(
    Math.round((proposal.fundingAmount / proposal.fundingGoal) * 100),
    100
  );

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(proposal.id);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: '16px'
      }}
      className="proposal-card"
      onClick={handleClick}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            fontFamily: "'Special Elite', monospace"
          }}>
            {proposal.title}
          </h3>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
          Proposed by: {proposal.proposer} • {formatDate(proposal.createdAt)}
        </p>
        
        <p style={{ marginBottom: '12px' }}>
          {proposal.summary}
        </p>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {proposal.category}
          </span>
          <span style={{ 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {proposal.location}
          </span>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '180px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          width: '100%'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {proposal.voteCount} votes
          </span>
          <div style={{
            height: '8px',
            width: '100%',
            backgroundColor: '#E9ECEF',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${fundingProgress}%`,
              backgroundColor: '#B3211E',
              borderRadius: '4px'
            }}></div>
          </div>
          <span style={{ fontSize: '14px' }}>
            ${proposal.fundingAmount} of ${proposal.fundingGoal} ({fundingProgress}%)
          </span>
        </div>
        
        <Link
          href={`/news-proposals/${proposal.id}`}
          style={{
            padding: '8px 12px',
            backgroundColor: '#000000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
      
      <style jsx>{`
        .proposal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .proposal-card {
            flex-direction: column;
          }
          
          .proposal-card > div:last-child {
            width: 100%;
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProposalCardList;