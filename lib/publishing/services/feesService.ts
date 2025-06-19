// lib/publishing/services/feesService.ts
import { PublishingFee, FeePaymentResponse } from '../types/fee';
import feesData from '../mockData/fees.json';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockFeesService = {
  // Process a publishing fee payment
  processPayment: async (authorId: string, amount: number): Promise<FeePaymentResponse> => {
    await delay(1000); // Simulate network delay
    
    // In a real implementation, this would process a blockchain transaction
    
    // Create a new fee record
    const newFee: PublishingFee = {
      id: `fee-${Date.now().toString(36)}`,
      articleId: '', // Will be set after article creation
      authorId,
      feeAmount: amount,
      status: 'confirmed', // Assume success for mock implementation
      transactionHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      fee: newFee
    };
  },
  
  // Get fee history for a user
  getUserFeeHistory: async (authorId: string): Promise<PublishingFee[]> => {
    await delay(500); // Simulate network delay
    
    const { fees } = feesData;
    return fees.filter(fee => fee.authorId === authorId) as PublishingFee[];
  },
  
  // Get fee for an article
  getArticleFee: async (articleId: string): Promise<PublishingFee | null> => {
    await delay(500); // Simulate network delay
    
    const { fees } = feesData;
    const fee = fees.find(fee => fee.articleId === articleId);
    
    if (!fee) {
      return null;
    }
    
    return fee as PublishingFee;
  }
};