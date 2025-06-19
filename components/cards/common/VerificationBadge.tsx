// components/cards/common/VerificationBadge.tsx
import React from 'react';

interface VerificationBadgeProps {
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ className = '' }) => {
  return (
    <span className={`badge verification-badge ${className}`}>
      Verified
    </span>
  );
};

export default VerificationBadge;