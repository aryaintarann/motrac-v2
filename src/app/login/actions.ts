'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { validateFormData, loginSchema, signupSchema } from '@/lib/validations'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // SECURITY: Validate input with Zod schema
  const validatedData = validateFormData(loginSchema, formData)

  const { error } = await supabase.auth.signInWithPassword(validatedData)

  if (error) {
    const next = formData.get('next') as string | null
    // SECURITY: Use generic error message to prevent user enumeration
    const errorMessage = 'Invalid email or password'
    const redirectUrl = next 
      ? `/login?error=${encodeURIComponent(errorMessage)}&next=${encodeURIComponent(next)}`
      : `/login?error=${encodeURIComponent(errorMessage)}`
    redirect(redirectUrl)
  }

  const next = formData.get('next') as string | null
  
  revalidatePath('/dashboard', 'layout')
  
  // Always redirect to dashboard after successful login
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // SECURITY: Validate input with strong password requirements
  const validatedData = validateFormData(signupSchema, formData)

  const { error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
  })

  if (error) {
    // SECURITY: Use generic error message
    redirect(`/login?error=${encodeURIComponent('Registration failed. Please try again.')}`)
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
