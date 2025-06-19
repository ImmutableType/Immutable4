// components/proposals/cards/ProposalStatusBadge.tsx
import React from 'react';

interface ProposalStatusBadgeProps {
  status: 'active' | 'completed' | 'canceled';
}

const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: 'rgba(29, 127, 110, 0.1)',
          color: '#1D7F6E',
          border: '1px solid #1D7F6E'
        };
      case 'completed':
        return {
          backgroundColor: 'rgba(43, 57, 144, 0.1)',
          color: '#2B3990',
          border: '1px solid #2B3990'
        };
      case 'canceled':
        return {
          backgroundColor: 'rgba(179, 33, 30, 0.1)',
          color: '#B3211E',
          border: '1px solid #B3211E'
        };
      default:
        return {};
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      default:
        return '';
    }
  };

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'var(--font-ui)',
      ...getStatusStyles()
    }}>
      {getStatusText()}
    </span>
  );
};

export default ProposalStatusBadge;