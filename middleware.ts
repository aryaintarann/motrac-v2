import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // SECURITY: CSRF Protection - Verify Origin header for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow same-origin requests
    if (origin) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json(
          { error: 'CSRF validation failed: Invalid origin' },
          { status: 403 }
        )
      }
    }
    
    // Verify referer as additional protection
    const referer = request.headers.get('referer')
    if (referer) {
      const refererHost = new URL(referer).host
      if (refererHost !== host) {
        return NextResponse.json(
          { error: 'CSRF validation failed: Invalid referer' },
          { status: 403 }
        )
      }
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\.(?:svg|png|jpg|jpeg|gif|webp)$ (image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}