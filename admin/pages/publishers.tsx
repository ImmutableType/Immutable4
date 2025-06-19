import React, { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import { contractService } from '../lib/contractService';

interface Publisher {
  id: string;
  tokenId?: number;
  address: string;
  name?: string;
  geographicRights: string[];
  subjectRights: string[];
  issuedAt: string;
  status: 'active' | 'revoked';
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    geographicRights: [] as string[],
    subjectRights: [] as string[]
  });

  const geographicOptions = ['Miami', 'Florida', 'USA', 'International'];
  const subjectOptions = ['Politics', 'Sports', 'Tech', 'General News', 'Business', 'Arts & Culture', 'Climate'];

  useEffect(() => {
    loadPublishers();
  }, []);








  const loadPublishers = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from real contracts first
      if (typeof window !== 'undefined' && window.ethereum) {
        await contractService.connectWallet();
        
        const totalCredentials = Number(await contractService.getTotalPublisherCredentials());
        const publishersFromContract = [];
        
        // Load all issued credentials from contract
        for (let tokenId = 1; tokenId <= totalCredentials; tokenId++) {
          try {
            const credential = await contractService.getPublisherCredential(tokenId);
            
            publishersFromContract.push({
              id: tokenId.toString(),
              tokenId: tokenId,
              address: credential.journalist,
              name: credential.name,
              geographicRights: credential.geographicRights,
              subjectRights: credential.subjectRights,
              issuedAt: new Date(Number(credential.issuedAt) * 1000).toISOString(),
              status: credential.isActive ? 'active' as const : 'revoked' as const
            });
          } catch (error) {
            console.error(`Error loading credential ${tokenId}:`, error);
          }
        }
        
        setPublishers(publishersFromContract);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading from contracts:', error);
    }








    
    // Fallback to empty state
    setPublishers([]);
    setIsLoading(false);
  };

  const handleCheckboxChange = (field: 'geographicRights' | 'subjectRights', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address) {
      alert('Wallet address is required');
      return;
    }

    setIsLoading(true);

    try {
      // Try to issue with real contract
      if (typeof window !== 'undefined' && window.ethereum) {
        await contractService.connectWallet();
        
        const receipt = await contractService.issueCredential(
          formData.address,
          formData.name || 'Unnamed Journalist',
          formData.geographicRights,
          formData.subjectRights
        );
        
        console.log('Credential issued on blockchain:', receipt);
        
        // Reload publishers from contract
        await loadPublishers();
        
        // Reset form
        setFormData({
          address: '',
          name: '',
          geographicRights: [],
          subjectRights: []
        });
        setShowForm(false);
        
        alert('Publisher credential issued successfully on blockchain!');
        return;
      }
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert(`Error issuing credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }

    // Fallback to mock behavior if wallet not connected
    const newPublisher: Publisher = {
      id: Date.now().toString(),
      address: formData.address,
      name: formData.name || undefined,
      geographicRights: formData.geographicRights,
      subjectRights: formData.subjectRights,
      issuedAt: new Date().toISOString(),
      status: 'active'
    };

    setPublishers(prev => [...prev, newPublisher]);
    setFormData({
      address: '',
      name: '',
      geographicRights: [],
      subjectRights: []
    });
    setShowForm(false);
    
    alert('Publisher credential issued successfully (mock)!');
  };

  const revokeCredential = async (publisherId: string, tokenId?: number) => {
    if (!confirm('Are you sure you want to revoke this credential?')) return;
    
    setIsLoading(true);

    try {
      // Try to revoke with real contract
      if (typeof window !== 'undefined' && window.ethereum && tokenId) {
        await contractService.connectWallet();
        
        const receipt = await contractService.revokeCredential(tokenId);
        console.log('Credential revoked on blockchain:', receipt);
        
        // Reload publishers from contract
        await loadPublishers();
        
        alert('Credential revoked successfully on blockchain!');
        return;
      }
    } catch (error) {
      console.error('Error revoking credential:', error);
      alert(`Error revoking credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }

    // Fallback to mock behavior
    setPublishers(prev => 
      prev.map(pub => 
        pub.id === publisherId 
          ? { ...pub, status: 'revoked' as const }
          : pub
      )
    );
    
    alert('Credential revoked successfully (mock)!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>Publisher Credentials</h1>
          <p style={{ color: '#6b7280', margin: '0' }}>Manage journalist publishing rights and credentials</p>
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


          <button
  onClick={() => setShowForm(!showForm)}
  style={{
    padding: '10px 20px',
    backgroundColor: showForm ? '#dc2626' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }}
>
  {showForm ? 'Cancel' : '+ Issue New Credential'}
</button>

        </div>
      </div>

      {/* Wallet Connection */}
      <WalletConnect />

      {/* Issue Credential Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Issue New Publisher Credential</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                Wallet Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                Journalist Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter journalist name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                  Geographic Rights
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {geographicOptions.map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.geographicRights.includes(option)}
                        onChange={() => handleCheckboxChange('geographicRights', option)}
                        style={{ marginRight: '8px' }}
                        disabled={isLoading}
                      />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                  Subject Matter Rights
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subjectOptions.map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.subjectRights.includes(option)}
                        onChange={() => handleCheckboxChange('subjectRights', option)}
                        style={{ marginRight: '8px' }}
                        disabled={isLoading}
                      />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoading ? '#6b7280' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isLoading ? 'Issuing...' : 'Issue Credential'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Publishers List */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0', color: '#374151' }}>
            Active Credentials ({publishers.filter(p => p.status === 'active').length})
            {isLoading && <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '10px' }}>Loading...</span>}
          </h3>
        </div>

        {publishers.length === 0 && !isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No publisher credentials issued yet. Click "Issue New Credential" to get started.
          </div>
        ) : (
          <div>
            {publishers.map((publisher, index) => (
              <div
                key={publisher.id}
                style={{
                  padding: '20px',
                  borderBottom: index < publishers.length - 1 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: publisher.status === 'revoked' ? '#fef2f2' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {publisher.name || 'Unnamed Journalist'}
                      </span>
                      {publisher.tokenId && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontFamily: 'monospace'
                        }}>
                          Token #{publisher.tokenId}
                        </span>
                      )}
                      <span style={{
                        marginLeft: '12px',
                        padding: '2px 8px',
                        backgroundColor: publisher.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: publisher.status === 'active' ? '#166534' : '#dc2626',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {publisher.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                      {publisher.address}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Geographic: </span>
                        <span style={{ color: '#6b7280' }}>
                          {publisher.geographicRights.length > 0 ? publisher.geographicRights.join(', ') : 'None'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Subjects: </span>
                        <span style={{ color: '#6b7280' }}>
                          {publisher.subjectRights.length > 0 ? publisher.subjectRights.join(', ') : 'None'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      Issued: {new Date(publisher.issuedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {publisher.status === 'active' && (
                    <button
                      onClick={() => revokeCredential(publisher.id, publisher.tokenId)}
                      disabled={isLoading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isLoading ? '#6b7280' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {isLoading ? '...' : 'Revoke'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}