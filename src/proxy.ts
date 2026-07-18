import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { MOCK_PROFILES } from '@/lib/mock-data'

function isMockEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('mockproject.supabase.co') || key === 'mockanonkey'
}

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request)

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Public/Auth routes
  const isAuthRoute = path === '/login' || path === '/signup'
  
  // Dashboard routes
  const isDashboardRoute = 
    path.startsWith('/student') || 
    path.startsWith('/parent') || 
    path.startsWith('/mentor') || 
    path.startsWith('/admin')

  // If accessing the root path, redirect depending on auth state
  if (path === '/') {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    let profile = null
    if (isMockEnv()) {
      profile = MOCK_PROFILES.find((p) => p.id === user.id)
      if (!profile) {
        let role = 'student'
        if (user.id.includes('parent')) role = 'parent'
        if (user.id.includes('mentor')) role = 'mentor'
        if (user.id.includes('admin')) role = 'admin'
        profile = { id: user.id, role }
      }
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    if (profile) {
      url.pathname = `/${profile.role}`
      return NextResponse.redirect(url)
    }
    
    return supabaseResponse
  }

  if (isDashboardRoute) {
    if (!user) {
      // Not logged in, redirect to login
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Retrieve profile to check role
    let profile = null
    if (isMockEnv()) {
      profile = MOCK_PROFILES.find((p) => p.id === user.id)
      if (!profile) {
        let role = 'student'
        if (user.id.includes('parent')) role = 'parent'
        if (user.id.includes('mentor')) role = 'mentor'
        if (user.id.includes('admin')) role = 'admin'
        profile = { id: user.id, role }
      }
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    if (!profile) {
      // No profile found, sign out and redirect to login
      await supabase.auth.signOut()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = profile.role

    // Redirect if they try to access another role's dashboard area
    if (path.startsWith('/student') && role !== 'student') {
      // Allow parents to view student reports and recordings
      const isAllowedParentRoute = role === 'parent' && (path === '/student/reports' || path === '/student/recordings')
      if (!isAllowedParentRoute) {
        url.pathname = `/${role}`
        return NextResponse.redirect(url)
      }
    }
    if (path.startsWith('/parent') && role !== 'parent') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
    if (path.startsWith('/mentor') && role !== 'mentor') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
    if (path.startsWith('/admin') && role !== 'admin') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
  }

  if (isAuthRoute && user) {
    // If user is already logged in, redirect them to their correct role dashboard
    let profile = null
    if (isMockEnv()) {
      profile = MOCK_PROFILES.find((p) => p.id === user.id)
      if (!profile) {
        let role = 'student'
        if (user.id.includes('parent')) role = 'parent'
        if (user.id.includes('mentor')) role = 'mentor'
        if (user.id.includes('admin')) role = 'admin'
        profile = { id: user.id, role }
      }
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    if (profile) {
      url.pathname = `/${profile.role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - style-guide (exclude to allow public access to the style guide)
     * - logo images
     */
    '/((?!_next/static|_next/image|favicon.ico|style-guide|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
