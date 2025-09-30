import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedAPI =
    (pathname.startsWith('/api/events') && request.method !== 'GET') ||
    (pathname.startsWith('/api/jobs') && request.method !== 'GET')

  if (isAdminRoute || isProtectedAPI) {
    const token = request.cookies.get('auth-token')

    // Simply check if token exists - verification happens in route handlers
    if (!token || !token.value) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/events/:path*',
    '/api/jobs/:path*',
  ],
}