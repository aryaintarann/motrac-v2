'use client'

import { useState, useMemo } from 'react'

export function ReportTable({ txns, categories }: { txns: any[], categories: any[] }) {
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  const filteredTxns = useMemo(() => {
    return txns.filter(txn => {
      const displayNote = txn.note || 'No note'
      const catName = categories?.find(c => c.id === txn.category_id)?.name || 'Uncategorized'
      
      const matchSearch = displayNote.toLowerCase().includes(search.toLowerCase()) || 
                          catName.toLowerCase().includes(search.toLowerCase())
      
      if (!matchSearch) return false

      const d = new Date(txn.date)
      const year = d.getFullYear().toString()
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const date = d.getDate().toString().padStart(2, '0')

      if (filterYear && filterYear !== year) return false
      if (filterMonth && filterMonth !== month) return false

      return true
    })
  }, [txns, categories, search, filterMonth, filterYear])

  // Unique years for the dropdown
  const availableYears = useMemo(() => {
    const years = new Set(txns.map(t => new Date(t.date).getFullYear().toString()))
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [txns])

  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm mb-8 print:border-none print:shadow-none print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <h3 className="font-bold text-[#0f172a] text-[18px]">Detailed Log</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search note or category..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
          
          <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Months</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Years</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#F8FAFC] text-[#475569] border-y border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[11px] rounded-tl-lg">Date</th>
              <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[11px]">Note / Category</th>
              <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[11px]">Type</th>
              <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[11px] text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {filteredTxns.slice(0, 100).map(txn => {
              const isIncome = txn.type === 'income'
              const displayNote = txn.note || 'No note'
              const catName = categories?.find(c => c.id === txn.category_id)?.name || 'Uncategorized'
              return (
                <tr key={txn.id} className="hover:bg-[#F8FAFC] transition-colors print:break-inside-avoid">
                  <td className="px-4 py-4 whitespace-nowrap text-[#64748b] font-medium">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-[#0f172a]">{displayNote}</div>
                    <div className="text-[12px] text-[#64748b] mt-0.5">{catName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${isIncome ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>
                      {txn.type.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-right font-bold whitespace-nowrap text-[15px] ${isIncome ? 'text-[#16A34A]' : 'text-[#0f172a]'}`}>
                    {isIncome ? '+' : '-'}{formatter.format(Number(txn.amount)).replace('Rp', '').trim()} <span className="text-[#64748b] text-[12px] font-medium">IDR</span>
                  </td>
                </tr>
              )
            })}
            {filteredTxns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#64748b] text-[13px]">No transactions found for the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
