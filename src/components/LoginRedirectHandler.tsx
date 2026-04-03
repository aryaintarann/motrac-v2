'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function LoginRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAndRedirect() {
      const next = searchParams.get('next')
      
      // Only check if there's a next parameter
      if (next) {
        console.log('LoginRedirectHandler - Next param found:', next)
        
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        console.log('LoginRedirectHandler - User:', user ? 'logged in' : 'not logged in')
        
        // If user is logged in and there's a next parameter, redirect
        if (user) {
          console.log('LoginRedirectHandler - Redirecting to:', next)
          // Use window.location.href for better handling of hash fragments
          window.location.href = next
          return
        }
      }
      
      setIsChecking(false)
    }
    
    checkAndRedirect()
  }, [searchParams, router])

  // Show loading overlay while checking to prevent flicker
  if (isChecking && searchParams.get('next')) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: '#f8fafc', 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Redirecting...</div>
      </div>
    )
  }

  return null
}
