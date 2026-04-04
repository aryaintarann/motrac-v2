'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const month = formData.get('month') as string
  const needs_amount = Number(formData.get('needs_amount'))
  const wants_amount = Number(formData.get('wants_amount'))
  const savings_amount = Number(formData.get('savings_amount'))
  const debt_amount = Number(formData.get('debt_amount')) || 0

  // SECURITY: Check if budget exists for current user, then update or insert
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .like('month', `${month}%`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('budgets')
      .update({
        needs_amount,
        wants_amount,
        savings_amount,
        debt_amount
      })
      .eq('id', existing.id)
      .eq('user_id', user.id)
  } else {
    await supabase.from('budgets').insert({
      user_id: user.id,
      month,
      needs_amount,
      wants_amount,
      savings_amount,
      debt_amount
    })
  }

  // Check and seed default categories
  const { data: catCheck } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('budget_type', 'needs')
    .limit(1)

  if (!catCheck || catCheck.length === 0) {
    await supabase.from('categories').insert([
      { user_id: user.id, name: 'Needs', icon: '🛒', type: 'expense', is_default: true, budget_type: 'needs' },
      { user_id: user.id, name: 'Wants', icon: '🎬', type: 'expense', is_default: true, budget_type: 'wants' },
      { user_id: user.id, name: 'Savings', icon: '🏦', type: 'expense', is_default: true, budget_type: 'savings' },
      { user_id: user.id, name: 'Income', icon: '💰', type: 'income', is_default: true, budget_type: 'income' }
    ])
  }

  revalidatePath('/budgets')
  revalidatePath('/transactions')
  revalidatePath('/categories')
  revalidatePath('/')
}
