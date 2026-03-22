'use client'

import { useState } from 'react'
import { createTransaction } from '../app/(dashboard)/transactions/actions'

export function TransactionForm({ accounts, categories }: { accounts: any[], categories: any[] }) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('expense')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createTransaction(formData)
    } catch (e) {
      alert('Failed to log transaction')
    }
    setLoading(false)
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <div className="flex rounded-md bg-gray-200 p-1">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 rounded py-1.5 text-xs font-semibold ${type === 'expense' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 rounded py-1.5 text-xs font-semibold ${type === 'income' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
        >
          Income
        </button>
      </div>
      
      <input type="hidden" name="type" value={type} />

      <input 
        name="amount" 
        type="number" 
        placeholder="Amount" 
        required
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-lg font-semibold"
      />
      
      <select name="account_id" className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" required defaultValue={accounts[0]?.id}>
        <option value="" disabled>Select Account</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>

      <select name="category_id" className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
        <option value="">No Category</option>
        {categories.filter(c => c.type === type).map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <input 
        name="note" 
        placeholder="Note (optional)" 
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />

      <input 
        name="date" 
        type="date" 
        defaultValue={new Date().toISOString().split('T')[0]}
        required
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
      
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 rounded-md bg-[var(--primary)] py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Logging...' : 'Log Transaction'}
      </button>
    </form>
  )
}
