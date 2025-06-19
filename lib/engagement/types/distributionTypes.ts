// lib/engagement/types/distributionTypes.ts

export interface DistributionEntity {
    name: string;
    emoji: string;
    amount: number;
    percentage?: number;
  }
  
  export interface DistributionModel {
    article: {
      author: number;
      platform: number;
      proposer: number;
    };
    proposal: {
      proposer: number;
      platform: number;
      futureAuthor: number;
    };
    community: {
      submitter: number;
      platform: number;
    };
  }
  
  export interface EmojiEarningsProps {
    contentType: 'article' | 'proposal' | 'community';
    distribution: {
      author?: number;
      proposer?: number;
      platform?: number;
      submitter?: number;
      futureAuthor?: number;
      total?: number;
    };
    className?: string;
  }
  
  export interface DistributionGridProps {
    entities: DistributionEntity[];
    className?: string;
  }
  
  export interface EntityColumnProps {
    entity: DistributionEntity;
    className?: string;
  }