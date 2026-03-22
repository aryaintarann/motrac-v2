'use client'

import { useState } from 'react'
import { createAccount } from '../app/(dashboard)/accounts/actions'

export function AccountForm() {
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createAccount(formData)
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
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
      
      <select name="type" className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" required>
        <option value="bank">Bank</option>
        <option value="e_wallet">E-Wallet</option>
        <option value="cash">Cash</option>
        <option value="investment">Investment</option>
        <option value="credit">Credit Card</option>
      </select>
      
      <input 
        name="balance" 
        type="number" 
        placeholder="Initial Balance" 
        required
        className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
      
      <div className="flex gap-2">
        <input 
          name="icon" 
          placeholder="Icon (e.g. 🏦)" 
          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
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
