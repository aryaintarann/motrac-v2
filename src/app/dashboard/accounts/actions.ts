'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizeString } from '@/lib/validations'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // SECURITY: Validate and sanitize inputs
  const name = sanitizeString(formData.get('name') as string)
  const type = formData.get('type') as string
  const balance = Number(formData.get('balance'))
  const icon = formData.get('icon') as string
  const color = formData.get('color') as string

  // Validation
  if (!name || name.length < 1 || name.length > 100) {
    throw new Error('Invalid account name')
  }
  
  if (!['cash', 'bank', 'e-wallet'].includes(type)) {
    throw new Error('Invalid account type')
  }
  
  if (isNaN(balance) || balance < 0 || balance > 999999999.99) {
    throw new Error('Invalid balance amount')
  }
  
  // Validate color format (hex color)
  const colorRegex = /^#[0-9A-Fa-f]{6}$/
  const safeColor = colorRegex.test(color) ? color : '#1A6FD6'

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type,
    balance,
    icon: icon || '🏦',
    color: safeColor,
    include_in_net_worth: true,
  })

  if (error) {
    throw new Error('Failed to create account')
  }

  revalidatePath('/accounts')
  revalidatePath('/')
}
