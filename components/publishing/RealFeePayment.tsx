// components/publishing/RealFeePayment.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../lib/hooks/useWallet';
import { PortfolioArticleService } from '../../lib/blockchain/contracts/PortfolioArticleService';
import TransactionStatus from './TransactionStatus';
import { TransactionState, TransactionProgress, PortfolioMintingResult, GasEstimation } from '../../lib/publishing/types/transaction';

interface RealFeePaymentProps {
  authorId: string;
  articleData: {
    title: string;
    shortDescription: string;
    originalUrl: string;
    category: string;
    location: string;
    tags: string[];
    publicationName: string;
    originalPublishDate: string;
  };
  onSuccess: (result: PortfolioMintingResult) => void;
  onCancel: () => void;
}

const RealFeePayment: React.FC<RealFeePaymentProps> = ({
  authorId,
  articleData,
  onSuccess,
  onCancel
}) => {
  const { provider, address, isConnected } = useWallet();
  const [transaction, setTransaction] = useState<TransactionState>({ status: 'idle' });
  const [progress, setProgress] = useState<TransactionProgress>({
    step: 0,
    totalSteps: 3,
    message: 'Ready to publish your portfolio article',
    isComplete: false
  });
  const [gasEstimation, setGasEstimation] = useState<GasEstimation | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

  // Contract configuration
  const PORTFOLIO_CONTRACT_ADDRESS = '0xF2Da11169CE742Ea0B75B7207E774449e26f8ee1';

  // Helper function to extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return '';
    }
  };

  // Estimate gas costs on component mount
  useEffect(() => {
    if (provider && address && isConnected) {
      estimateGasCosts();
    }
  }, [provider, address, isConnected]);

  const estimateGasCosts = async () => {
    if (!provider || !address) return;

    try {
      setIsEstimatingGas(true);
      
      const signer = await provider.getSigner();
      const service = new PortfolioArticleService(PORTFOLIO_CONTRACT_ADDRESS, provider);
      
      // Prepare article input for gas estimation
      const articleInput = {
        title: articleData.title,
        description: articleData.shortDescription,
        contentUrl: articleData.originalUrl,
        category: articleData.category,
        location: articleData.location,
        tags: articleData.tags,
        originalAuthor: '',
        sourceDomain: extractDomain(articleData.originalUrl),
        publicationName: articleData.publicationName,
        originalPublishDate: articleData.originalPublishDate,
        portfolioType: 'verification'
      };

      // Get gas estimation
      const gasLimit = await service.estimateCreateArticleGas(articleInput, signer);
      const feePerGas = await provider.getFeeData();
      const gasPrice = feePerGas.gasPrice || ethers.parseUnits('2', 'gwei');
      
      // Get article fee (1 FLOW)
      const articleFee = await service.getArticleFee();
      
      // Calculate total costs
      const gasCost = gasLimit * gasPrice;
      const totalCost = gasCost + articleFee;
      
      setGasEstimation({
        gasLimit,
        gasPrice,
        totalCost,
        feeInFlow: ethers.formatEther(totalCost)
      });

    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Set fallback estimation
      setGasEstimation({
        gasLimit: BigInt(400000),
        gasPrice: ethers.parseUnits('2', 'gwei'),
        totalCost: ethers.parseEther('1.002'), // 1 FLOW + small gas
        feeInFlow: '1.002'
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleMintArticle = async () => {
    if (!provider || !address) {
      setTransaction({
        status: 'failed',
        error: 'Wallet not connected'
      });
      return;
    }

    try {
      // Step 1: Preparing transaction
      setTransaction({ status: 'preparing' });
      setProgress({
        step: 1,
        totalSteps: 3,
        message: 'Preparing portfolio article transaction...',
        isComplete: false
      });

      const signer = await provider.getSigner();
      const service = new PortfolioArticleService(PORTFOLIO_CONTRACT_ADDRESS, provider);
      
      // Prepare article input
      const articleInput = {
        title: articleData.title,
        description: articleData.shortDescription,
        contentUrl: articleData.originalUrl,
        category: articleData.category,
        location: articleData.location,
        tags: articleData.tags,
        originalAuthor: '',
        sourceDomain: extractDomain(articleData.originalUrl),
        publicationName: articleData.publicationName,
        originalPublishDate: articleData.originalPublishDate,
        portfolioType: 'verification'
      };

      // Step 2: Waiting for signature
      setTransaction({ status: 'signing' });
      setProgress({
        step: 2,
        totalSteps: 3,
        message: 'Please sign the transaction in your wallet...',
        isComplete: false
      });

      // Create the transaction
      const txResponse = await service.createPortfolioArticle(articleInput, signer);
      
      // Step 3: Transaction pending
      setTransaction({ 
        status: 'pending',
        txHash: txResponse.hash
      });
      setProgress({
        step: 3,
        totalSteps: 3,
        message: 'Transaction submitted, waiting for confirmation...',
        isComplete: false
      });

      // Wait for confirmation
      const receipt = await txResponse.wait();
      
      if (receipt?.status === 1) {
        // Extract article ID from transaction events
        const articleId = await service.waitForArticleCreation(txResponse.hash);
        
        setTransaction({ 
          status: 'confirmed',
          txHash: txResponse.hash,
          articleId: articleId || undefined
        });
        setProgress({
          step: 3,
          totalSteps: 3,
          message: 'Portfolio article successfully published!',
          isComplete: true
        });

        // Call success callback
        const result: PortfolioMintingResult = {
          success: true,
          articleId: articleId || 'unknown',
          txHash: txResponse.hash,
          article: {
            id: articleId || 'unknown',
            title: articleData.title,
            transactionHash: txResponse.hash,
            createdAt: new Date().toISOString()
          }
        };

        // Wait a moment before calling success to let user see confirmation
        setTimeout(() => {
          onSuccess(result);
        }, 2000);

      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Portfolio minting failed:', error);
      
      let errorMessage = 'Transaction failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient FLOW balance';
      } else if (error.message?.includes('Daily post limit')) {
        errorMessage = 'Daily posting limit reached';
      } else if (error.message?.includes('Valid publisher credential required')) {
        errorMessage = 'Publisher credential required';
      }
      
      setTransaction({ 
        status: 'failed',
        error: errorMessage
      });
      setProgress({
        step: 0,
        totalSteps: 3,
        message: errorMessage,
        isComplete: false
      });
    }
  };

  const handleRetry = () => {
    setTransaction({ status: 'idle' });
    setProgress({
      step: 0,
      totalSteps: 3,
      message: 'Ready to publish your portfolio article',
      isComplete: false
    });
  };

  if (!isConnected) {
    return (
      <div style={{
        backgroundColor: 'var(--color-parchment)',
        borderRadius: '4px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.3rem',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Wallet Not Connected
        </h3>
        <p>Please connect your wallet to publish portfolio articles.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Fee Information */}
      {transaction.status === 'idle' && (
        <div style={{
          backgroundColor: 'var(--color-parchment)',
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '1.2rem',
            margin: '0 0 1rem 0',
          }}>
            Portfolio Publishing Fee
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div>
              <p style={{
                fontSize: '0.85rem',
                margin: '0 0 0.25rem 0',
                fontWeight: 'bold',
                fontFamily: 'var(--font-ui)',
              }}>
                Article Fee:
              </p>
              <p style={{
                fontSize: '1.1rem',
                margin: 0,
                color: 'var(--color-typewriter-red)',
                fontWeight: 'bold',
              }}>
                1.0 FLOW
              </p>
            </div>
            
            <div>
              <p style={{
                fontSize: '0.85rem',
                margin: '0 0 0.25rem 0',
                fontWeight: 'bold',
                fontFamily: 'var(--font-ui)',
              }}>
                Estimated Total:
              </p>
              <p style={{
                fontSize: '1.1rem',
                margin: 0,
                color: 'var(--color-blockchain-blue)',
                fontWeight: 'bold',
              }}>
                {isEstimatingGas ? 'Calculating...' : 
                  gasEstimation ? `${gasEstimation.feeInFlow} FLOW` : '~1.002 FLOW'
                }
              </p>
            </div>
          </div>
          
          <p style={{
            fontSize: '0.9rem',
            margin: 0,
            lineHeight: '1.5',
            opacity: 0.8,
          }}>
            This fee covers article minting and network costs. Your portfolio article will be permanently stored on the blockchain.
          </p>
        </div>
      )}

      {/* Transaction Status */}
      <TransactionStatus
        transaction={transaction}
        progress={progress}
        onRetry={transaction.status === 'failed' ? handleRetry : undefined}
        onCancel={transaction.status === 'idle' || transaction.status === 'failed' ? onCancel : undefined}
      />

      {/* Mint Button */}
      {transaction.status === 'idle' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-ui)',
              padding: '0.75rem 1rem',
              border: '1px solid var(--color-digital-silver)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleMintArticle}
            disabled={isEstimatingGas}
            style={{
              backgroundColor: 'var(--color-typewriter-red)',
              color: 'var(--color-white)',
              fontFamily: 'var(--font-ui)',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: isEstimatingGas ? 'default' : 'pointer',
              opacity: isEstimatingGas ? 0.7 : 1,
              fontWeight: 'bold',
            }}
          >
            {isEstimatingGas ? 'Preparing...' : 'Publish Portfolio Article'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RealFeePayment;