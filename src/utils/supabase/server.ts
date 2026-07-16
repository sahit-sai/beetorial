import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  if (isMockEnv()) {
    // Intercept client auth calls to support seamless testing locally
    const authOverride = {
      ...client.auth,
      getUser: async () => {
        const mockId = cookieStore.get('sb-mockproject-auth-token')?.value
        if (mockId) {
          return { data: { user: { id: mockId, email: `${mockId}@beetorial.com` } }, error: null }
        }
        return { data: { user: null }, error: null }
      },
      signOut: async () => {
        cookieStore.delete('sb-mockproject-auth-token')
        return { error: null }
      }
    }
    
    Object.defineProperty(client, 'auth', {
      value: authOverride,
      writable: true,
      configurable: true
    })
  }

  return client
}
