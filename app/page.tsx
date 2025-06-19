// app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/reader')
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirecting to reader...</p>
    </div>
  )
}