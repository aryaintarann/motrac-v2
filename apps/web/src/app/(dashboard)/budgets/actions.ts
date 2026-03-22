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

  // Upsert using month and user_id? 
  // Wait, Supabase upsert requires a unique constraint. We don't have a unique constraint on (user_id, month).
  // Easiest is to check if it exists, then update or insert.
  const { data: existing } = await supabase.from('budgets').select('id').eq('month', month).single()

  if (existing) {
    await supabase.from('budgets').update({
      needs_amount,
      wants_amount,
      savings_amount
    }).eq('id', existing.id)
  } else {
    await supabase.from('budgets').insert({
      user_id: user.id,
      month,
      needs_amount,
      wants_amount,
      savings_amount
    })
  }

  revalidatePath('/budgets')
  revalidatePath('/')
}
