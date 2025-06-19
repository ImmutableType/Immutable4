// components/engagement/revenueDist/DistributionGrid.tsx
import React from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { DistributionGridProps } from '../../../lib/engagement/types/distributionTypes';
import EntityColumn from './EntityColumn';

const DistributionGrid: React.FC<DistributionGridProps> = ({
  entities,
  className = '',
}) => {
  return (
    <div className={`${styles.earningsGrid} ${className}`}>
      {entities.map((entity, index) => (
        <EntityColumn 
          key={`${entity.name}-${index}`} 
          entity={entity}
        />
      ))}
    </div>
  );
};

export default DistributionGrid;