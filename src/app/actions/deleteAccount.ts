'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

export async function deleteAccountServerAction(userId: string) {
  // CRITICAL SECURITY: Verify the current user owns the account being deleted
  const supabase = await createServerClient()
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !currentUser) {
    return { success: false, error: "Unauthorized: You must be logged in" }
  }
  
  if (currentUser.id !== userId) {
    return { success: false, error: "Unauthorized: You can only delete your own account" }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    return { success: false, error: "Server Configuration Error: Missing Supabase Admin Keys" }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Delete the user. 
  // Cascading foreign keys in the DB schema will automatically wipe out accounts, transactions, debts, categories, etc.
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    return { success: false, error: "Failed to delete account. Please try again." }
  }

  return { success: true }
}
