// app/(client)/layout.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ethers } from 'ethers'
import { WalletConnect } from '../../components/wallet/WalletConnect'
import { useWallet } from '../../lib/hooks/useWallet'

// Contract addresses - REAL DEPLOYED ADDRESSES
const EMOJI_TOKEN_ADDRESS = '0x572F036576D1D9F41876e714D47f69CEa6933c36';
const BOOKMARK_CONTRACT_ADDRESS = '0x66f856f960AEF5011FdCc7383B9F81d2515930c9';
const COMMUNITY_ARTICLES_ADDRESS = '0xD3d12E3b86Ed9f8Cdd095E0f90EDF7eE61Eb8611';
const PORTFOLIO_ARTICLES_ADDRESS = '0xF2Da11169CE742Ea0B75B7207E774449e26f8ee1';
const LEADERBOARD_V4_ADDRESS = '0x5001A51d7479a9cd91Ac4CBEB81931f197F63d56';

// Contract ABIs - Minimal required functions
const EMOJI_TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];
const BOOKMARK_ABI = ["function getUserBookmarkCount(address) view returns (uint256)"];
const ARTICLES_ABI = ["function getUserPostingStats(address) view returns (uint256 totalPosts, uint256 postsToday, uint256 remainingToday)"];
const LEADERBOARD_V4_ABI = [
  "function calculateUserScore(address) view returns (uint256)",
  "function getUserLiveScore(address) view returns (uint256)"
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isConnected, address } = useWallet()
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    emojiBalance: '0',
    bookmarkCount: 0,
    curatedCount: 0,
    userScore: 0,
    loading: true
  })

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobile) setIsMobileMenuOpen(false)
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.sidebar') && !target.closest('.menu-button')) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen, isMobile])
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Load dashboard data when wallet connects
  useEffect(() => {
    async function loadDashboardData() {
      if (!address || !isConnected) {
        setDashboardData({
          emojiBalance: '0',
          bookmarkCount: 0,
          curatedCount: 0,
          userScore: 0,
          loading: false
        })
        return
      }

      console.debug('Loading dashboard data for:', address)
      
      try {
        const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org')
        
        // Load EMOJI balance
        let emojiBalance = '0'
        try {
          const emojiToken = new ethers.Contract(EMOJI_TOKEN_ADDRESS, EMOJI_TOKEN_ABI, rpcProvider)
          const balance = await emojiToken.balanceOf(address)
          emojiBalance = ethers.formatEther(balance)
          console.debug('EMOJI balance:', emojiBalance)
        } catch (error) {
          console.error('Error loading EMOJI balance:', error)
        }

        // Load bookmarks count
        let bookmarkCount = 0
        try {
          const bookmarkContract = new ethers.Contract(BOOKMARK_CONTRACT_ADDRESS, BOOKMARK_ABI, rpcProvider)
          const count = await bookmarkContract.getUserBookmarkCount(address)
          bookmarkCount = Number(count)
          console.debug('Bookmark count:', bookmarkCount)
        } catch (error) {
          console.error('Error loading bookmark count:', error)
        }

        // Load curated count (Community + Portfolio articles) - NOW WITH REAL ADDRESSES
        let curatedCount = 0
        try {
          const communityContract = new ethers.Contract(COMMUNITY_ARTICLES_ADDRESS, ARTICLES_ABI, rpcProvider)
          const portfolioContract = new ethers.Contract(PORTFOLIO_ARTICLES_ADDRESS, ARTICLES_ABI, rpcProvider)
          
          const [communityStats] = await communityContract.getUserPostingStats(address)
          const [portfolioStats] = await portfolioContract.getUserPostingStats(address)
          
          curatedCount = Number(communityStats) + Number(portfolioStats)
          console.debug('Curated count:', curatedCount, '(Community:', Number(communityStats), 'Portfolio:', Number(portfolioStats), ')')
        } catch (error) {
          console.error('Error loading curated count:', error)
        }

        // Load leaderboard score - USE ON-CHAIN CONTRACT DATA (SOURCE OF TRUTH)
        let userScore = 0
        try {
          const leaderboard = new ethers.Contract(LEADERBOARD_V4_ADDRESS, LEADERBOARD_V4_ABI, rpcProvider)
          userScore = Number(await leaderboard.getUserLiveScore(address))
          console.debug('User score (on-chain):', userScore)
        } catch (error) {
          console.error('Error loading leaderboard data:', error)
        }

        setDashboardData({
          emojiBalance,
          bookmarkCount,
          curatedCount,
          userScore,
          loading: false
        })

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setDashboardData(prev => ({ ...prev, loading: false }))
      }
    }

    loadDashboardData()
  }, [address, isConnected])

