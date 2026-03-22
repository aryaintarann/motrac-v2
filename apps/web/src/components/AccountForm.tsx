'use client'

import { useState } from 'react'
import { createAccount } from '../app/(dashboard)/accounts/actions'

export function AccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createAccount(formData)
      onSuccess?.()
    } catch (e) {
      alert('Failed to create account')
    }
    setLoading(false)
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <input 
        name="name" 
        placeholder="Account Name (e.g. BCA)" 
        required 
        className="bg-white text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
      
      <select name="type" className="bg-white text-gray-900 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" required>
        <option value="bank">Bank</option>
        <option value="e_wallet">E-Wallet</option>
        <option value="cash">Cash</option>
        <option value="investment">Investment</option>
        <option value="credit">Credit Card</option>
      </select>
      
      <div className="flex items-center w-full rounded-md border border-gray-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)]">
        <span className="pl-3 pr-1 text-gray-500 font-semibold text-sm">Rp</span>
        <input 
          name="balance" 
          type="number" 
          placeholder="Initial Balance" 
          required
          className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 px-2 py-2 text-[15px] focus:outline-none font-semibold"
        />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select 
            name="icon" 
            className="w-full appearance-none rounded-md border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-900 cursor-pointer"
            defaultValue="🏦"
          >
            <option value="🏦">🏦 Bank</option>
            <option value="💳">💳 Credit Card</option>
            <option value="💸">💸 Cash</option>
            <option value="📱">📱 E-Wallet</option>
            <option value="📈">📈 Investment</option>
            <option value="🪙">🪙 Crypto</option>
            <option value="💰">💰 Savings</option>
            <option value="💼">💼 Business</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
          </div>
        </div>
        <input 
          name="color" 
          type="color" 
          defaultValue="#1A6FD6"
          className="h-9 w-12 rounded-md border border-gray-200 p-1"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 rounded-md bg-[var(--primary)] py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Adding...' : 'Add Account'}
      </button>
    </form>
  )
}
