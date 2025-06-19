// lib/engagement/services/revenueDistributionService.ts

import { DistributionModel } from '../types/distributionTypes';

export interface RevenueDistributionService {
  getDistribution(contentId: string, contentType: string, totalReactions: number): Promise<Record<string, number>>;
  calculateDistribution(contentType: string, totalReactions: number): Record<string, number>;
  getDistributionModel(): DistributionModel;
}

export class MockRevenueDistributionService implements RevenueDistributionService {
  // Default distribution models
  private distributionModel: DistributionModel = {
    article: {
      author: 45,
      platform: 25,
      proposer: 30
    },
    proposal: {
      proposer: 60,
      platform: 40,
      futureAuthor: 0
    },
    community: {
      submitter: 70,
      platform: 30
    }
  };

  // Content-specific override distributions
  private contentDistributions: Record<string, Record<string, number>> = {};

  async getDistribution(contentId: string, contentType: string, totalReactions: number): Promise<Record<string, number>> {
    const key = `${contentType}-${contentId}`;
    
    // Check if there's a specific distribution for this content
    if (this.contentDistributions[key]) {
      return this.applyDistribution(this.contentDistributions[key], totalReactions);
    }
    
    // Otherwise use the default model
    return this.calculateDistribution(contentType, totalReactions);
  }
  calculateDistribution(contentType: string, totalReactions: number): Record<string, number> {
    if (!(contentType in this.distributionModel)) {
      throw new Error(`No distribution model found for content type: ${contentType}`);
    }
    
    const model = this.distributionModel[contentType as keyof DistributionModel];
    return this.applyDistribution(model, totalReactions);
  }

  private applyDistribution(model: Record<string, number>, totalReactions: number): Record<string, number> {
    const result: Record<string, number> = {};
    
    // Calculate earnings based on percentages
    for (const [key, percentage] of Object.entries(model)) {
      result[key] = Math.round(totalReactions * (percentage / 100));
    }
    
    // Add total if it's not already present
    if (!result.total) {
      result.total = totalReactions;
    }
    
    return result;
  }

  getDistributionModel(): DistributionModel {
    return this.distributionModel;
  }

  // Method to set a custom distribution for a specific content
  setContentDistribution(contentId: string, contentType: string, distribution: Record<string, number>): void {
    const key = `${contentType}-${contentId}`;
    this.contentDistributions[key] = distribution;
  }
}

// Create and export a singleton instance
export const revenueDistributionService = new MockRevenueDistributionService();