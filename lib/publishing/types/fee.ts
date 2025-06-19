// lib/publishing/types/fee.ts
export interface PublishingFee {
    id: string;
    articleId: string;
    authorId: string;
    feeAmount: number;
    status: 'pending' | 'confirmed' | 'failed';
    transactionHash?: string;
    timestamp: string;
  }
  
  export interface FeePaymentResponse {
    success: boolean;
    fee: PublishingFee;
    error?: string;
  }