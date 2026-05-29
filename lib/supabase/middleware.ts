import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getOnboardingState } from '@/lib/profiles'

// /api/webhooks is allowed unauthenticated because Stripe authenticates via
// signature verification inside the route, not via a Supabase session cookie.
// Without this, the middleware 307s the webhook to /login and Stripe never
// reaches the handler.
const STANDARD_PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/update-password',
  '/auth/callback',
  '/auth/confirm',
  '/share',
  '/api/webhooks',
]

// Pages an already-authenticated user should be bounced away from. Honors
// the ?redirect= query param before falling back to /, so the share-claim
// flow works when a user is already logged in.
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/update-password']
// Page navigations to /welcome are the wizard itself; all /api/* routes
// must be allowed through so the wizard's forms can hit the existing
// JSON endpoints. The auth check below still rejects unauthenticated
// API requests with the normal /login redirect; only the onboarding
// gate is short-circuited here.
const ONBOARDING_BYPASS_PATHS = ['/welcome', '/api']

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

  // Auth gate: paths where an unauthenticated visitor is allowed through.
  // Exact match only — do NOT change to startsWith('/').
  // startsWith('/') matches every path in the app and breaks the entire auth gate.
  const isUnauthAllowed =
    pathname === '/' ||
    STANDARD_PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Onboarding gate bypass: paths where the onboarding-complete check is skipped.
  // Note: `/` is intentionally NOT here. An onboarded user lands on the dashboard;
  // an incomplete-onboarding user still gets bounced to /welcome/surgeon.
  const isOnboardingBypass =
    STANDARD_PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    ONBOARDING_BYPASS_PATHS.some((path) => pathname.startsWith(path))

  if (!user && !isUnauthAllowed) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    // Only honor same-origin path redirects (must start with '/' but not '//').
    const safeRedirect =
      redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : '/'
    return NextResponse.redirect(new URL(safeRedirect, request.url))
  }

  // Onboarding gate: authenticated users with onboarding_complete=false get
  // redirected to /welcome/surgeon. Fail open on DB errors — we'd rather let
  // an un-onboarded user slip past than block the whole app for every user
  // during a transient DB issue.
  if (user && !isOnboardingBypass) {
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
