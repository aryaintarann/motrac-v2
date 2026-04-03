'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface LoginButtonProps {
  style?: React.CSSProperties
  children?: React.ReactNode
  className?: string
}

export function LoginButton({ style, children = 'Log in', className }: LoginButtonProps) {
  const [loginHref, setLoginHref] = useState('/login')

  useEffect(() => {
    const updateLoginHref = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.hash
        if (currentPath !== '/') {
          setLoginHref(`/login?next=${encodeURIComponent(currentPath)}`)
        } else {
          setLoginHref('/login')
        }
      }
    }

    // Update on mount
    updateLoginHref()

    // Update on hash change
    window.addEventListener('hashchange', updateLoginHref)
    
    return () => {
      window.removeEventListener('hashchange', updateLoginHref)
    }
  }, [])

  return (
    <Link href={loginHref} style={style} className={className}>
      {children}
    </Link>
  )
}
