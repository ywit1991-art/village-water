'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createSession,
  clearSession,
  SESSION_COOKIE,
} from '@/lib/auth/session'
import { getSession } from '@/lib/auth/session'
import { logAudit } from '@/lib/audit'
import {
  canAccessVillage,
  canAccessSystem,
} from '@/lib/auth/permissions'

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
    return { error: 'ไม่พบเจ้าหน้าที่' }
  }
  if (!staff.is_active) {
    return { error: 'บัญชีนี้ถูกระงับการใช้งาน' }
  }

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

  // 📝 Audit Log
  await logAudit({
    session: {
      id: staff.id,
      code: staff.code,
      full_name: staff.full_name,
      role: staff.role ?? 'staff',
      village_id: staff.village_id ?? null,
      system_ids: systemIds,
    },
    action: 'login',
    target_type: 'staff',
    target_id: staff.id,
    target_label: `${staff.full_name ?? ''} (${staff.code})`,
  })

  redirect('/admin/dashboard')
}

// ========================================
// Logout
// ========================================
export async function logoutAction() {
  const session = await getSession()
  if (session) {
    await logAudit({
      session,
      action: 'logout',
      target_type: 'staff',
      target_id: session.id,
      target_label: `${session.full_name ?? ''} (${session.code})`,
    })
  }
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
  const session = await getSession()
  if (!session) return { error: 'กรุณาเข้าสู่ระบบใหม่' }

  const villageId = Number(formData.get('village_id'))
  const systemName = (formData.get('system_name') as string)?.trim()
  const lat = formData.get('lat') ? Number(formData.get('lat')) : null
  const lng = formData.get('lng') ? Number(formData.get('lng')) : null

  if (!villageId) return { error: 'ไม่พบหมู่บ้าน' }
  if (!systemName) return { error: 'กรุณากรอกชื่อข้อมูล' }

  // 🔒 ตรวจสอบสิทธิ์
  if (!canAccessVillage(session, villageId)) {
    return { error: 'คุณไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านนี้' }
  }

  const sb = adminSb()

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

  // 📝 Audit Log
  await logAudit({
    session,
    action: 'create_system',
    target_type: 'water_system',
    target_id: data.id,
    target_label: systemName,
    metadata: { villageId, lat, lng },
  })

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
  const session = await getSession()
  if (!session) return { error: 'กรุณาเข้าสู่ระบบใหม่' }

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

  await logAudit({
    session,
    action: 'update_system',
    target_type: 'water_system',
    target_id: id,
    target_label: systemName,
    metadata: { lat, lng },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath('/villages')
  revalidatePath('/')

  return { ok: true }
}

// ========================================
// ลบ water_system
// ========================================
export async function deleteWaterSystemAction(id: number) {
  const session = await getSession()
  if (!session) return

  const sb = adminSb()

  const { data: sys } = await sb
    .from('water_systems')
    .select('system_name, village_id')
    .eq('id', id)
    .maybeSingle()

  await sb.from('water_systems').delete().eq('id', id)

  await logAudit({
    session,
    action: 'delete_system',
    target_type: 'water_system',
    target_id: id,
    target_label: sys?.system_name ?? `System #${id}`,
    metadata: { villageId: sys?.village_id },
  })

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
  if (session.id === id) return

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

// ========================================
// บันทึกแบบสำรวจ (Server Action)
// ========================================
export async function saveSurveyAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'กรุณาเข้าสู่ระบบใหม่' }

  const id = formData.get('id') as string
  const isNew = id === 'new'
  const status = formData.get('status') as 'draft' | 'submitted'
  const villageId = Number(formData.get('village_id'))
  const systemId = formData.get('water_system_id')
    ? Number(formData.get('water_system_id'))
    : null

  const payloadStr = formData.get('payload') as string
  if (!payloadStr) return { error: 'ไม่พบข้อมูลแบบสำรวจ' }

  let rawValues: Record<string, any>
  try {
    rawValues = JSON.parse(payloadStr)
  } catch {
    return { error: 'รูปแบบข้อมูลไม่ถูกต้อง' }
  }

  const sb = adminSb()

  // 🔒 ตรวจสอบสิทธิ์
  if (!canAccessVillage(session, villageId)) {
    return { error: 'คุณไม่มีสิทธิ์บันทึกข้อมูลหมู่บ้านนี้' }
  }
  if (systemId && !canAccessSystem(session, systemId, villageId)) {
    return { error: 'คุณไม่มีสิทธิ์บันทึกข้อมูลระบบนี้' }
  }

  const cleaned = cleanSurveyPayload(rawValues)
  const dbPayload = {
    ...cleaned,
    status,
    village_id: villageId,
    water_system_id: systemId,
    updated_at: new Date().toISOString(),
  }

  let surveyId = id
  if (isNew) {
    const { data, error } = await sb
      .from('surveys')
      .insert(dbPayload)
      .select('id')
      .single()
    if (error) return { error: 'บันทึกไม่สำเร็จ: ' + error.message }
    surveyId = data.id
  } else {
    const { error } = await sb.from('surveys').update(dbPayload).eq('id', id)
    if (error) return { error: 'บันทึกไม่สำเร็จ: ' + error.message }
  }

  await logAudit({
    session,
    action: 'save_survey',
    target_type: 'survey',
    target_id: surveyId,
    target_label: `${rawValues.water_system_name ?? 'แบบสำรวจ'} (${status})`,
    metadata: { villageId, systemId, status },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/surveys')
  revalidatePath('/overview')
  return { ok: true }
}

// ========================================
// Helper: ทำความสะอาดข้อมูล Survey
// ========================================
const NUMERIC_LIMITS: Record<
  string,
  { min?: number; max?: number; decimals?: number }
> = {
  lat: { min: -90, max: 90, decimals: 7 },
  lng: { min: -180, max: 180, decimals: 7 },
  water_source_lat: { min: -90, max: 90, decimals: 7 },
  water_source_lng: { min: -180, max: 180, decimals: 7 },
  household_count: { min: 0, max: 1000000, decimals: 0 },
  user_count: { min: 0, max: 1000000, decimals: 0 },
  metered_user_count: { min: 0, max: 1000000, decimals: 0 },
  unmetered_user_count: { min: 0, max: 1000000, decimals: 0 },
  pump_count: { min: 0, max: 1000, decimals: 0 },
  tank_count: { min: 0, max: 1000, decimals: 0 },
  water_rate: { min: 0, max: 100000, decimals: 2 },
  tank_capacity: { min: 0, max: 1000000, decimals: 2 },
  pipe_total_length: { min: 0, max: 1000000, decimals: 2 },
  water_source_distance: { min: 0, max: 100000, decimals: 2 },
  operator_years: { min: 0, max: 200, decimals: 2 },
}

const DATE_FIELDS = [
  'survey_date',
  'committee_order_date',
  'committee_start_date',
  'last_quality_test_date',
]

function clampNumber(
  value: number,
  limits: { min?: number; max?: number; decimals?: number },
): number | null {
  if (!Number.isFinite(value)) return null
  let v = value
  if (limits.min !== undefined && v < limits.min) v = limits.min
  if (limits.max !== undefined && v > limits.max) return null
  if (limits.decimals !== undefined) {
    const factor = Math.pow(10, limits.decimals)
    v = Math.round(v * factor) / factor
  }
  return v
}

function cleanSurveyPayload(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue

    // ⭐ water_rate_tiers — จัดการพิเศษ
    if (key === 'water_rate_tiers') {
      if (!Array.isArray(value)) {
        out[key] = []
        continue
      }
      out[key] = value
        .filter(t => t != null)
        .map(tier => ({
          from: Number(tier.from) || 0,
          to:
            tier.to === '' || tier.to === null || tier.to === undefined
              ? null
              : Number(tier.to),
          rate: Number(tier.rate) || 0,
          label: String(tier.label ?? '').trim(),
        }))
      continue
    }

    // วันที่ + ค่าว่าง → null
    if (DATE_FIELDS.includes(key)) {
      out[key] = value === '' || value === undefined ? null : value
      continue
    }

    if (value === '' || value === undefined) {
      out[key] = null
      continue
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      out[key] = null
      continue
    }

    if (typeof value === 'number' && NUMERIC_LIMITS[key]) {
      out[key] = clampNumber(value, NUMERIC_LIMITS[key])
      continue
    }

    if (Array.isArray(value)) {
      out[key] = value.map(item => {
        if (typeof item === 'object' && item !== null)
          return cleanSurveyPayload(item)
        if (item === '') return null
        if (typeof item === 'number' && Number.isNaN(item)) return null
        return item
      })
      continue
    }

    if (typeof value === 'object' && value !== null) {
      out[key] = cleanSurveyPayload(value)
      continue
    }

    out[key] = value
  }

  return out
}