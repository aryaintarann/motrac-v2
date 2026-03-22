'use client'

import { useState } from 'react'
import { createDebt } from '../app/(dashboard)/debts/actions'

export function DebtForm({ accounts }: { accounts: any[] }) {
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState('i_owe')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createDebt(formData)
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
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />

      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400 font-medium">Rp</span>
        <input 
          name="principal" 
          type="number" 
          placeholder="Amount" 
          required
          className="w-full rounded-md border border-gray-200 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-semibold"
        />
      </div>
      
      <select name="account_id" className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-600">
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
          className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
