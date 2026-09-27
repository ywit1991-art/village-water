import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get('village_session')?.value
    const session = token ? await verifySession(token) : null

    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}