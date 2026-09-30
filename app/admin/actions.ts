'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSession, clearSession, SESSION_COOKIE } from '@/lib/auth/session'

function adminSb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ========================================
// Login
// ========================================
export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const code = (formData.get('code') as string)?.replace(/\D/g, '')

  if (!code || code.length !== 10) {
    return { error: 'กรุณากรอกเลข 10 หลัก' }
  }

  const sb = adminSb()
  const { data: staff, error } = await sb
    .from('staff')
    .select('id, code, full_name, role, is_active')
    .eq('code', code)
    .single()

  if (error || !staff) {
    return { error: 'ไม่พบเลขนี้ในข้อมูล' }
  }
  if (!staff.is_active) {
    return { error: 'บัญชีนี้ถูกระงับการใช้งาน' }
  }

  const token = await createSession({
    id: staff.id,
    code: staff.code,
    full_name: staff.full_name,
    role: staff.role,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin/dashboard')
}

// ========================================
// Logout
// ========================================
export async function logoutAction() {
  await clearSession()
  redirect('/admin')
}

// ========================================
// สร้าง water_system ใหม่
// ========================================
export async function createWaterSystemAction(
  _prev: { error?: string; id?: number } | null,
  formData: FormData,
): Promise<{ error?: string; id?: number }> {
  const villageId = Number(formData.get('village_id'))
  const systemName = (formData.get('system_name') as string)?.trim()
  const lat = formData.get('lat') ? Number(formData.get('lat')) : null
  const lng = formData.get('lng') ? Number(formData.get('lng')) : null

  if (!villageId) return { error: 'ไม่พบหมู่บ้าน' }
  if (!systemName) return { error: 'กรุณากรอกชื่อข้อมูล' }

  const sb = adminSb()

  // หา system_no ถัดไป
  const { data: existing } = await sb
    .from('water_systems')
    .select('system_no')
    .eq('village_id', villageId)
    .order('system_no', { ascending: false })
    .limit(1)

  const nextNo = (existing?.[0]?.system_no ?? 0) + 1

  const { data, error } = await sb
    .from('water_systems')
    .insert({
      village_id: villageId,
      system_no: nextNo,
      system_name: systemName,
      lat,
      lng,
      status: 'active',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'สร้างไม่สำเร็จ' }
  }

  revalidatePath('/admin/dashboard')
  return { id: data.id }
}

// ========================================
// อัปเดต water_system
// ========================================
export async function updateWaterSystemAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const id = Number(formData.get('id'))
  const systemName = (formData.get('system_name') as string)?.trim()
  const lat = formData.get('lat') ? Number(formData.get('lat')) : null
  const lng = formData.get('lng') ? Number(formData.get('lng')) : null

  if (!id) return { error: 'ไม่พบ id' }
  if (!systemName) return { error: 'กรุณากรอกชื่อข้อมูล' }

  const sb = adminSb()
  const { error } = await sb
    .from('water_systems')
    .update({
      system_name: systemName,
      lat,
      lng,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/dashboard')
  revalidatePath('/villages')
  revalidatePath('/')

  return { ok: true }
}

// ========================================
// ลบ water_system
// ========================================
export async function deleteWaterSystemAction(id: number) {
  const sb = adminSb()
  await sb.from('water_systems').delete().eq('id', id)
  revalidatePath('/admin/dashboard')
}