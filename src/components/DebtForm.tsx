'use client'

import { useState } from 'react'
import { createDebt } from '../app/dashboard/debts/actions'

export function DebtForm({ accounts, onSuccess }: { accounts: any[], onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState('i_owe')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createDebt(formData)
      onSuccess?.()
    } catch (e) {
      alert('Failed to log debt')
    }
    setLoading(false)
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 text-[var(--foreground)]">
      <div className="flex rounded-md bg-gray-200 p-1">
        <button
          type="button"
          onClick={() => setDirection('i_owe')}
          className={`flex-1 rounded py-1.5 text-xs font-semibold ${direction === 'i_owe' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          I Borrowed (Debt)
        </button>
        <button
          type="button"
          onClick={() => setDirection('owed_to_me')}
          className={`flex-1 rounded py-1.5 text-xs font-semibold ${direction === 'owed_to_me' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          I Lent (Receivable)
        </button>
      </div>
      
      <input type="hidden" name="direction" value={direction} />

      <input 
        name="counterparty" 
        placeholder={direction === 'i_owe' ? "Who did you borrow from?" : "Who did you lend to?"}
        required
        className="bg-white text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />

      <div className="flex items-center w-full rounded-md border border-gray-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)]">
        <span className="pl-3 pr-1 text-gray-500 font-semibold text-sm">Rp</span>
        <input 
          name="principal" 
          type="number" 
          placeholder="Amount" 
          required
          className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 px-2 py-2 text-sm focus:outline-none font-semibold"
        />
      </div>
      
      <select name="account_id" className="bg-white text-gray-900 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
        <option value="">No Account (Don't adjust balance)</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Due Date (Optional)</label>
        <input 
          name="due_date" 
          type="date" 
          className="bg-white text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 rounded-md bg-[var(--primary)] py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Saving...' : 'Save Record'}
      </button>
    </form>
  )
}
