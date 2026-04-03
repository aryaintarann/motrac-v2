'use client'

import { useEffect } from 'react'

export function HashNavigationHandler() {
  useEffect(() => {
    // Handle hash navigation on mount and when hash changes
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        // Use setTimeout to ensure the page is fully loaded
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    }

    // Handle initial hash on mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return null
}