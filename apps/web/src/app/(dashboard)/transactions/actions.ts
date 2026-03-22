'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const type = formData.get('type') as string
  const account_id = formData.get('account_id') as string
  const category_id = formData.get('category_id') as string // optional
  const amount = Number(formData.get('amount'))
  const description = formData.get('description') as string
  const date = formData.get('date') as string

  // Insert Transaction
  const { error: txnError } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    account_id,
    category_id: category_id || null,
    amount,
    description: description || null,
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  })

  if (txnError) {
    console.error('Error creating transaction:', txnError)
    throw new Error('Failed to create transaction')
  }

  // Update Account Balance
  const { data: accountData } = await supabase.from('accounts').select('balance').eq('id', account_id).single();
  if (accountData) {
    let newBalance = Number(accountData.balance);
    if (type === 'income') {
      newBalance += amount;
    } else if (type === 'expense') {
      newBalance -= amount;
    }

    await supabase.from('accounts').update({ balance: newBalance }).eq('id', account_id);
  }

  revalidatePath('/transactions')
  revalidatePath('/')
}
