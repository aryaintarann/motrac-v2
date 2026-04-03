'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const next = formData.get('next') as string | null

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (error) {
    const redirectUrl = next 
      ? `/signup?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
      : `/signup?error=${encodeURIComponent(error.message)}`
    redirect(redirectUrl)
  }

  // Sign the user in immediately after signup
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
  if (loginError) {
    const redirectUrl = next 
      ? `/signup?error=${encodeURIComponent(loginError.message)}&next=${encodeURIComponent(next)}`
      : `/signup?error=${encodeURIComponent(loginError.message)}`
    redirect(redirectUrl)
  }

  console.log('Signup success - Next param:', next)
  
  revalidatePath('/dashboard', 'layout')
  
  // Always redirect to dashboard after successful signup
  redirect('/dashboard')
}
