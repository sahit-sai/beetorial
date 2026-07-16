import { createBrowserClient } from '@supabase/ssr'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (isMockEnv()) {
    const authOverride = {
      ...client.auth,
      getUser: async () => {
        const mockId = getCookie('sb-mockproject-auth-token')
        if (mockId) {
          return { data: { user: { id: mockId, email: `${mockId}@beetorial.com` } }, error: null }
        }
        return { data: { user: null }, error: null }
      },
      signOut: async () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'sb-mockproject-auth-token=; Max-Age=0; path=/'
        }
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
