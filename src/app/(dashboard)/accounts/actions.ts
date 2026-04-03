'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const balance = formData.get('balance') as string
  const icon = formData.get('icon') as string
  const color = formData.get('color') as string

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type,
    balance: Number(balance),
    icon: icon || '🏦',
    color: color || '#1A6FD6',
    include_in_net_worth: true,
  })

  if (error) {
    console.error('Error creating account:', error)
    throw new Error('Failed to create account')
  }

  revalidatePath('/accounts')
  revalidatePath('/')
}
