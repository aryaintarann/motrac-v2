'use client'

import { useState } from 'react'
import { AccountForm } from './AccountForm'

export function AddAccountModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        New Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] p-6">
              <div>
                 <h3 className="font-bold text-[20px] text-[#0f172a] tracking-tight">Add New Account</h3>
                 <p className="text-[13px] text-[#64748b] mt-1">Register a new bank, wallet, or vault</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f8fafc] text-[#64748b] hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AccountForm onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
