// app/(client)/about/donate/page.tsx
'use client'

import React, { useState } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import confetti from 'canvas-confetti';
import PlatformProgressChart from '../../../../components/charts/PlatformProgressChart';
import SupporterHeatMap from '@/components/charts/SupporterHeatMap';
import { useWallet } from '../../../../lib/hooks/useWallet';
import { ethers } from 'ethers';

// TippingContract details  
const TIPPING_CONTRACT_ADDRESS = '0xbA1bba49FD1A6B949844CEFddc94d182272A19b8';
const TIPPING_CONTRACT_ABI = [
  "function tipPlatform(uint256 tipAmount, string memory currency) external payable",
  "function getMinimumTipAmount() external view returns (uint256)",
  "function getTreasuryAddress() external view returns (address)"
];

// Treasury/Founder wallet address
const FOUNDER_WALLET = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';

export default function DonatePage() {
  const { provider, address: currentUserAddress, isConnected } = useWallet();
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [tipAmount, setTipAmount] = useState('25.0');
  const [isProcessing, setIsProcessing] = useState(false);

  // Confetti celebration
  const triggerConfetti = () => {
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

    // Epic celebration for platform supporters
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FF6B9D', '#C44569', '#F8B500', '#00CDAC', '#4ECDC4']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#B3211E', '#1D7F6E', '#E8A317']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FF6B9D', '#C44569', '#F8B500', '#00CDAC', '#4ECDC4']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#B3211E', '#1D7F6E']
    });
  };

  // Platform tipping function
  const handlePlatformTip = async (amount: number) => {
    if (!provider || !isConnected || !currentUserAddress) {
      alert('Please connect your wallet to support the platform');
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

      const tipAmountWei = ethers.parseEther(amount.toString());

      // Platform tips have no fees - 100% goes to treasury
      const tx = await tippingContract.tipPlatform(
        tipAmountWei,
        'FLOW',
        { value: tipAmountWei } // No additional fees for platform tips
      );
      
      console.log('Platform tip transaction sent:', tx.hash);
      await tx.wait();
      
      // Epic confetti celebration
      triggerConfetti();
      
      // Show success message with EMOJI rewards info
      const emojiRewards = amount * 10;
      alert(`🎉 Thank you for supporting ImmutableType! Your ${amount} FLOW contribution helps build the future of journalism. You also received ${emojiRewards} EMOJI tokens as a reward!`);
      
      setShowTipDialog(false);
      setTipAmount('25.0'); // Reset to default
    } catch (error: any) {
      console.error('Platform tipping error:', error);
      let errorMessage = 'Failed to send support';
      
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
    await handlePlatformTip(amount);
  };

  // Handle custom tip amount
  const handleCustomTip = async () => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid support amount');
      return;
    }
    await handlePlatformTip(amount);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Hero Section with Miami Gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 25%, #F8B500 50%, #00CDAC 75%, #4ECDC4 100%)',
        borderRadius: '12px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'white',
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          fontFamily: "'Special Elite', monospace",
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Support ImmutableType's Mission
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          Help build the future of decentralized journalism
        </p>

        <PlatformProgressChart />
        <SupporterHeatMap />

        
        {/* Support Button */}
        <button
          onClick={() => setShowTipDialog(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#B3211E',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
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
        >
          💰 Support Our Mission
        </button>
      </div>

      {/* Mission Content */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Vision */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: "'Special Elite', monospace",
            color: '#B3211E'
          }}>
            🌟 Our Vision
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            ImmutableType is pioneering a new era of journalism where communities directly fund the stories that matter to them. Built on blockchain technology, we're creating transparent, uncensorable, and community-driven news platforms that put power back in the hands of readers and local journalists.
          </p>
        </div>

        {/* Miami Success */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: "'Special Elite', monospace",
            color: '#B3211E'
          }}>
            🏙️ Miami: Our Pilot Success
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            We launched in Miami as our pilot city, creating a vibrant ecosystem where residents can propose stories, fund local journalism, and support their favorite reporters. Our token-gated system ensures quality while maintaining democratic access to information. The Miami community has already funded dozens of important local stories.
          </p>
        </div>

        {/* Expanding */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: "'Special Elite', monospace",
            color: '#B3211E'
          }}>
            🚀 Expanding Nationwide
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            Your support helps us expand to new cities across America. Each city needs its own local token economy, verified journalists, and community infrastructure. We're building the template that will scale to thousands of communities, ensuring every locality has access to quality, community-funded journalism.
          </p>
        </div>

        {/* Why Support */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: "'Special Elite', monospace",
            color: '#B3211E'
          }}>
            💰 Why Support Us
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            When you tip ImmutableType, you're not just donating—you're investing in press freedom, community empowerment, and the future of independent journalism. Your contribution helps us develop technology, onboard new cities, verify journalists, and maintain the platform that keeps local news alive.
          </p>
        </div>

        {/* Waiting List */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: "'Special Elite', monospace",
            color: '#B3211E'
          }}>
            🎯 Join the Waiting List
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>
            Not in Miami yet? Your support puts you on our priority list for when we launch in your city. Early supporters get special recognition, priority access to local tokens, and the satisfaction of knowing they helped build something revolutionary for their community.
          </p>
        </div>
      </div>

      {/* Support Dialog Modal */}
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
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}>
            <h3 style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: '1.6rem',
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
              color: '#B3211E'
            }}>
              🚀 Support ImmutableType
            </h3>
            
            <p style={{
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: '#333',
            }}>
              Help us expand decentralized journalism to new cities and receive EMOJI rewards!
            </p>
            
            {/* Preset Support Amounts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <button
                onClick={() => handlePresetTip(10)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: '#1D7F6E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
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
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>10 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Supporter</span>
              </button>

              <button
                onClick={() => handlePresetTip(50)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: '#2B3990',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
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
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>50 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Advocate</span>
              </button>

              <button
                onClick={() => handlePresetTip(250)}
                disabled={isProcessing}
                style={{
                  padding: '1rem',
                  backgroundColor: '#E8A317',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'default' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
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
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>250 FLOW</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Champion</span>
              </button>
            </div>

            {/* Custom Amount */}
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
                min="1"
                step="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #D9D9D9',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#B3211E';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D9D9D9';
                }}
              />
              <p style={{
                fontSize: '0.8rem',
                textAlign: 'center',
                margin: '0.5rem 0 0 0',
                color: '#666',
              }}>
                You'll receive {(parseFloat(tipAmount) || 0) * 10} EMOJI tokens as a thank you!
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
                  color: '#333',
                  border: '2px solid #D9D9D9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F1E8';
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
                  backgroundColor: '#B3211E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isProcessing || !tipAmount || parseFloat(tipAmount) <= 0) ? 'default' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
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
                    e.currentTarget.style.backgroundColor = '#B3211E';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : `Support with ${tipAmount} FLOW`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}