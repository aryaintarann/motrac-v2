'use client'

import { useEffect } from 'react'

export function BrowserNavigationHandler() {
  useEffect(() => {
    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname
      const currentHash = window.location.hash
      
      // If user navigates back to home page with hash from login/signup pages
      if (currentPath === '/' && currentHash) {
        // Force a full page reload to ensure we get the correct content
        window.location.reload()
      }
    }

    // Listen for browser navigation (back/forward button)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return null
}