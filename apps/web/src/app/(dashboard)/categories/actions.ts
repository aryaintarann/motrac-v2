'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const parent_id = formData.get('parent_id') as string
  const type = formData.get('type') as string

  if (!name) throw new Error('Name is required')

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    icon: icon || '📁',
    parent_id,
    type,
    is_default: false
  })

  if (error) {
    throw new Error('Failed to create sub-category: ' + error.message)
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return { success: true }
}
