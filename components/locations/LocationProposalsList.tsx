// components/locations/LocationProposalsList.tsx
'use client'
import React from 'react';
import { useProposals } from '../../lib/hooks/proposals/useProposals';
import ProposalCard from '../proposals/cards/ProposalCard';

interface LocationProposalsListProps {
  city: string;
  state: string;
}

export default function LocationProposalsList({ city, state }: LocationProposalsListProps) {
  // Use the existing proposal hooks
  const { proposals, loading, error } = useProposals();
  
  // Filter proposals for this location
  const locationProposals = proposals.filter(proposal => 
    proposal.location?.includes(`${city}, ${state}`)
  );
  
  if (loading) return (
    <div className="location-proposals-list">
      <div style={{ textAlign: 'center', padding: '32px' }}>
        Loading proposals...
      </div>
    </div>
  );
  
  if (error) return (
    <div className="location-proposals-list">
      <div style={{ textAlign: 'center', padding: '32px', color: '#B32211' }}>
        Error loading proposals: {error}
      </div>
    </div>
  );
  
  return (
    <div className="location-proposals-list">
      {locationProposals.length === 0 ? (
        <p>No proposals found for this location.</p>
      ) : (
        <div className="proposals-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {locationProposals.map(proposal => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal}
            />
          ))}
        </div>
      )}
    </div>
  );
}