'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSession, clearSession, SESSION_COOKIE } from '@/lib/auth/session'
import { getSession } from '@/lib/auth/session'
import { logAudit } from '@/lib/audit'

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
    .select('id, code, full_name, role, village_id, is_active')
    .eq('code', code)
    .single()

  if (error || !staff) {
    return { error: 'ไม่พบเลขนี้ในระบบ' }
  }
  if (!staff.is_active) {
    return { error: 'บัญชีนี้ถูกระงับการใช้งาน' }
  }

  // ⚡ ดึง systems ที่ operator ดูแล
  let systemIds: number[] = []
  if (staff.role === 'operator') {
    const { data: ops } = await sb
      .from('operator_systems')
      .select('water_system_id')
      .eq('staff_id', staff.id)
    systemIds = (ops ?? []).map(o => o.water_system_id)
  }

  const token = await createSession({
    id: staff.id,
    code: staff.code,
    full_name: staff.full_name,
    role: staff.role ?? 'staff',
    village_id: staff.village_id ?? null,
    system_ids: systemIds,
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

// ========================================
// สร้างเจ้าหน้าที่ใหม่ (super_admin only)
// ========================================
export async function createStaffAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession()
  if (session?.role !== 'super_admin') {
    return { error: 'ไม่มีสิทธิ์' }
  }

  const code = (formData.get('code') as string)?.replace(/\D/g, '')
  const fullName = (formData.get('full_name') as string)?.trim()
  const role = formData.get('role') as string
  const villageId = formData.get('village_id')
    ? Number(formData.get('village_id'))
    : null
  const systemIdsRaw = formData.get('system_ids') as string
  const systemIds = systemIdsRaw
    ? systemIdsRaw.split(',').map(Number).filter(n => !isNaN(n))
    : []

  if (!code || code.length !== 10) return { error: 'เลขต้องเป็น 10 หลัก' }
  if (!fullName) return { error: 'กรุณากรอกชื่อ' }
  if (!['super_admin', 'staff', 'village_head', 'operator'].includes(role)) {
    return { error: 'role ไม่ถูกต้อง' }
  }

  const sb = adminSb()

  const { data: newStaff, error } = await sb
    .from('staff')
    .insert({
      code,
      full_name: fullName,
      role,
      village_id: role === 'village_head' ? villageId : null,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !newStaff) {
    if (error?.code === '23505') return { error: 'เลขนี้มีอยู่แล้ว' }
    return { error: error?.message ?? 'สร้างไม่สำเร็จ' }
  }

  // ถ้าเป็น operator → เพิ่ม systems
  if (role === 'operator' && systemIds.length > 0) {
    await sb.from('operator_systems').insert(
      systemIds.map(sid => ({
        staff_id: newStaff.id,
        water_system_id: sid,
      })),
    )
  }

  await logAudit({
    session,
    action: 'create_staff',
    target_type: 'staff',
    target_id: newStaff.id,
    target_label: `${fullName} (${code})`,
    metadata: { role, villageId, systemIds },
  })

  revalidatePath('/admin/staff')
  return { ok: true }
}

// ========================================
// อัปเดตเจ้าหน้าที่
// ========================================
export async function updateStaffAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession()
  if (session?.role !== 'super_admin') return { error: 'ไม่มีสิทธิ์' }

  const id = Number(formData.get('id'))
  const fullName = (formData.get('full_name') as string)?.trim()
  const role = formData.get('role') as string
  const isActive = formData.get('is_active') === 'true'
  const villageId = formData.get('village_id')
    ? Number(formData.get('village_id'))
    : null
  const systemIdsRaw = formData.get('system_ids') as string
  const systemIds = systemIdsRaw
    ? systemIdsRaw.split(',').map(Number).filter(n => !isNaN(n))
    : []

  if (!id) return { error: 'ไม่พบ id' }

  const sb = adminSb()

  const { error } = await sb
    .from('staff')
    .update({
      full_name: fullName,
      role,
      is_active: isActive,
      village_id: role === 'village_head' ? villageId : null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  // อัปเดต systems ของ operator
  if (role === 'operator') {
    await sb.from('operator_systems').delete().eq('staff_id', id)
    if (systemIds.length > 0) {
      await sb.from('operator_systems').insert(
        systemIds.map(sid => ({
          staff_id: id,
          water_system_id: sid,
        })),
      )
    }
  } else {
    await sb.from('operator_systems').delete().eq('staff_id', id)
  }

  await logAudit({
    session,
    action: 'update_staff',
    target_type: 'staff',
    target_id: id,
    target_label: fullName,
    metadata: { role, isActive, villageId, systemIds },
  })

  revalidatePath('/admin/staff')
  return { ok: true }
}

// ========================================
// ลบเจ้าหน้าที่
// ========================================
export async function deleteStaffAction(id: number) {
  const session = await getSession()
  if (session?.role !== 'super_admin') return
  if (session.id === id) return // ห้ามลบตัวเอง

  const sb = adminSb()
  await sb.from('staff').delete().eq('id', id)

  await logAudit({
    session,
    action: 'delete_staff',
    target_type: 'staff',
    target_id: id,
  })

  revalidatePath('/admin/staff')
}