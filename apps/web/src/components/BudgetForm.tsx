'use client'

import { useState } from 'react'
import { upsertBudget } from '../app/(dashboard)/budgets/actions'

export function BudgetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [income, setIncome] = useState<number>(10000000)
  
  const needs = income * 0.5
  const wants = income * 0.3
  const savings = income * 0.2
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await upsertBudget(formData)
      onSuccess?.()
    } catch (e) {
      alert('Failed to save budget')
    }
    setLoading(false)
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 text-[var(--foreground)]">
      <input type="hidden" name="month" value={currentMonth} />
      <input type="hidden" name="needs_amount" value={needs} />
      <input type="hidden" name="wants_amount" value={wants} />
      <input type="hidden" name="savings_amount" value={savings} />
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Monthly Income</label>
        <div className="flex items-center w-full rounded-md border border-gray-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)]">
          <span className="pl-3 pr-1 text-gray-500 font-semibold text-sm">Rp</span>
          <input 
            type="number" 
            value={income || ''}
            onChange={(e) => setIncome(Number(e.target.value))}
            required
            className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 px-2 py-2 text-[15px] focus:outline-none font-semibold"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Input your expected monthly salary to get an AI-recommended breakdown.</p>
      </div>

      {income > 0 && (
        <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-[var(--primary)]">Smart 50/30/20 Allocation</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Needs (50%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(needs)}</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: '50%' }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Wants (30%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(wants)}</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: '30%' }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Savings & Debt (20%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(savings)}</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading || income <= 0}
        className="mt-4 rounded-md bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Analyzing & Saving...' : 'Save AI Recommended Budget'}
      </button>
    </form>
  )
}
