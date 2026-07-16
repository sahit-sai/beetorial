'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { MOCK_PROFILES } from '@/lib/mock-data'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

export async function login(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (isMockEnv()) {
    const profile = MOCK_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase())
    if (!profile) {
      let role: 'student' | 'parent' | 'mentor' | 'admin' = 'student'
      if (email.includes('parent')) role = 'parent'
      if (email.includes('mentor')) role = 'mentor'
      if (email.includes('admin')) role = 'admin'

      const mockId = `${role}-mock-${Date.now()}`
      const cookieStore = await cookies()
      cookieStore.set('sb-mockproject-auth-token', mockId)
      
      revalidatePath('/', 'layout')
      redirect(`/${role}`)
    }

    const cookieStore = await cookies()
    cookieStore.set('sb-mockproject-auth-token', profile.id)
    
    revalidatePath('/', 'layout')
    redirect(`/${profile.role}`)
  }

  // Real Supabase Auth
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  let role = 'student'
  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    if (profile) role = profile.role
  }

  revalidatePath('/', 'layout')
  redirect(`/${role}`)
}

export async function signup(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  if (!email || !password || !fullName || !role) {
    return { error: 'All fields are required.' }
  }

  if (isMockEnv()) {
    const mockId = `${role}-mock-${Date.now()}`
    const cookieStore = await cookies()
    cookieStore.set('sb-mockproject-auth-token', mockId)
    
    revalidatePath('/', 'layout')
    redirect(`/${role}`)
  }

  // Real Supabase Auth
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        role,
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/${role}`)
}

export async function logout() {
  if (isMockEnv()) {
    const cookieStore = await cookies()
    cookieStore.delete('sb-mockproject-auth-token')
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
