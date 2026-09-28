import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ป้องกัน /admin ทุกหน้า ยกเว้น /admin (login)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get('village_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}