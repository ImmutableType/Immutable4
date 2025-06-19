// components/proposals/ProposalTokenGate.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';

const MEMBERSHIP_TOKEN_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';
const PUBLISHER_TOKEN_ADDRESS = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21';

const MEMBERSHIP_TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)"
];

const PUBLISHER_TOKEN_ABI = [
  "function hasValidCredential(address journalist) external view returns (bool)"
];

interface ProposalTokenGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProposalTokenGate: React.FC<ProposalTokenGateProps> = ({ 
  children, 
  fallback 
}) => {
  const { address, isConnected } = useWallet();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [tokenType, setTokenType] = useState<'membership' | 'publisher' | null>(null);
  
  useEffect(() => {
    async function checkAccess() {
      if (!isConnected || !address) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        
        // Check for publisher token first
        const publisherContract = new ethers.Contract(
          PUBLISHER_TOKEN_ADDRESS,
          PUBLISHER_TOKEN_ABI,
          provider
        );
        
        const hasPublisherToken = await publisherContract.hasValidCredential(address);
        
        if (hasPublisherToken) {
          setHasAccess(true);
          setTokenType('publisher');
          setIsChecking(false);
          return;
        }

        // Check for membership token
        const membershipContract = new ethers.Contract(
          MEMBERSHIP_TOKEN_ADDRESS,
          MEMBERSHIP_TOKEN_ABI,
          provider
        );
        
        const balance = await membershipContract.balanceOf(address);
        const hasMembershipToken = balance > BigInt(0);
        
        if (hasMembershipToken) {
          setHasAccess(true);
          setTokenType('membership');
        } else {
          setHasAccess(false);
        }
        
      } catch (err) {
        console.error('Error checking token access:', err);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [address, isConnected]);
  
  if (isChecking) {
    return (
      <div style={{ 
        padding: '3rem',
        textAlign: 'center',
        color: '#6c757d',
      }}>
        Verifying access...
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div style={{ 
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '8px',
        border: '1px solid #D9D9D9',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          fontFamily: "'Special Elite', monospace"
        }}>
          Wallet Connection Required
        </h2>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '24px',
          color: '#6c757d',
        }}>
          You need to connect your wallet to create proposals. Proposal creation requires either a membership token (IT00-IT99) or publisher credentials.
        </p>
        <p style={{
          fontSize: '14px',
          color: '#6c757d',
        }}>
          Use the "Connect Wallet" button in the sidebar to continue.
        </p>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '8px',
            border: '1px solid #D9D9D9',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              fontFamily: "'Special Elite', monospace",
              color: '#B3211E',
            }}>
              Access Restricted
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              Creating proposals requires either a membership token (IT00-IT99) or publisher credentials.
            </p>
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.05)',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '14px',
                margin: '0 0 8px 0',
                fontWeight: 'bold',
              }}>
                To gain access:
              </p>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '14px',
                textAlign: 'left',
              }}>
                <li>Obtain a membership token (IT00-IT99) from the admin</li>
                <li>Or receive publisher credentials for verified journalists</li>
              </ul>
            </div>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Go Back
            </button>
          </div>
        )}
      </>
    );
  }
  
  return <>{children}</>;
};

export default ProposalTokenGate;