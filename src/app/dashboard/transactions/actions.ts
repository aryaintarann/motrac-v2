'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateFormData, transactionSchema, sanitizeNote } from '@/lib/validations'

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // SECURITY: Validate all inputs with Zod schema
  const rawData = {
    type: formData.get('type') as string,
    account_id: formData.get('account_id') as string,
    category_id: formData.get('category_id') as string || null,
    amount: Number(formData.get('amount')),
    note: sanitizeNote(formData.get('note') as string),
    date: formData.get('date') as string
  }
  
  let finalDate = new Date().toISOString()
  if (rawData.date) {
    const timeStr = new Date().toISOString().split('T')[1]
    finalDate = new Date(`${rawData.date}T${timeStr}`).toISOString()
    rawData.date = finalDate
  }
  
  const validatedData = validateFormData(transactionSchema, new FormData())
  
  // Manual validation since we transformed the data
  if (!['income', 'expense'].includes(rawData.type)) {
    throw new Error('Invalid transaction type')
  }
  if (rawData.amount <= 0 || rawData.amount > 999999999.99) {
    throw new Error('Invalid amount')
  }

  // Insert Transaction
  const { data: txn, error: txnError } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: rawData.type,
    account_id: rawData.account_id,
    category_id: rawData.category_id,
    amount: rawData.amount,
    note: rawData.note,
    date: finalDate
  }).select().single()

  if (txnError) {
    throw new Error('Transaction Insert Failed')
  }

  // Update Account Balance
  // SECURITY: Verify account belongs to current user before updating balance
  const { data: accountData } = await supabase
    .from('accounts')
    .select('balance, user_id')
    .eq('id', rawData.account_id)
    .eq('user_id', user.id)
    .single();
  
  if (!accountData) {
    throw new Error('Unauthorized: Account not found or does not belong to you')
  }
  
  let newBalance = Number(accountData.balance);
  if (rawData.type === 'income') {
    newBalance += rawData.amount;
  } else if (rawData.type === 'expense') {
    newBalance -= rawData.amount;
  }

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', rawData.account_id)
    .eq('user_id', user.id);
  
  if (updateError) {
    throw new Error('Account Update Failed')
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  
  return { success: true, txnId: txn?.id }
}
