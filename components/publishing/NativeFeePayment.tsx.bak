// components/publishing/NativeFeePayment.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../lib/hooks/useWallet';
import EncryptedArticleService from '../../lib/blockchain/contracts/EncryptedArticleService';
import TransactionStatus from './TransactionStatus';
import { TransactionState, TransactionProgress, GasEstimation } from '../../lib/publishing/types/transaction';


interface NativeFeePaymentProps {
  authorId: string;
  articleData: {
    title: string;
    encryptedContent: string;
    summary: string;
    location: string;
    category: string;
    tags: string[];
    nftCount: number;
    nftPrice: number; // in FLOW
    journalistRetained: number;
    readerLicenseRatio: number;
  };
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

const NativeFeePayment: React.FC<NativeFeePaymentProps> = ({
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
    message: 'Ready to publish your encrypted article',
    isComplete: false
  });
  const [gasEstimation, setGasEstimation] = useState<GasEstimation | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

  // Contract configuration
  const ENCRYPTED_ARTICLES_CONTRACT_ADDRESS = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';

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
      const service = new EncryptedArticleService(ENCRYPTED_ARTICLES_CONTRACT_ADDRESS, provider);
      
      // FIX: Prepare article input with correct types (nftPrice as number)
      const articleInput = {
        title: articleData.title,
        encryptedContent: articleData.encryptedContent,
        summary: articleData.summary,
        location: articleData.location,
        category: articleData.category,
        tags: articleData.tags,
        nftCount: articleData.nftCount,
        nftPrice: articleData.nftPrice, // Keep as number - service will convert
        journalistRetained: articleData.journalistRetained,
        readerLicenseRatio: articleData.readerLicenseRatio
      };

      // Get gas estimation
      const gasLimit = await service.estimatePublishArticleGas(articleInput, signer);
      const feePerGas = await provider.getFeeData();
      const gasPrice = feePerGas.gasPrice || ethers.parseUnits('2', 'gwei');
      
      // Get publishing fee (1 FLOW)
      const publishingFee = await service.getPublishingFee();
      
      // Calculate total costs
      const gasCost = gasLimit * gasPrice;
      const totalCost = gasCost + publishingFee;
      
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
        gasLimit: BigInt(500000),
        gasPrice: ethers.parseUnits('2', 'gwei'),
        totalCost: ethers.parseEther('1.002'), // 1 FLOW + small gas
        feeInFlow: '1.002'
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handlePublishArticle = async () => {
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
        message: 'Preparing encrypted article transaction...',
        isComplete: false
      });

      const signer = await provider.getSigner();
      const service = new EncryptedArticleService(ENCRYPTED_ARTICLES_CONTRACT_ADDRESS, provider);
      
      // FIX: Prepare article input with correct types
      const articleInput = {
        title: articleData.title,
        encryptedContent: articleData.encryptedContent,
        summary: articleData.summary,
        location: articleData.location,
        category: articleData.category,
        tags: articleData.tags,
        nftCount: articleData.nftCount,
        nftPrice: articleData.nftPrice, // Keep as number
        journalistRetained: articleData.journalistRetained,
        readerLicenseRatio: articleData.readerLicenseRatio
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
      const txResponse = await service.publishArticle(articleInput, signer);
      
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
        // FIX: Get proper result from service
        const articleResult = await service.waitForArticleCreation(txResponse.hash);
        
        setTransaction({ 
          status: 'confirmed',
          txHash: txResponse.hash,
          articleId: articleResult.articleId
        });
        setProgress({
          step: 3,
          totalSteps: 3,
          message: 'Encrypted article successfully published!',
          isComplete: true
        });

        // FIX: Use the result from service directly
        const result: any = {
          success: true,
          articleId: articleResult.articleId,
          txHash: articleResult.txHash,
          article: {
            id: articleResult.article.id,
            title: articleResult.article.title,
            transactionHash: articleResult.article.transactionHash,
            createdAt: articleResult.article.createdAt
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
      console.error('Encrypted article publishing failed:', error);
      
      let errorMessage = 'Transaction failed';
      if (error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient FLOW balance';
      } else if (error.message?.includes('Daily native article limit')) {
        errorMessage = 'Daily publishing limit reached (3 articles per day)';
      } else if (error.message?.includes('Publisher credentials required')) {
        errorMessage = 'Publisher credential required';
      } else if (error.message?.includes('Must have local token')) {
        errorMessage = 'Local geography token required';
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
      message: 'Ready to publish your encrypted article',
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
        <p>Please connect your wallet to publish encrypted articles.</p>
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
            Native Publishing Fee
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
                Publishing Fee:
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

          {/* NFT Economics Display */}
          <div style={{
            borderTop: '1px solid var(--color-digital-silver)',
            paddingTop: '1rem',
            marginTop: '1rem',
          }}>
            <h4 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1rem',
              margin: '0 0 0.5rem 0',
            }}>
              NFT Economics
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}>
              <div>
                <strong>Total NFTs:</strong> {articleData.nftCount}
              </div>
              <div>
                <strong>NFT Price:</strong> {articleData.nftPrice} FLOW
              </div>
              <div>
                <strong>Journalist Retained:</strong> {articleData.journalistRetained}
              </div>
              <div>
                <strong>Public Sale:</strong> {articleData.nftCount - articleData.journalistRetained}
              </div>
              <div>
                <strong>Licenses per NFT:</strong> {articleData.readerLicenseRatio}
              </div>
              <div>
                <strong>Total Licenses:</strong> {articleData.nftCount * articleData.readerLicenseRatio}
              </div>
            </div>
          </div>
          
          <p style={{
            fontSize: '0.9rem',
            margin: '1rem 0 0 0',
            lineHeight: '1.5',
            opacity: 0.8,
          }}>
            This fee covers article publishing and NFT minting. Your encrypted article will be permanently stored on the blockchain with reader license economics.
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

      {/* Publish Button */}
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
            onClick={handlePublishArticle}
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
            {isEstimatingGas ? 'Preparing...' : 'Publish Encrypted Article'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NativeFeePayment;