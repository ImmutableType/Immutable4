// app/(client)/moonbuffaflow/[tokenId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Handle null params
  if (!params || !params.tokenId) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <p>Invalid token ID</p>
        <Link href="/moonbuffaflow" style={{ color: '#B3211E' }}>
          Back to Gallery
        </Link>
      </div>
    );
  }
  
  const tokenId = parseInt(params.tokenId as string);
  const [imageError, setImageError] = useState(false);

  // Validate tokenId is in valid range
  if (isNaN(tokenId) || tokenId < 0 || tokenId > 155) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <p>Invalid token ID: {params.tokenId}</p>
        <Link href="/moonbuffaflow" style={{ color: '#B3211E' }}>
          Back to Gallery
        </Link>
      </div>
    );
  }

  const imageUrl = `https://bafybeigaxhfmetbogj6s2gz3rjdiburtg6pfrbj2la5igl2skgkn2pz7te.ipfs.w3s.link/${tokenId}.PNG`;

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Back Button */}
      <Link 
        href="/moonbuffaflow"
        style={{
          display: 'inline-block',
          marginBottom: '2rem',
          color: '#666',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#B3211E'}
        onMouseOut={(e) => e.currentTarget.style.color = '#666'}
      >
        ← Back to Gallery
      </Link>

      {/* NFT Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Image */}
        <div style={{
          background: '#f5f5f5',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '1'
        }}>
          {imageError ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦬</div>
              <div style={{ fontSize: '1.5rem' }}>BuffaNOLOAD</div>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`MoonBuffa #${tokenId}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Details */}
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: "'Special Elite', monospace",
            marginBottom: '1rem'
          }}>
            MoonBuffa #{tokenId}
          </h1>

          <div style={{
            background: '#f5f5f5',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Collection:</strong> MoonBuffaFLOW
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Token ID:</strong> {tokenId}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Status:</strong> <span style={{ color: '#666' }}>Loading...</span>
            </p>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f9f9f9',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            <p style={{ margin: 0 }}>
              Contract: 0xc8654A7a4BD671D4cEac6096A92a3170FA3b4798
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}