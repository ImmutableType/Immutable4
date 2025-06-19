import React from 'react';
import { useWallet } from '../lib/useWallet';

export default function WalletConnect() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (isConnected) {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#dcfce7',
        border: '1px solid #16a34a',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>
          ✅ Wallet Connected
        </div>
        <div style={{ fontSize: '12px', color: '#166534', fontFamily: 'monospace' }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={disconnectWallet}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #dc2626',
      borderRadius: '6px',
      marginBottom: '20px'
    }}>
      <div style={{ fontSize: '14px', color: '#dc2626', marginBottom: '8px' }}>
        Connect MetaMask to interact with contracts
      </div>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        style={{
          padding: '8px 16px',
          backgroundColor: isConnecting ? '#6b7280' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
      </button>
    </div>
  );
}