// components/proposals/cards/ProposalCardGrid.tsx
import React from 'react';
import { Proposal } from '../../../lib/hooks/proposals/useProposals';
import ProposalCard from './ProposalCard';

interface ProposalCardGridProps {
  proposal: Proposal;
  onClick?: (proposal: Proposal) => void;
}

const ProposalCardGrid: React.FC<ProposalCardGridProps> = ({ proposal, onClick }) => {
  return (
    <div style={{ height: '100%' }}>
      <ProposalCard proposal={proposal} onClick={onClick} />
    </div>
  );
};

export default ProposalCardGrid;