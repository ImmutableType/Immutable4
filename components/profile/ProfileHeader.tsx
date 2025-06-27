// components/profile/ProfileHeader.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import confetti from 'canvas-confetti';
import { Profile } from '../../lib/profile/types/profile';
import { useWallet } from '../../lib/hooks/useWallet';

// Publisher token contract details
const PUBLISHER_TOKEN_ADDRESS = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21';
const PUBLISHER_TOKEN_ABI = [
  "function hasValidCredential(address journalist) external view returns (bool)"
];

// TippingContract details
const TIPPING_CONTRACT_ADDRESS = '0xbA1bba49FD1A6B949844CEFddc94d182272A19b8';
const TIPPING_CONTRACT_ABI = [
  "function tipProfile(uint256 profileId, uint256 tipAmount, string memory currency) external payable",
  "function tipAddress(address recipient, uint256 tipAmount, string memory currency) external payable",
  "function getMinimumTipAmount() external view returns (uint256)",
  "function getPlatformFeePercentage() external view returns (uint256)"
];

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
  membershipTokenId?: string;
  tokenImageUrl?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwner, membershipTokenId, tokenImageUrl }) => {
  const { provider, address: currentUserAddress, isConnected } = useWallet();
  const [hasPublisherToken, setHasPublisherToken] = useState(false);
  const [tipAmount, setTipAmount] = useState('10.0');
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // FIXED: Check if profile owner has publisher token with proper dependency array
  useEffect(() => {
    async function checkPublisherToken() {
      if (!profile?.walletAddress) return;
      
      try {
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        const contract = new ethers.Contract(
          PUBLISHER_TOKEN_ADDRESS,
          PUBLISHER_TOKEN_ABI,
          provider
        );
        
        const hasCredential = await contract.hasValidCredential(profile.walletAddress);
        setHasPublisherToken(hasCredential);
      } catch (error) {
        console.error('Error checking publisher token:', error);
      }
    }
    
    checkPublisherToken();
  }, [profile?.walletAddress]); // FIXED: Added proper dependency array

  // Format wallet address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate member since date
  const getMemberSince = () => {
    if (!profile.createdAt) return null;
    const date = new Date(profile.createdAt);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Determine verification text based on tokens
  const getVerificationText = () => {
    if (hasPublisherToken) {
      return 'Verified Local Journalist';
    } else if (membershipTokenId) {
      return 'Verified Local';
    }
    return null;
  };

  // Confetti celebration
  const triggerConfetti = () => {
    // Multiple confetti bursts for extra celebration
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // First burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FF6B9D', '#C44569', '#F8B500', '#00CDAC', '#4ECDC4']
    });

    // Second burst
    fire(0.2, {
      spread: 60,
      colors: ['#B3211E', '#1D7F6E', '#E8A317']
    });

    // Third burst
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FF6B9D', '#C44569', '#F8B500', '#00CDAC', '#4ECDC4']
    });

    // Final burst
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#B3211E', '#1D7F6E']
    });
  };

  // Direct contract integration for tipping
  const handleTip = async (amount: number) => {
    if (!provider || !isConnected || !currentUserAddress) {
      alert('Please connect your wallet to send tips');
      return;
    }

    try {
      setIsProcessing(true);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const tippingContract = new ethers.Contract(
        TIPPING_CONTRACT_ADDRESS,
        TIPPING_CONTRACT_ABI,
        signer
      );

      // Get minimum tip amount and platform fee for validation
      const minTipAmount = await tippingContract.getMinimumTipAmount();
      const tipAmountWei = ethers.parseEther(amount.toString());

      if (tipAmountWei < minTipAmount) {
        alert(`Minimum tip amount is ${ethers.formatEther(minTipAmount)} FLOW`);
        return;
      }

      // Calculate platform fee (1.9%)
      const platformFeePercentage = await tippingContract.getPlatformFeePercentage();
      const platformFee = (tipAmountWei * platformFeePercentage) / BigInt(10000);
      const totalAmount = tipAmountWei + platformFee;

      // Send tip via contract - using tipAddress since we want to tip the profile owner's wallet
      const tx = await tippingContract.tipAddress(
        profile.walletAddress, // Tip goes to profile owner's wallet
        tipAmountWei,
        'FLOW',
        { value: totalAmount } // Include platform fee in total
      );
      
      // Wait for confirmation
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      
      // Trigger confetti celebration
      triggerConfetti();
      
      // Show success message with EMOJI rewards info
      const emojiRewards = amount * 10;
      alert(`🎉 Successfully sent ${amount} FLOW tip! You also received ${emojiRewards} EMOJI tokens as a reward!`);
      
      setShowTipDialog(false);
      setTipAmount('10.0'); // Reset to default
    } catch (error: any) {
      console.error('Tipping error:', error);
      let errorMessage = 'Failed to send tip';
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient FLOW balance';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle preset tip amounts
  const handlePresetTip = async (amount: number) => {
    await handleTip(amount);
  };

  // Handle custom tip amount
  const handleCustomTip = async () => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }
    await handleTip(amount);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        marginBottom: '1rem',
      }}>
        {/* Avatar - Fixed z-index and display actual token image */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'var(--color-digital-silver)',
          flexShrink: 0,
          marginTop: '-50px',
          border: '4px solid var(--color-white)',
          position: 'relative',
          zIndex: 10,
        }}>
          {tokenImageUrl ? (
            <img 
              src={tokenImageUrl}
              alt={membershipTokenId || 'Profile'}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            // Fallback pattern if no token image
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`gradient-${profile.walletAddress}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: `#${profile.walletAddress.slice(2, 8)}`, stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: `#${profile.walletAddress.slice(8, 14)}`, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: `#${profile.walletAddress.slice(14, 20)}`, stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <rect width="100" height="100" fill={`url(#gradient-${profile.walletAddress})`} />
              <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.2)" />
              <circle cx="50" cy="50" r="20" fill="rgba(0,0,0,0.1)" />
              {membershipTokenId && (
                <text x="50" y="55" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  {membershipTokenId}
                </text>
              )}
            </svg>
          )}
        </div>

        {/* Profile Info and Action Buttons */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.8rem',
              margin: 0,
            }}>
              {profile.displayName || formatAddress(profile.walletAddress)}
            </h1>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
            }}>
              {isOwner ? (
                <Link href={`/profile/${profile.id}/edit`}>
                  <button style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-black)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--color-digital-silver)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
                    Edit Profile
                  </button>
                </Link>
              ) : (
                // Awesome Tip Button with enhanced styling
                <button style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 25%, #F8B500 50%, #00CDAC 75%, #4ECDC4 100%)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(0)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
                onClick={() => setShowTipDialog(true)}
                >
                  {/* Enhanced tip icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                  Tip this User
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-ui)',
            color: 'var(--color-black)',
            opacity: 0.7,
            flexWrap: 'wrap',
          }}>
            {/* Wallet Address */}
            <span>{formatAddress(profile.walletAddress)}</span>
            
            {/* Separator */}
            <span>•</span>
            
            {/* Profile ID - Updated text */}
            <span>Profile ID #{profile.id}</span>
            
            {/* Membership Token ID - Enhanced display */}
            {membershipTokenId && (
              <>
                <span>•</span>
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.125rem 0.5rem',
                  backgroundColor: 'rgba(179, 33, 30, 0.1)',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: 'var(--color-typewriter-red)',
                  opacity: 1,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Membership ID #{membershipTokenId}
                </span>
              </>
            )}
            
            {/* Member Since */}
            {getMemberSince() && (
              <>
                <span>•</span>
                <span>Member since {getMemberSince()}</span>
              </>
            )}
            
            {/* Verification Badge - Updated text */}
            {getVerificationText() && (
              <>
                <span>•</span>
                <span className="verification-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {getVerificationText()}
                </span>
              </>
            )}
          </div>

          {/* Location */}
          {profile.location && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-black)',
              opacity: 0.7,
              marginTop: '0.25rem',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              fontFamily: 'var(--font-body)',
            }}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>


      {/* Enhanced Tip Dialog */}
      {showTipDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headlines)',
              fontSize: '1.6rem',
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
            }}>
              💰 Tip {profile.displayName || formatAddress(profile.walletAddress)}
            </h3>
            
            <p style={{
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: 'var(--color-black)',
              opacity: 0.8,
            }}>
              Support this creator with FLOW tokens and receive EMOJI rewards!
            </p>
            
            {/* Preset Tip Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <button
                onClick={() => handlePresetTip(5)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-verification-green)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseOver={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 127, 110, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>5 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>+50 EMOJI</span>
              </button>

              <button
                onClick={() => handlePresetTip(20)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-blockchain-blue)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseOver={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(43, 57, 144, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>20 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>+200 EMOJI</span>
              </button>

              <button
                onClick={() => handlePresetTip(100)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-alert-amber)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseOver={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 163, 23, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>100 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>+1000 EMOJI</span>
              </button>
            </div>

            {/* Custom Amount Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                Or Enter Custom Amount (FLOW)
              </label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                min="0.1"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--color-digital-silver)',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-typewriter-red)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-digital-silver)';
                }}
              />
              <p style={{
                fontSize: '0.8rem',
                textAlign: 'center',
                margin: '0.5rem 0 0 0',
                color: 'var(--color-black)',
                opacity: 0.6,
              }}>
                You will receive {(parseFloat(tipAmount) || 0) * 10} EMOJI tokens as a reward!
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => setShowTipDialog(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--color-black)',
                  border: '2px solid var(--color-digital-silver)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomTip}
                disabled={isProcessing || !tipAmount || parseFloat(tipAmount) <= 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--color-typewriter-red)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isProcessing || !tipAmount || parseFloat(tipAmount) <= 0) ? 'default' : 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  opacity: (isProcessing || !tipAmount || parseFloat(tipAmount) <= 0) ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isProcessing && tipAmount && parseFloat(tipAmount) > 0) {
                    e.currentTarget.style.backgroundColor = '#8C1A17';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isProcessing && tipAmount && parseFloat(tipAmount) > 0) {
                    e.currentTarget.style.backgroundColor = 'var(--color-typewriter-red)';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : `Send ${tipAmount} FLOW`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;