// lib/publishing/types/transaction.ts
export interface TransactionState {
    status: 'idle' | 'preparing' | 'signing' | 'pending' | 'confirmed' | 'failed';
    txHash?: string;
    error?: string;
    articleId?: string;
    confirmations?: number;
    estimatedGas?: bigint;
    gasPrice?: bigint;
  }
  
  export interface TransactionProgress {
    step: number;
    totalSteps: number;
    message: string;
    isComplete: boolean;
  }
  
  export interface PortfolioMintingResult {
    success: boolean;
    articleId?: string;
    txHash?: string;
    error?: string;
    article?: {
      id: string;
      title: string;
      transactionHash: string;
      createdAt: string;
    };
  }
  
  export interface GasEstimation {
    gasLimit: bigint;
    gasPrice: bigint;
    totalCost: bigint;
    feeInFlow: string;
  }