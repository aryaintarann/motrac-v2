'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDebt(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const direction = formData.get('direction') as string
  const counterparty = formData.get('counterparty') as string
  const principal = Number(formData.get('principal'))
  const due_date = formData.get('due_date') as string
  const account_id = formData.get('account_id') as string // which account the money came from/went to

  // Insert Debt record
  const { error: debtError } = await supabase.from('debts').insert({
    user_id: user.id,
    direction,
    counterparty,
    principal,
    due_date: due_date || null,
    account_id: account_id || null,
  })

  if (debtError) {
    console.error('Error creating debt:', debtError)
    throw new Error('Failed to create debt')
  }

  // Auto-adjust balance and log transaction if account_id is provided
  if (account_id) {
    // If "I Owe", someone gave me money (Income)
    // If "Owed to Me", I gave someone money (Expense)
    const txnType = direction === 'i_owe' ? 'income' : 'expense'
    const note = direction === 'i_owe' ? `Borrowed from ${counterparty}` : `Lent to ${counterparty}`
    
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: txnType,
      account_id,
      amount: principal,
      note,
      date: new Date().toISOString()
    })

    const { data: accountData } = await supabase.from('accounts').select('balance').eq('id', account_id).single()
    if (accountData) {
      let newBalance = Number(accountData.balance)
      if (txnType === 'income') newBalance += principal
      else newBalance -= principal
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', account_id)
    }
  }

  revalidatePath('/debts')
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function markDebtPaid(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const debt_id = formData.get('debt_id') as string

  // Fetch the debt first to know how to balance the account
  const { data: debt } = await supabase.from('debts').select('*').eq('id', debt_id).single()
  if (!debt) return

  // Delete the debt
  await supabase.from('debts').delete().eq('id', debt_id)

  // Auto-adjust balance and log transaction if account_id is provided
  if (debt.account_id) {
    // Reverse the initial transaction effect
    // If "I Owe", I am paying them back (Expense)
    // If "Owed to Me", they are paying me back (Income)
    const txnType = debt.direction === 'i_owe' ? 'expense' : 'income'
    const note = debt.direction === 'i_owe' ? `Repaid borrowed money to ${debt.counterparty}` : `Received repayment from ${debt.counterparty}`
    
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: txnType,
      account_id: debt.account_id,
      amount: debt.principal,
      note,
      date: new Date().toISOString()
    })

    const { data: accountData } = await supabase.from('accounts').select('balance').eq('id', debt.account_id).single()
    if (accountData) {
      let newBalance = Number(accountData.balance)
      if (txnType === 'income') newBalance += Number(debt.principal)
      else newBalance -= Number(debt.principal)
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', debt.account_id)
    }
  }

  revalidatePath('/debts')
  revalidatePath('/transactions')
  revalidatePath('/')
}
