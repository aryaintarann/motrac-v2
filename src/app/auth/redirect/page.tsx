'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function RedirectComponent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get('next')
    
    // SECURITY: Validate redirect URL to prevent open redirect attacks
    const isValidRedirect = (url: string | null): boolean => {
      if (!url) return false
      
      // Must start with / for relative URLs
      if (!url.startsWith('/')) return false
      
      // Prevent protocol-relative URLs (//evil.com)
      if (url.startsWith('//')) return false
      
      // Prevent URLs with protocols
      if (url.includes('://')) return false
      
      // Prevent javascript: URLs
      if (url.toLowerCase().includes('javascript:')) return false
      
      return true
    }
    
    if (next && isValidRedirect(next)) {
      window.location.href = next
    } else {
      // Fallback to dashboard for invalid redirects
      window.location.href = '/dashboard'
    }
  }, [searchParams])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8fafc'
    }}>
      <div>Redirecting...</div>
    </div>
  )
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <RedirectComponent />
    </Suspense>
  )
}