// app/(client)/moonbuffaflow/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Generate array of 156 NFTs
const NFT_COLLECTION = Array.from({ length: 156 }, (_, i) => ({
  tokenId: i,
  imageUrl: `https://bafybeigaxhfmetbogj6s2gz3rjdiburtg6pfrbj2la5igl2skgkn2pz7te.ipfs.w3s.link/${i}.PNG`,
  status: 'unknown' as 'unknown' | 'available' | 'burned' | 'pooled' | 'owned'
}));

export default function MoonBuffaFlowPage() {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      margin: '0 -20px', // Negative margin to override parent padding
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated stars background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 150 }, (_, i) => {
          const size = Math.random() * 3;
          const animationDuration = Math.random() * 3 + 2;
          const delay = Math.random() * 2;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: 'white',
                borderRadius: '50%',
                opacity: 0,
                animation: `twinkle_${i} ${animationDuration}s ${delay}s infinite`
              }}
            >
              <style jsx>{`
                @keyframes twinkle_${i} {
                  0% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.2); }
                  100% { opacity: 0.2; transform: scale(1); }
                }
              `}</style>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontFamily: "'Special Elite', monospace",
            marginBottom: '0.5rem',
            color: '#FFFFFF',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4)',
            letterSpacing: '2px'
          }}>
            MoonBuffaFLOW
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#B8C5D6',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            156 Unique Buffalo NFTs on Flow Blockchain
          </p>
          
          {/* Collection Info */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '2rem auto',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}>
            <p style={{ margin: '0.5rem 0', color: '#FFFFFF' }}>
              <strong style={{ color: '#FFD700' }}>Total Supply:</strong> 156
            </p>
            <p style={{ margin: '0.5rem 0', color: '#FFFFFF' }}>
              <strong style={{ color: '#FFD700' }}>Blockchain:</strong> Flow EVM
            </p>
            <p style={{ margin: '0.5rem 0', wordBreak: 'break-all', color: '#FFFFFF' }}>
              <strong style={{ color: '#FFD700' }}>Contract:</strong> 0xc8654A7a...FA3b4798
            </p>
          </div>
        </div>

        {/* NFT Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: isMobile ? '1rem' : '0.5rem',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {NFT_COLLECTION.map(nft => (
            <NFTCard 
              key={nft.tokenId} 
              nft={nft} 
              isMobile={isMobile}
              onClick={() => setSelectedNFT(nft.tokenId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// NFT Card Component
function NFTCard({ 
  nft, 
  isMobile, 
  onClick 
}: { 
  nft: typeof NFT_COLLECTION[0], 
  isMobile: boolean,
  onClick: () => void 
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Link href={`/moonbuffaflow/${nft.tokenId}`}>
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          borderRadius: isMobile ? '8px' : '4px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          aspectRatio: '1',
          transition: 'all 0.3s ease',
          transform: 'translateZ(0)', // Hardware acceleration
        }}
        onMouseOver={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
            e.currentTarget.style.zIndex = '10';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
          }
        }}
        onMouseOut={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1) translateZ(0)';
            e.currentTarget.style.zIndex = '1';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {/* Loading State */}
        {isLoading && !imageError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}>
            <style jsx>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Image or Error State */}
        {imageError ? (
          <BuffaNoLoad tokenId={nft.tokenId} />
        ) : (
          <img
            src={nft.imageUrl}
            alt={`MoonBuffa #${nft.tokenId}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isLoading ? 'none' : 'block'
            }}
            onError={() => setImageError(true)}
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Token ID */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: isMobile ? '0.5rem' : '0.25rem',
          fontSize: isMobile ? '0.875rem' : '0.75rem',
          textAlign: 'center',
          fontWeight: 600,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          #{nft.tokenId}
        </div>
      </div>
    </Link>
  );
}

// BuffaNoLoad Component
function BuffaNoLoad({ tokenId }: { tokenId: number }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.5)',
      color: '#FFD700'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🦬</div>
      <div style={{ fontSize: '0.75rem' }}>BuffaNOLOAD</div>
      <div style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>#{tokenId}</div>
    </div>
  );
}