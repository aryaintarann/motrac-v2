'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signupSchema } from '@/lib/validations'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // SECURITY: Validate all inputs with Zod schema
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
  }
  
  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Invalid input'
    redirect(`/signup?error=${encodeURIComponent(errorMessage)}`)
  }
  
  const { email, password, full_name } = result.data
  const next = formData.get('next') as string | null

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  })

  if (error) {
    // SECURITY: Use generic error message to prevent user enumeration
    redirect(`/signup?error=${encodeURIComponent('Registration failed. Please try again.')}`)
  }

  // Sign the user in immediately after signup
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
  if (loginError) {
    redirect(`/signup?error=${encodeURIComponent('Registration successful but login failed. Please try logging in.')}`)
  }
  
  revalidatePath('/dashboard', 'layout')
  
  // Always redirect to dashboard after successful signup
  redirect('/dashboard')
}
