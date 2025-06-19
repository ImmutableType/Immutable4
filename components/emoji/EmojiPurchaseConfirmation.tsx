// components/emoji/EmojiPurchaseConfirmation.tsx
'use client';

import React from 'react';

interface PurchaseDetails {
  emojiAmount: number;
  flowCost: string;
  transactionHash?: string;
}

interface EmojiPurchaseConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseDetails: PurchaseDetails;
  isSuccess: boolean;
  error?: string;
}

export const EmojiPurchaseConfirmation: React.FC<EmojiPurchaseConfirmationProps> = ({
  isOpen,
  onClose,
  purchaseDetails,
  isSuccess,
  error
}) => {
  if (!isOpen) return null;

  const explorerUrl = purchaseDetails.transactionHash 
    ? `https://evm-testnet.flowscan.org/tx/${purchaseDetails.transactionHash}`
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="text-center p-6 border-b">
          {isSuccess ? (
            <div className="text-6xl mb-4">🎉</div>
          ) : (
            <div className="text-6xl mb-4">❌</div>
          )}
          <h2 className="text-xl font-bold text-gray-800">
            {isSuccess ? 'Purchase Successful!' : 'Purchase Failed'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{purchaseDetails.emojiAmount.toLocaleString()} EMOJI
                </div>
                <div className="text-green-700">
                  for {purchaseDetails.flowCost} FLOW
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>✅ Tokens added to your wallet</p>
                <p>✅ FLOW sent to treasury</p>
                <p>✅ Transaction confirmed on blockchain</p>
              </div>

              {explorerUrl && (
                <div className="text-center">
                  
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  <a>
                    View on Block Explorer
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 font-medium mb-2">
                  Transaction Failed
                </div>
                <div className="text-red-600 text-sm">
                  {error || 'An unknown error occurred during the purchase.'}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Your wallet balance has not been affected.</p>
                <p>You can try the purchase again.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
          >
            {isSuccess ? 'Great!' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};