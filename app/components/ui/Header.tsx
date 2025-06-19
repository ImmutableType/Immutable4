'use client'
import { useState } from 'react'

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold">
          ImmutableType<span className="text-gray-500 italic ml-1">[beta]</span>
        </h1>
        
        <button className="px-4 py-2 rounded-full bg-blue-500 text-white font-medium">
          Connect Wallet
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-2">
            <ul className="space-y-2">
              <li><a href="/" className="block py-2">Home</a></li>
              <li><button className="block py-2 w-full text-left">About</button></li>
              <li><button className="block py-2 w-full text-left">FAQ</button></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}