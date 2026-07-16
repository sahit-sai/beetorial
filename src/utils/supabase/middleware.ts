import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (isMockEnv()) {
    const mockId = request.cookies.get('sb-mockproject-auth-token')?.value
    const user = mockId ? { id: mockId, email: `${mockId}@beetorial.com` } : null
    return { supabase, supabaseResponse, user }
  }

  // This will refresh the session if it's expired (necessary for Supabase)
  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, supabaseResponse, user }
}
