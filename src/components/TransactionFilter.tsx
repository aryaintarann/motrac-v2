'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function TransactionFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter') || 'all'

  return (
    <div className="relative">
      <select 
        value={currentFilter}
        onChange={(e) => router.push(`/?filter=${e.target.value}`)}
        className="appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 pr-8 text-[13px] md:text-[14px] font-semibold text-[#475569] hover:bg-gray-50 shadow-sm transition-colors outline-none cursor-pointer"
      >
        <option value="all">All Transactions</option>
        <option value="income">Income Only</option>
        <option value="expense">Expense Only</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
  )
}
