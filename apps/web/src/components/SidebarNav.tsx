'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarNav({ isCollapsed }: { isCollapsed?: boolean }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
    { name: 'Transactions', href: '/transactions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
    { name: 'Budgets', href: '/budgets', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> },
    { name: 'Categories', href: '/categories', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { name: 'AI Advisor', href: '/ai-advisor', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> },
    { name: 'Debt', href: '/debts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg> },
    { name: 'Reports', href: '/reports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
    { name: 'Accounts', href: '/accounts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`flex flex-1 flex-col gap-1.5 print:hidden ${isCollapsed ? 'items-center w-full' : 'w-full'}`}>
      {navItems.map((item) => {
        const active = isActive(item.href)
        return (
          <Link 
            key={item.href}
            href={item.href} 
            title={isCollapsed ? item.name : undefined}
            className={`rounded-lg py-2.5 flex items-center transition-colors ${
              isCollapsed ? 'justify-center w-11 px-0' : 'px-3 gap-3 w-full'
            } ${active ? 'font-semibold text-[#2563EB] bg-[#EFF6FF]' : 'font-medium text-[#475569] hover:bg-gray-50'}`}
          >
            <div className={`${active ? 'opacity-100' : 'opacity-80'} shrink-0`}>{item.icon}</div>
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
          </Link>
        )
      })}
      
      <div className="flex-1"></div>

      <Link 
        href="/help" 
        title={isCollapsed ? 'Help & Support' : undefined}
        className={`rounded-lg py-2.5 flex items-center transition-colors ${
           isCollapsed ? 'justify-center w-11 px-0' : 'px-3 gap-3 w-full text-left'
        } ${isActive('/help') ? 'font-semibold text-[#2563EB] bg-[#EFF6FF]' : 'font-medium text-[#475569] hover:bg-gray-50'}`}
      >
        <div className={`${isActive('/help') ? 'opacity-100' : 'opacity-80'} shrink-0`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Help & Support</span>}
      </Link>
    </nav>
  )
}
