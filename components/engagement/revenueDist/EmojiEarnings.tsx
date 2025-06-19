// components/engagement/revenueDist/EmojiEarnings.tsx
import React from 'react';
import styles from '../../cards/base/EngagementPane.module.css'; // Import from EngagementPane module
import { EmojiEarningsProps, DistributionEntity } from '../../../lib/engagement/types/distributionTypes';
import DistributionGrid from './DistributionGrid';

const EmojiEarnings: React.FC<EmojiEarningsProps> = ({
  contentType,
  distribution = {},
  className = '',
}) => {
  // Define emoji mapping for different entities
  const entityEmojis = {
    author: '👑',
    proposer: '💡',
    platform: '🏛️',
    submitter: '🔍',
    futureAuthor: '⏳',
    total: '⚡'
  };

  // Create entities array based on content type
  const getEntities = () => {
    const entities: DistributionEntity[] = [];

    if (contentType === 'article') {
      if (distribution.author !== undefined) {
        entities.push({
          name: 'author',
          emoji: entityEmojis.author,
          amount: distribution.author,
          percentage: 45
        });
      }
      
      if (distribution.platform !== undefined) {
        entities.push({
          name: 'platform',
          emoji: entityEmojis.platform,
          amount: distribution.platform,
          percentage: 25
        });
      }
      
      if (distribution.proposer !== undefined) {
        entities.push({
          name: 'proposer',
          emoji: entityEmojis.proposer,
          amount: distribution.proposer,
          percentage: 30
        });
      }
    } else if (contentType === 'proposal') {
      // ... other entity mappings remain unchanged
    } else if (contentType === 'community') {
      // Add community-specific distribution entities
      if (distribution.submitter !== undefined) {
        entities.push({
          name: 'submitter',
          emoji: entityEmojis.submitter,
          amount: 70,  // Sample amount, should come from distribution.submitter
          percentage: 70
        });
      }
      
      if (distribution.platform !== undefined) {
        entities.push({
          name: 'platform',
          emoji: entityEmojis.platform,
          amount: 30,  // Sample amount, should come from distribution.platform
          percentage: 30
        });
      }
      
      if (distribution.total !== undefined) {
        entities.push({
          name: 'total',
          emoji: entityEmojis.total,
          amount: 100,  // Sample amount, should come from distribution.total
          percentage: 100
        });
      }
    }

    return entities;
  };

  return (
    <div className={`${styles.emojiEarnings} ${className}`}>
      <h3 className={styles.sectionTitle}>Emojis Earned</h3>
      <DistributionGrid entities={getEntities()} />
    </div>
  );
};

export default EmojiEarnings;