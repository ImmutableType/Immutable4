// components/engagement/revenueDist/EntityColumn.tsx
import React from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { EntityColumnProps } from '../../../lib/engagement/types/distributionTypes';

const EntityColumn: React.FC<EntityColumnProps> = ({
  entity,
  className = '',
}) => {
  // Get display label based on entity name
  const getLabel = (name: string) => {
    switch(name) {
      case 'author': return 'Author';
      case 'proposer': return 'Proposer';
      case 'platform': return 'Platform';
      case 'submitter': return 'Submitter';
      case 'futureAuthor': return 'Future Author';
      case 'total': return 'Total';
      default: return name;
    }
  };

  // Format the amount to 2 decimal places maximum
  const formattedAmount = typeof entity.amount === 'number' 
    ? Number(entity.amount.toFixed(2)) // Converts to number with max 2 decimal places
    : entity.amount;

  return (
    <div className={`${styles.earningsEntity} ${className}`}>
      <div className={styles.earningsAmount}>
        <span>{entity.emoji}</span> {formattedAmount}
      </div>
      <div className={styles.earningsLabel}>
        {getLabel(entity.name.toString())}
      </div>
    </div>
  );
};

export default EntityColumn;