'use client'

import { useState } from 'react'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`hidden flex-col border-r border-[#E5E7EB] bg-white p-6 pb-6 lg:flex print:hidden relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[88px] items-center' : 'w-[260px]'}`}>
      <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center w-full' : 'w-full'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
            <span className="text-[22px] font-black tracking-[0.05em] text-[#2563EB] whitespace-nowrap overflow-hidden">DANAROUTE</span>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white bg-[#2563EB] font-black text-xl shadow-sm shrink-0">
            D
          </div>
        )}
        
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="ml-auto text-gray-400 hover:text-[#2563EB] transition-colors" title="Collapse Sidebar">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        )}
      </div>

      {isCollapsed && (
        <button onClick={() => setIsCollapsed(false)} className="mb-6 text-gray-400 hover:text-[#2563EB] transition-colors" title="Expand Sidebar">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>
        </button>
      )}

      <SidebarNav isCollapsed={isCollapsed} />
    </aside>
  )
}