// Listen for EMOJI purchase events
useEffect(() => {
  const handleBalanceChange = () => {
    console.log('🔔 EMOJI balance change event received, refreshing dashboard...');
    if (address && isConnected) {
      console.log('EMOJI balance change detected - would refresh here');
    }
  };
  
  window.addEventListener('emojiBalanceChanged', handleBalanceChange);
  return () => window.removeEventListener('emojiBalanceChanged', handleBalanceChange);
}, [address, isConnected]);
  
  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          className="menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 100,
            background: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {isMobileMenuOpen ? (
            // X icon for close
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            // Hamburger icon for menu
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      )}
      
      {/* Left sidebar - with mobile flyout */}
      <div 
        className="sidebar"
        style={{ 
          width: '250px',
          backgroundColor: '#F4F1E8',
          borderRight: '1px solid #D9D9D9',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          position: isMobile ? 'fixed' : 'relative',
          height: '100%',
          left: isMobile ? (isMobileMenuOpen ? '0' : '-250px') : '0',
          transition: 'left 0.3s ease',
          boxShadow: isMobile ? '0 0 10px rgba(0,0,0,0.1)' : 'none'
        }}
      >
          
        {/* App title - Fixed at the top */}
        <div style={{ 
          padding: '16px',
          borderBottom: '1px solid #D9D9D9',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexShrink: 0
        }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            fontFamily: "'Special Elite', monospace",
            margin: 0 
          }}>
            ImmutableType<span style={{ 
              color: '#6c757d', 
              fontStyle: 'italic',
              fontWeight: 'normal'
            }}>[beta]</span>
          </h1>
          
          <WalletConnect />
        </div>
        
        {/* Scrollable container for all navigation elements */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Main Navigation menu - Stacked vertically */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #D9D9D9'
          }}>
            <nav>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0, 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px'
              }}>
                <li>
                  <Link 
                    href="/reader" 
                    style={{ 
                      textDecoration: 'none',
                      color: pathname?.includes('/reader') ? '#B3211E' : '#000000',
                      fontWeight: pathname?.includes('/reader') ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: pathname?.includes('/reader') ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
                    }}
                    className="nav-item"
                  >
                    Reader
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/news-proposals" 
                    style={{ 
                      textDecoration: 'none',
                      color: pathname?.includes('/news-proposals') ? '#B3211E' : '#000000',
                      fontWeight: pathname?.includes('/news-proposals') ? 'bold' : 'normal',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: pathname?.includes('/news-proposals') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                      display: 'block'
                    }}
                    className="nav-item"
                  >
                    News Proposals
                  </Link>
                </li>
                {/* NEW: Marketplace navigation above Profiles */}
                <li>
                  <Link 
                    href="/marketplace" 
                    style={{ 
                      textDecoration: 'none',
                      color: pathname?.includes('/marketplace') ? '#B3211E' : '#000000',
                      fontWeight: pathname?.includes('/marketplace') ? 'bold' : 'normal',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: pathname?.includes('/marketplace') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                      display: 'block'
                    }}
                    className="nav-item"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/profile" 
                    style={{ 
                      textDecoration: 'none',
                      color: pathname?.includes('/profile') ? '#B3211E' : '#000000',
                      fontWeight: pathname?.includes('/profile') ? 'bold' : 'normal',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: pathname?.includes('/profile') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                      display: 'block'
                    }}
                    className="nav-item"
                  >
                    Profiles
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* MOVED: Featured Location Section above My Dashboard */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #D9D9D9'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Featured Location
            </h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0
            }}>
              <li>
                <Link 
                  href="/locations/florida/miami" 
                  style={{ 
                    textDecoration: 'none',
                    color: '#000000',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Miami
                </Link>
              </li>
            </ul>
          </div>


          {/* Decentralized Journalism Section */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #D9D9D9'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Decentralized Journalism
            </h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px' 
            }}>
              <li>
                <Link 
                  href="/about" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about') && !pathname?.includes('/about/') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about') && !pathname?.includes('/about/') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/for-journalists" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/for-journalists') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/for-journalists') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  For Journalists
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/for-readers" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/for-readers') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/for-readers') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  For Readers
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/mission" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/mission') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/mission') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Mission
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/faq" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/faq') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/faq') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/help" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/help') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/help') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Help Guide
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/donate" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/donate') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/donate') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Tip / Donate
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/roadmap" 
                  style={{ 
                    textDecoration: 'none', 
                    color: pathname?.includes('/about/roadmap') ? '#B3211E' : '#000000',
                    fontWeight: pathname?.includes('/about/roadmap') ? 'bold' : 'normal',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  className="nav-item"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* MetaMask Instructions */}
          <div style={{ 
            margin: '16px', 
            padding: '12px', 
            backgroundColor: '#F4F1E8', 
            borderRadius: '6px', 
            border: '1px solid #D9D9D9',
            marginBottom: '90px' // Added extra bottom margin for spacing
          }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              fontFamily: "'Special Elite', monospace"
            }}>
              Add Flow EVM to MetaMask
            </h3>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
              <li style={{ marginBottom: '4px' }}>Open MetaMask extension</li>
              <li style={{ marginBottom: '4px' }}>Click network dropdown at top</li>
              <li style={{ marginBottom: '4px' }}>Click "Add network"</li>
              <li>Select "Add a network manually"</li>
            </ol>
          </div>

        </div>
      </div>

      {/* Main content area - with mobile margins */}
      <div style={{ 
        flex: 1, 
        backgroundColor: 'white',
        overflowY: 'auto',
        padding: isMobile ? '60px 16px 16px 16px' : '20px', // Extra top padding on mobile for the menu button
        marginLeft: isMobile ? '0' : '0' // No margin on mobile to use full width
      }}>
        {children}
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 40
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <style jsx>{`
        .nav-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  )
}