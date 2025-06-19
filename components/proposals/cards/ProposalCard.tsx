// components/proposals/cards/ProposalCard.tsx
import React from 'react';
import { Proposal } from '../../../lib/hooks/proposals/useProposals';

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: (proposal: Proposal) => void; // Add the onClick prop here
}

export default function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  return (
    <div 
      className="proposal-card" 
      style={{
        border: '1px solid #D9D9D9',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        cursor: onClick ? 'pointer' : 'default' // Add cursor style when clickable
      }}
      onClick={() => onClick && onClick(proposal)} // Handle the click event
    >
      {/* Rest of the component remains the same */}
      <h3 style={{ 
        marginTop: 0, 
        fontFamily: "'Special Elite', monospace" 
      }}>
        {proposal.title}
      </h3>
      
      <div style={{ 
        fontSize: '0.9em', 
        color: '#666', 
        marginBottom: '12px' 
      }}>
        By: {proposal.proposerName || 'Anonymous'} • {new Date(proposal.createdAt).toLocaleDateString()}
      </div>
      
      <p style={{ marginBottom: '16px' }}>{proposal.summary}</p>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '4px' }}>
          Funding: ${proposal.fundingAmount} of ${proposal.fundingGoal}
        </div>
        <div style={{ 
          height: '8px',
          backgroundColor: '#F4F1E8',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%',
            width: `${Math.min(100, (proposal.fundingAmount / proposal.fundingGoal) * 100)}%`,
            backgroundColor: '#B3211E',
            borderRadius: '4px'
          }}></div>
        </div>
      </div>
      
      {proposal.tags && proposal.tags.length > 0 && (
        <div style={{ 
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {proposal.tags.map(tag => (
            <span key={tag} style={{
              backgroundColor: '#F4F1E8',
              fontSize: '0.8em',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#000000'
            }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}