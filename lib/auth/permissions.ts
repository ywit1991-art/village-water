import type { SessionData, StaffRole } from './session'

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'ผู้ดูแลระบบ',
  staff: 'เจ้าหน้าที่',
  village_head: 'ผู้ใหญ่บ้าน',
  operator: 'เจ้าหน้าที่ประจำระบบ',
}

export const ROLE_COLORS: Record<StaffRole, string> = {
  super_admin: 'bg-red-100 text-red-700 border-red-200',
  staff: 'bg-brand-100 text-brand-700 border-brand-200',
  village_head: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  operator: 'bg-amber-100 text-amber-700 border-amber-200',
}

/** จัดการเจ้าหน้าที่ได้ไหม */
export function canManageStaff(session: SessionData | null): boolean {
  return session?.role === 'super_admin'
}

/** ดู Audit Log ได้ไหม */
export function canViewAudit(session: SessionData | null): boolean {
  return session?.role === 'super_admin'
}

/** ดู/แก้ข้อมูลทุกหมู่ได้ไหม */
export function canAccessAll(session: SessionData | null): boolean {
  if (!session) return false
  return session.role === 'super_admin' || session.role === 'staff'
}

/** เข้าหมู่บ้านนี้ได้ไหม */
export function canAccessVillage(
  session: SessionData | null,
  villageId: number,
): boolean {
  if (!session) return false
  if (canAccessAll(session)) return true
  if (session.role === 'village_head') return session.village_id === villageId
  return false
}

/** เข้าข้อมูลประปานี้ได้ไหม */
export function canAccessSystem(
  session: SessionData | null,
  systemId: number,
  systemVillageId?: number,
): boolean {
  if (!session) return false
  if (canAccessAll(session)) return true
  if (session.role === 'operator') return session.system_ids.includes(systemId)
  if (session.role === 'village_head' && systemVillageId !== undefined) {
    return session.village_id === systemVillageId
  }
  return false
}

/** สร้างระบบใหม่ได้ไหม */
export function canCreateSystem(session: SessionData | null): boolean {
  if (!session) return false
  return session.role === 'super_admin' || session.role === 'staff'
}

/** ลบระบบได้ไหม */
export function canDeleteSystem(session: SessionData | null): boolean {
  if (!session) return false
  return session.role === 'super_admin' || session.role === 'staff'
}