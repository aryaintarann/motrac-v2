'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function RedirectComponent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get('next')
    
    if (next) {
      // Use window.location.href for proper hash fragment handling
      window.location.href = next
    } else {
      // Fallback to dashboard
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