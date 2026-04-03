'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    const next = formData.get('next') as string | null
    const redirectUrl = next 
      ? `/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
      : `/login?error=${encodeURIComponent(error.message)}`
    redirect(redirectUrl)
  }

  const next = formData.get('next') as string | null
  
  revalidatePath('/dashboard', 'layout')
  
  // Always redirect to dashboard after successful login
  // Don't preserve hash fragments - user should go to dashboard
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
