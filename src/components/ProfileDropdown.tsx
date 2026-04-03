'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ProfileDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const email = user?.email
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="block h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-black overflow-hidden shadow-sm hover:ring-2 ring-offset-2 hover:ring-blue-100 transition-all focus:outline-none"
      >
         <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[220px] transform overflow-hidden rounded-[16px] bg-white shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="border-b border-gray-100 px-4 py-3 bg-gray-50/50">
            <p className="text-[12px] text-gray-500 font-medium">Signed in as</p>
            <p className="truncate text-[14px] font-bold text-gray-900 mt-0.5">{email}</p>
          </div>
          
          <div className="p-1.5">
            <Link 
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="group flex w-full items-center rounded-[10px] px-3 py-2 text-[14px] font-semibold text-[#475569] hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-gray-400 group-hover:text-blue-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              My Profile
            </Link>
          </div>
          
          <div className="border-t border-gray-100 p-1.5">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-[10px] px-3 py-2 text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-red-400 group-hover:text-red-500">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
