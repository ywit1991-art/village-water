import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const sb = await createClient()
  await sb.auth.signOut()
  return NextResponse.redirect(new URL('/admin', request.url))
}