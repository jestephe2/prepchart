import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getOnboardingState } from '@/lib/profiles'

const PUBLIC_PATHS = ['/login', '/auth/callback', '/share']
// Page navigations to /welcome are the wizard itself; all /api/* routes
// must be allowed through so the wizard's forms can hit the existing
// JSON endpoints. The auth check above still rejects unauthenticated
// API requests with the normal /login redirect; only the onboarding
// gate is short-circuited here.
const ONBOARDING_PATHS = ['/welcome', '/api']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const isOnboarding = ONBOARDING_PATHS.some((path) => pathname.startsWith(path))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Onboarding gate: authenticated users with onboarding_complete=false get
  // redirected to /welcome/surgeon, except when already on /welcome/* or
  // /api/onboarding/*, or on a public path. Fail open on DB errors — we'd
  // rather let an un-onboarded user slip past than block the whole app for
  // every user during a transient DB issue.
  if (user && !isPublic && !isOnboarding) {
    try {
      const { complete } = await getOnboardingState(supabase, user.id)
      if (!complete) {
        const url = request.nextUrl.clone()
        url.pathname = '/welcome/surgeon'
        url.search = ''
        return NextResponse.redirect(url)
      }
    } catch (err) {
      console.error('Onboarding gate failed open:', err)
    }
  }

  return supabaseResponse
}
