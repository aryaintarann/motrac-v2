'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SignupButtonProps {
  style?: React.CSSProperties
  children?: React.ReactNode
  className?: string
}

export function SignupButton({ style, children = 'Get Started', className }: SignupButtonProps) {
  const [signupHref, setSignupHref] = useState('/signup')

  useEffect(() => {
    const updateSignupHref = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.hash
        if (currentPath !== '/') {
          setSignupHref(`/signup?next=${encodeURIComponent(currentPath)}`)
        } else {
          setSignupHref('/signup')
        }
      }
    }

    // Update on mount
    updateSignupHref()

    // Update on hash change
    window.addEventListener('hashchange', updateSignupHref)
    
    return () => {
      window.removeEventListener('hashchange', updateSignupHref)
    }
  }, [])

  return (
    <Link href={signupHref} style={style} className={className}>
      {children}
    </Link>
  )
}
