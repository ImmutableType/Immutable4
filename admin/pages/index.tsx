import React, { useState, useEffect } from 'react';
import { contractService } from '../lib/contractService';

interface TokenCounts {
  publishers: number;
  members: number;
  totalMinted: number;
}

export default function AdminDashboard() {
  const [tokenCounts, setTokenCounts] = useState<TokenCounts>({
    publishers: 0,
    members: 1, // Fallback to God token
    totalMinted: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    loadTokenCounts();
  }, []);

  const loadTokenCounts = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from real contracts first
      if (typeof window !== 'undefined' && window.ethereum) {
        await contractService.connectWallet();
        
        // Get real data from contracts
        const publisherCount = Number(await contractService.getTotalPublisherCredentials());
        const memberCount = Number(await contractService.getTotalMemberTokens());
        
        setTokenCounts({
          publishers: publisherCount,
          members: memberCount,
          totalMinted: publisherCount + memberCount
        });
        
        // Load recent activity
        const activity = [];
        if (memberCount > 1) {
          activity.push(`${memberCount - 1} member token(s) minted beyond God Token #0`);
        }
        if (publisherCount > 0) {
          activity.push(`${publisherCount} publisher credential(s) issued`);
        }
        setRecentActivity(activity);
        
      } else {
        // Fallback to mock data
        setTokenCounts({
          publishers: 0,
          members: 1,
          totalMinted: 1
        });
        setRecentActivity(['No wallet connected - showing mock data']);
      }
    } catch (error) {
      console.error('Error loading token counts:', error);
      // Keep fallback values
      setRecentActivity(['Error loading data from contracts']);
    } finally {
      setIsLoading(false);
    }
  };

  // Add refresh function
  const handleRefresh = () => {
    loadTokenCounts();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1f2937', marginBottom: '8px' }}>ImmutableType Admin Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0' }}>Manage tokens and credentials for the beta phase</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>
      
      {/* Token Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>Publisher Credentials</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
            {isLoading ? '...' : tokenCounts.publishers}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Active Journalist Credentials</div>
          <button 
            style={{ 
              width: '100%',
              padding: '10px 16px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.location.href = '/publishers'}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
          >
            Manage Publishers
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>Founding Members (0-99)</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
            {isLoading ? '...' : `${tokenCounts.members}/100`}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Core Community Tokens</div>
          <button 
            style={{ 
              width: '100%',
              padding: '10px 16px', 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.location.href = '/members'}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
          >
            Manage Members
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>Platform Status</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
            {isLoading ? '...' : tokenCounts.totalMinted}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Total Tokens Issued</div>
          <div style={{ 
            padding: '10px 16px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#374151'
          }}>
            Beta Phase Active
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#7c3aed', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.location.href = '/publishers'}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6d28d9'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
          >
            + Issue New Credential
          </button>
          <button 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#059669', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.location.href = '/members'}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#047857'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
          >
            + Mint Member Token
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '20px' }}>Recent Activity</h2>
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          padding: '20px'
        }}>
          {isLoading ? (
            <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
              Loading activity...
            </p>
          ) : recentActivity.length > 0 ? (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              {recentActivity.map((activity, index) => (
                <li key={index} style={{ color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
                  {activity}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
              No recent activity. Start by issuing publisher credentials or minting member tokens.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}