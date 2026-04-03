'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function AuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // If user is logged in and on home page
      if (user && window.location.pathname === '/') {
        // If there's a hash fragment, stay on landing page to show the section
        if (window.location.hash) {
          // Don't redirect - user came here intentionally to see a section
          return
        } else {
          // No hash fragment, redirect to dashboard
          window.location.href = '/dashboard'
        }
      }
    }

    handleAuthRedirect()
  }, [router])

  return null
}