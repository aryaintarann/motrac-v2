'use client';

import { useState } from 'react';
import { useBalance } from './BalanceContext';

export function HeaderActions() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { isHidden, toggle } = useBalance();

  return (
    <div className="flex items-center gap-3 relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="flex h-10 w-10 relative items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-500 border border-transparent hover:border-gray-200 transition-all"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span className="absolute top-[8px] right-[10px] h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
      </button>

      {showNotifications && (
        <div className="absolute top-12 right-12 w-[300px] bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-5 z-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[16px] text-[#0f172a]">Notifications</h4>
            <button className="text-[12px] font-semibold text-[#2563EB] hover:text-blue-700">Mark all read</button>
          </div>
          <div className="flex flex-col gap-3">
             <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-xl">💰</div>
                <div>
                  <div className="font-semibold text-[13px] text-gray-900">Salary arrived!</div>
                  <div className="text-[12px] text-gray-600 mt-0.5">Your monthly salary has been categorized.</div>
                  <div className="text-[10px] text-gray-400 mt-1">2 hours ago</div>
                </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-xl">🚨</div>
                <div>
                  <div className="font-semibold text-[13px] text-gray-900">Budget Warning</div>
                  <div className="text-[12px] text-gray-600 mt-0.5">You have spent 80% of your Wants budget.</div>
                  <div className="text-[10px] text-gray-400 mt-1">Yesterday</div>
                </div>
             </div>
          </div>
        </div>
      )}

      <button 
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 flex-shrink-0 text-[14px] font-medium text-[#475569] hover:bg-gray-100 transition-colors"
      >
         {isHidden ? (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
         ) : (
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>
         )}
         <span className="hidden sm:inline-block">{isHidden ? 'Show balance' : 'Hide balance'}</span>
      </button>
    </div>
  );
}
