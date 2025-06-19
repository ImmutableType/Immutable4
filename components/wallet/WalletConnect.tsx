// components/wallet/WalletConnect.tsx
'use client'
import { useState } from 'react'
import { useWallet } from '../../lib/hooks/useWallet'

export function WalletConnect() {
  const { connect, address, isConnected, error } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect('metamask')
    } finally {
      setIsConnecting(false)
    }
  }
  
  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      style={{ 
        padding: '8px 12px',
        backgroundColor: isConnected ? '#1D7F6E' : '#000000', // Green when connected
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        cursor: isConnecting ? 'default' : 'pointer',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {isConnecting ? 'Connecting...' : 
       isConnected ? `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` : 
       'Connect Wallet'}
    </button>
  )
}