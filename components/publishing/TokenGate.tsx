// components/publishing/TokenGate.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useProfile } from '@/lib/profile/hooks/useProfile';

const MEMBERSHIP_TOKEN_ADDRESS = '0xC90bE82B23Dca9453445b69fB22D5A90402654b2';
const PUBLISHER_TOKEN_ADDRESS = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21';

const MEMBERSHIP_TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)"
];

const PUBLISHER_TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)" // FIXED: Use balanceOf instead of hasValidCredential
];

type PublishingType = 'community' | 'native' | 'portfolio' | 'manage';

interface TokenGateProps {
  profileId: string;
  publishingType: PublishingType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TokenGate: React.FC<TokenGateProps> = ({ 
  profileId, 
  publishingType,
  children, 
  fallback 
}) => {
  const { address, isConnected } = useWallet();
  const { profile, isOwner, isLoading: profileLoading } = useProfile(profileId);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function checkAccess() {
      console.log('🔍 TokenGate Debug Started');
      console.log('- Address:', address);
      console.log('- IsConnected:', isConnected);
      console.log('- Profile:', profile);
      console.log('- IsOwner:', isOwner);
      console.log('- Publishing Type:', publishingType);

      if (!isConnected || !address || !profile) {
        console.log('❌ Missing requirements: wallet/address/profile');
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      // Must be the profile owner
      if (!isOwner) {
        console.log('❌ Not profile owner');
        setHasAccess(false);
        setIsChecking(false);
        setError('You can only publish from your own profile');
        return;
      }

      try {
        console.log('🔍 Starting blockchain checks...');
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        
        // Check for publisher token first (gives access to everything)
        console.log('🔍 Checking publisher credentials...');
        const publisherContract = new ethers.Contract(
          PUBLISHER_TOKEN_ADDRESS,
          PUBLISHER_TOKEN_ABI,
          provider
        );
        
        const publisherBalance = await publisherContract.balanceOf(address); // FIXED: Use balanceOf
        const hasPublisherToken = publisherBalance > BigInt(0); // FIXED: Check balance > 0
        
        console.log('- Publisher Balance:', publisherBalance.toString());
        console.log('- Has Publisher Token:', hasPublisherToken);
        
        if (hasPublisherToken) {
          console.log('✅ Publisher access granted!');
          setHasAccess(true);
          setIsChecking(false);
          return;
        }

        // For community publishing, membership token is sufficient
        if (publishingType === 'community') {
          console.log('🔍 Checking membership token for community publishing...');
          const membershipContract = new ethers.Contract(
            MEMBERSHIP_TOKEN_ADDRESS,
            MEMBERSHIP_TOKEN_ABI,
            provider
          );
          
          const balance = await membershipContract.balanceOf(address);
          const hasMembershipToken = balance > BigInt(0);
          
          console.log('- Membership Balance:', balance.toString());
          console.log('- Has Membership Token:', hasMembershipToken);
          
          if (hasMembershipToken) {
            console.log('✅ Membership access granted for community publishing!');
            setHasAccess(true);
          } else {
            console.log('❌ No membership token for community publishing');
            setError('Community publishing requires a membership token (IT00-IT99)');
            setHasAccess(false);
          }
        } else {
          // Native, portfolio, and manage require publisher token
          console.log('❌ Publisher token required for', publishingType);
          setError(`${publishingType.charAt(0).toUpperCase() + publishingType.slice(1)} publishing requires a publisher credential`);
          setHasAccess(false);
        }
        
      } catch (err) {
        console.error('💥 Error checking token access:', err);
        setError('Failed to verify token access');
        setHasAccess(false);
      } finally {
        console.log('🔍 TokenGate check completed');
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [address, isConnected, profile, isOwner, publishingType]);
  
  if (profileLoading || isChecking) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Verifying access...
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-parchment)',
        borderRadius: '4px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headlines)',
          fontSize: '1.5rem',
          marginTop: 0,
          marginBottom: '1rem',
        }}>
          Wallet Not Connected
        </h3>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.5',
          margin: 0,
        }}>
          Please connect your wallet to access publishing features.
        </p>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-parchment)',
            borderRadius: '4px',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.5rem',
              marginTop: 0,
              marginBottom: '1rem',
            }}>
              Access Restricted
            </h3>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.5',
              margin: '0 0 1rem 0',
            }}>
              {error || 'You do not have permission to access this feature.'}
            </p>
            {publishingType === 'community' ? (
              <p style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                margin: 0,
              }}>
                Community publishing requires a membership token (IT00-IT99) or publisher credential.
              </p>
            ) : (
              <p style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                margin: 0,
              }}>
                This publishing type requires a publisher credential.
              </p>
            )}
          </div>
        )}
      </>
    );
  }
  
  return <>{children}</>;
};

export default TokenGate;