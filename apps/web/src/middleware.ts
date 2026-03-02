import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all /admin/* routes — client-side auth check via cookie
  // The JWT is stored in localStorage (client-side), so we use a lightweight
  // cookie flag set on login to gate server-side navigation.
  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.get('dysa-admin-session')
    if (!hasSession) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
