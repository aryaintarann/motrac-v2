'use server'

import { createClient } from '@supabase/supabase-js'

export async function deleteAccountServerAction(userId: string) {
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
    console.error("Failed to delete user", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
