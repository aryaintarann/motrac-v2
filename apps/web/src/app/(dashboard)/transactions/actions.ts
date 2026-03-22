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
  const note = formData.get('note') as string
  const rawDate = formData.get('date') as string
  
  let finalDate = new Date().toISOString()
  if (rawDate) {
    const timeStr = new Date().toISOString().split('T')[1]
    finalDate = new Date(`${rawDate}T${timeStr}`).toISOString()
  }

  // Insert Transaction
  const { data: txn, error: txnError } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    account_id,
    category_id: category_id || null,
    amount,
    note: note || null,
    date: finalDate
  }).select().single()

  if (txnError) {
    console.error('Error creating transaction:', txnError)
    throw new Error('Transaction Insert Failed: ' + txnError.message)
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

    const { error: updateError } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', account_id);
    if (updateError) {
      console.error('Error updating account:', updateError)
      throw new Error('Account Update Failed: ' + updateError.message)
    }
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  
  return { success: true, txnId: txn?.id }
}
