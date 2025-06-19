// components/publishing/ArticleTypeSelector.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface ArticleTypeSelectorProps {
  profileId: string;
}

const ArticleTypeSelector: React.FC<ArticleTypeSelectorProps> = ({ profileId }) => {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const [hasMembershipToken, setHasMembershipToken] = useState(false);
  const [hasPublisherToken, setHasPublisherToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkTokens() {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        
        // Check membership token
        const membershipContract = new ethers.Contract(
          MEMBERSHIP_TOKEN_ADDRESS,
          MEMBERSHIP_TOKEN_ABI,
          provider
        );
        const balance = await membershipContract.balanceOf(address);
        setHasMembershipToken(balance > BigInt(0));
        
        // Check publisher token
        const publisherContract = new ethers.Contract(
          PUBLISHER_TOKEN_ADDRESS,
          PUBLISHER_TOKEN_ABI,
          provider
        );
        const hasCredential = await publisherContract.hasValidCredential(address);
        setHasPublisherToken(hasCredential);
        
      } catch (error) {
        console.error('Error checking tokens:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkTokens();
  }, [address, isConnected]);
  
  const publishingOptions = [
    {
      id: 'community',
      title: 'Community Curation',
      description: 'Mint external articles from around the web',
      requiresMembership: true,
      requiresPublisher: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
      url: `/profile/${profileId}/publish/community`
    },
    {
      id: 'portfolio',
      title: 'Portfolio Verification',
      description: 'Mint your published work from other sites',
      requiresMembership: false,
      requiresPublisher: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      url: `/profile/${profileId}/publish/portfolio`
    },
    {
      id: 'native',
      title: 'Native Publication',
      description: 'Create and publish original articles',
      requiresMembership: false,
      requiresPublisher: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      ),
      url: `/profile/${profileId}/publish/native`
    }
  ];
  
  const canAccessOption = (option: typeof publishingOptions[0]): boolean => {
    if (option.requiresPublisher && !hasPublisherToken) return false;
    if (option.requiresMembership && !hasMembershipToken && !hasPublisherToken) return false;
    return true;
  };
  
  const handleOptionClick = (url: string) => {
    router.push(url);
  };
  
  if (isLoading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-black)',
        opacity: 0.7,
      }}>
        Loading publishing options...
      </div>
    );
  }
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-headlines)',
        fontSize: '1.5rem',
        margin: 0,
      }}>
        What would you like to publish?
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {publishingOptions.map(option => {
          const isAccessible = canAccessOption(option);
          
          return (
            <div 
              key={option.id}
              style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-digital-silver)',
                borderRadius: '4px',
                padding: '1.5rem',
                opacity: isAccessible ? 1 : 0.6,
                cursor: isAccessible ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
              onClick={() => isAccessible && handleOptionClick(option.url)}
              onMouseOver={(e) => {
                if (isAccessible) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (isAccessible) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                color: isAccessible ? 'var(--color-typewriter-red)' : 'var(--color-digital-silver)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: isAccessible ? 'rgba(179, 33, 30, 0.1)' : 'var(--color-parchment)',
              }}>
                {option.icon}
              </div>
              
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-headlines)',
                  fontSize: '1.2rem',
                  margin: '0 0 0.5rem 0',
                }}>
                  {option.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  {option.description}
                </p>
              </div>
              
              {!isAccessible && (
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-typewriter-red)',
                  marginTop: 'auto',
                }}>
                  {option.requiresPublisher 
                    ? 'Requires publisher credential' 
                    : 'Requires membership token (IT00-IT99)'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleTypeSelector;