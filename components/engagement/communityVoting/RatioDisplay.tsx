// components/engagement/communityVoting/RatioDisplay.tsx

import React from 'react';

interface RatioDisplayProps {
  percentage: number;
  className?: string;
}

const RatioDisplay: React.FC<RatioDisplayProps> = ({
  percentage,
  className = '',
}) => {
  // Round percentage to nearest integer
  const roundedPercentage = Math.round(percentage);
  
  return (
    <div className={`ratio-display ${className}`}>
      {roundedPercentage}% positive community rating
    </div>
  );
};

export default RatioDisplay;