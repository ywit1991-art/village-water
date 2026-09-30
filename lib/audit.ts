'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { SessionData } from '@/lib/auth/session'

function adminSb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

interface LogInput {
  session: SessionData | null
  action: string
  target_type?: string
  target_id?: string | number
  target_label?: string
  metadata?: Record<string, unknown>
}

export async function logAudit({
  session,
  action,
  target_type,
  target_id,
  target_label,
  metadata = {},
}: LogInput) {
  try {
    const h = await headers()
    const ip =
      h.get('x-forwarded-for')?.split(',')[0].trim() ||
      h.get('x-real-ip') ||
      null
    const ua = h.get('user-agent')

    const sb = adminSb()
    await sb.from('audit_log').insert({
      staff_id: session?.id ?? null,
      staff_code: session?.code ?? null,
      staff_name: session?.full_name ?? null,
      action,
      target_type: target_type ?? null,
      target_id: target_id != null ? String(target_id) : null,
      target_label: target_label ?? null,
      metadata,
      ip_address: ip,
      user_agent: ua,
    })
  } catch (err) {
    console.warn('[audit] error:', err)
  }
}