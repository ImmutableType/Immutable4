// app/app/(client)/layout.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletConnect } from '../../components/wallet/WalletConnect'
import EmojiCreditBalance from '../../components/wallet/EmojiCreditBalance';
import { useWallet } from '../../lib/hooks/useWallet'
import { useBookmarks } from '../../lib/engagement/hooks/useBookmarks'  // ADD THIS LINE



export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isConnected } = useWallet() // Add this line
  const { bookmarkCount } = useBookmarks();


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




{/* User Section - Only visible when connected */}
{isConnected && (
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
      My Dashboard
    </h2>
    
    {/* Emoji Credit Balance */}
    <EmojiCreditBalance />
    
    {/* Activity Metrics */}
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '16px'
    }}>
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        marginBottom: '8px' 
      }}>
        Your Activity
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {/* Bookmarks Count - Would use cached data in production */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{bookmarkCount}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>Bookmarks</span>
        </div>
        
        {/* Curated Posts - Would use cached data in production */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>5</span>
          <span style={{ fontSize: '12px', color: '#666' }}>Curated</span>
        </div>
        
        {/* Proposal Votes - Would use cached data in production */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>27</span>
          <span style={{ fontSize: '12px', color: '#666' }}>Votes</span>
        </div>
        
        {/* Leaderboard Position - Would use cached data in production */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            #42
            <span style={{ 
              fontSize: '14px', 
              color: '#1D7F6E',
              marginLeft: '4px'
            }}>
              ↑3
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#666' }}>Rank</span>
        </div>
      </div>
    </div>
  </div>
)}










          
          {/* Featured Location Section */}
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






          {/* Featured Profiles Section */}

                    {/* Featured Profiles Section - Commented out temporarily

<div style={{ 
  padding: '16px',
  borderBottom: '1px solid #D9D9D9'
}}>
  <h2 style={{ 
    fontSize: '16px', 
    fontWeight: 'bold', 
    marginBottom: '16px',
    fontFamily: "'Special Elite', monospace"
  }}>
    Featured Profiles
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
      <a 
        href="#" 
        style={{ 
          textDecoration: 'none', 
          color: '#000000',
          padding: '8px',
          borderRadius: '4px',
          display: 'block'
        }}
        className="nav-item"
      >
        damon.eth
      </a>
    </li>
  </ul>
</div>
          
*/}




         

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