import React, { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import { contractService } from '../lib/contractService';

interface Member {
  tokenId: number;
  address: string;
  name?: string;
  mintedAt: string;
  status: 'minted' | 'available';
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [mintFormData, setMintFormData] = useState({
    address: '',
    name: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      // Try to load from real contracts first
      if (typeof window !== 'undefined' && window.ethereum) {
        // Wallet is already connected via WalletConnect component
        
        const totalMinted = await contractService.getTotalMemberTokens();
        const membersFromContract = [];
        
        // Load all minted tokens from contract
        for (let i = 0; i <= 99; i++) {
          try {
            const isMinted = await contractService.isTokenMinted(i);
            if (isMinted) {
              const member = await contractService.getMemberToken(i);
              membersFromContract.push({
                tokenId: i,
                address: member.owner,
                name: member.name,
                mintedAt: new Date(Number(member.mintedAt) * 1000).toISOString(),
                status: 'minted' as const
              });
            }
          } catch (error) {
            // Token doesn't exist, skip
          }
        }
        
        setMembers(membersFromContract);
        return;
      }
    } catch (error) {
      console.error('Error loading from contracts:', error);
    }
    
    // Fallback to mock data
    setMembers([
      {
        tokenId: 0,
        address: '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2',
        name: 'Admin (God Token)',
        mintedAt: new Date().toISOString(),
        status: 'minted'
      }
    ]);
  };

  const handleTokenClick = (tokenId: number) => {
    const existingMember = members.find(m => m.tokenId === tokenId);
    if (existingMember && existingMember.status === 'minted') {
      // Show member details
      alert(`Token #${tokenId}\nOwner: ${existingMember.address}\nName: ${existingMember.name || 'Unnamed'}\nMinted: ${new Date(existingMember.mintedAt).toLocaleDateString()}`);
      return;
    }
    
    // Token is available for minting
    setSelectedTokenId(tokenId);
    setShowMintForm(true);
  };

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintFormData.address || selectedTokenId === null) {
      alert('Address is required');
      return;
    }

    try {
      // Try to mint with real contract
      if (typeof window !== 'undefined' && window.ethereum) {
        // Wallet is already connected via WalletConnect component
        
        const receipt = await contractService.mintMemberToken(
          selectedTokenId,
          mintFormData.address,
          mintFormData.name || `Member #${selectedTokenId}`
        );
        
        console.log('Token minted on blockchain:', receipt);
        
        // Reload members from contract
        await loadMembers();
        
        // Reset form
        setMintFormData({ address: '', name: '' });
        setSelectedTokenId(null);
        setShowMintForm(false);
        
        alert(`Token #${selectedTokenId} minted successfully on blockchain!`);
        return;
      }
    } catch (error) {
      console.error('Error minting token:', error);
      alert(`Error minting token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Fallback to mock behavior if wallet not connected
    const newMember: Member = {
      tokenId: selectedTokenId,
      address: mintFormData.address,
      name: mintFormData.name || undefined,
      mintedAt: new Date().toISOString(),
      status: 'minted'
    };

    setMembers(prev => [...prev, newMember]);
    setMintFormData({ address: '', name: '' });
    setSelectedTokenId(null);
    setShowMintForm(false);
    
    alert(`Token #${selectedTokenId} minted successfully (mock)!`);
  };

  const isMinted = (tokenId: number) => {
    return members.some(m => m.tokenId === tokenId && m.status === 'minted');
  };

  const getMintedCount = () => {
    return members.filter(m => m.status === 'minted').length;
  };

  const renderTokenGrid = () => {
    const tokens = [];
    for (let i = 0; i <= 99; i++) {
      const minted = isMinted(i);
      const isGodToken = i === 0;
      
      tokens.push(
        <div
          key={i}
          onClick={() => handleTokenClick(i)}
          style={{
            width: '40px',
            height: '40px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: isGodToken ? '#7c3aed' : (minted ? '#10b981' : '#f9fafb'),
            color: isGodToken ? 'white' : (minted ? 'white' : '#374151'),
            transition: 'all 0.2s',
            ...(minted ? {} : {
              ':hover': {
                backgroundColor: '#e5e7eb',
                transform: 'scale(1.05)'
              }
            })
          }}
          onMouseOver={(e) => {
            if (!minted && !isGodToken) {
              (e.target as HTMLDivElement).style.backgroundColor = '#e5e7eb';
              (e.target as HTMLDivElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseOut={(e) => {
            if (!minted && !isGodToken) {
              (e.target as HTMLDivElement).style.backgroundColor = '#f9fafb';
              (e.target as HTMLDivElement).style.transform = 'scale(1)';
            }
          }}
          title={isGodToken ? 'God Token (Admin)' : (minted ? `Token #${i} - Minted` : `Token #${i} - Available`)}
        >
          {i}
        </div>
      );
    }
    return tokens;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>Founding Members (0-99)</h1>
          <p style={{ color: '#6b7280', margin: '0' }}>Core community tokens with governance rights</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Wallet Connection */}
      <WalletConnect />

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {getMintedCount()}/100
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Tokens Minted</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
            {100 - getMintedCount()}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Available</div>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
            #0
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>God Token (You)</div>
        </div>
      </div>

      {/* Mint Form Modal */}
      {showMintForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>
              Mint Token #{selectedTokenId}
            </h3>
            
            <form onSubmit={handleMintSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                  Wallet Address *
                </label>
                <input
                  type="text"
                  value={mintFormData.address}
                  onChange={(e) => setMintFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="0x..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                  Member Name (Optional)
                </label>
                <input
                  type="text"
                  value={mintFormData.name}
                  onChange={(e) => setMintFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter member name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: '1',
                    padding: '12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Mint Token
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMintForm(false);
                    setSelectedTokenId(null);
                    setMintFormData({ address: '', name: '' });
                  }}
                  style={{
                    flex: '1',
                    padding: '12px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Grid */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Token Grid (0-99)</h3>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            <span style={{ color: '#7c3aed', fontWeight: '500' }}>Purple: God Token</span>
            {' • '}
            <span style={{ color: '#10b981', fontWeight: '500' }}>Green: Minted</span>
            {' • '}
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Gray: Available</span>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '8px',
          maxWidth: '500px'
        }}>
          {renderTokenGrid()}
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Click on any gray token to mint it to a wallet address.
          Click on colored tokens to view details.
        </div>
      </div>
    </div>
  );
}