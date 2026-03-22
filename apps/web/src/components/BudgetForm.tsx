'use client'

import { useState } from 'react'
import { upsertBudget } from '../app/(dashboard)/budgets/actions'
import { generateSmartAllocation } from '../app/(dashboard)/budgets/actions/generateSmartAllocation'

type Allocation = {
  needs: number,
  wants: number,
  savings: number,
  debt: number,
  reason: string
}

export function BudgetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [income, setIncome] = useState<number>(0)

  const [allocation, setAllocation] = useState<Allocation | null>(null)

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  async function handleGenerateAI() {
    if (income <= 0) return;
    setIsGenerating(true)
    const result = await generateSmartAllocation(income)
    if (result.success && result.allocation) {
      setAllocation(result.allocation)
    } else {
      alert(result.error || 'Failed to generate allocation from AI')
    }
    setIsGenerating(false)
  }

  async function onSubmit(formData: FormData) {
    if (!allocation) {
      alert('Please generate an AI allocation first.')
      return
    }

    // Create new FormData with explicitly set amounts
    const finalData = new FormData()
    finalData.set('month', currentMonth)
    finalData.set('needs_amount', allocation.needs.toString())
    finalData.set('wants_amount', allocation.wants.toString())
    finalData.set('savings_amount', allocation.savings.toString())
    finalData.set('debt_amount', allocation.debt.toString())

    setLoading(true)
    try {
      await upsertBudget(finalData)
      onSuccess?.()
    } catch (e) {
      alert('Failed to save budget')
    }
    setLoading(false)
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 text-[var(--foreground)]">

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Monthly Income</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-md border border-gray-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)]">
            <span className="pl-3 pr-1 text-gray-500 font-semibold text-sm">Rp</span>
            <input
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(Number(e.target.value))}
              required
              placeholder="e.g. 10000000"
              className="w-full bg-transparent text-gray-900 placeholder:text-gray-300 px-2 py-2 text-[15px] focus:outline-none font-semibold"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={income <= 0 || isGenerating}
            className="rounded-md bg-blue-50 text-blue-600 px-4 py-2 text-sm font-bold border border-blue-200 hover:bg-blue-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isGenerating ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
        {!allocation && (
          <p className="text-xs text-gray-500 mt-1">Input your expected monthly salary to get an AI-recommended breakdown.</p>
        )}
      </div>

      {allocation && (
        <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-[var(--primary)]">Gemini AI Recommendation</span>
          </div>

          <p className="text-[13px] text-gray-600 italic mb-4 leading-relaxed">
            "{allocation.reason}"
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Needs ({((allocation.needs / income) * 100).toFixed(0)}%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(allocation.needs)}</span>
            </div>
            <div className="relative w-full h-2 bg-white rounded-full overflow-hidden shadow-inner flex">
              <div className="h-full bg-blue-500" style={{ width: `${(allocation.needs / income) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Wants ({((allocation.wants / income) * 100).toFixed(0)}%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(allocation.wants)}</span>
            </div>
            <div className="relative w-full h-2 bg-white rounded-full overflow-hidden shadow-inner flex">
              <div className="h-full bg-purple-500" style={{ width: `${(allocation.wants / income) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Savings ({((allocation.savings / income) * 100).toFixed(0)}%)</span>
              <span className="font-semibold text-gray-900">{formatter.format(allocation.savings)}</span>
            </div>
            <div className="relative w-full h-2 bg-white rounded-full overflow-hidden shadow-inner flex">
              <div className="h-full bg-green-500" style={{ width: `${(allocation.savings / income) * 100}%` }} />
            </div>

            {allocation.debt > 0 && (
              <>
                <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-blue-100">
                  <span className="font-medium text-red-600">Debt Reserve ({((allocation.debt / income) * 100).toFixed(0)}%)</span>
                  <span className="font-semibold text-red-600">{formatter.format(allocation.debt)}</span>
                </div>
                <div className="relative w-full h-2 bg-white rounded-full overflow-hidden shadow-inner flex">
                  <div className="h-full bg-red-400" style={{ width: `${(allocation.debt / income) * 100}%` }} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !allocation}
        className="mt-4 rounded-md bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Saving Budget...' : 'Save AI Recommended Budget'}
      </button>
    </form>
  )
}
