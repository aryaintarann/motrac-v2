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

  // SECURITY: If parent_id is provided, verify it belongs to current user
  if (parent_id) {
    const { data: parent } = await supabase
      .from('categories')
      .select('id')
      .eq('id', parent_id)
      .eq('user_id', user.id)
      .single()
    
    if (!parent) {
      throw new Error('Unauthorized: Parent category not found or does not belong to you')
    }
  }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    icon: icon || '📁',
    parent_id,
    type,
    is_default: false
  })

  if (error) {
    throw new Error('Failed to create sub-category')
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return { success: true }
}
