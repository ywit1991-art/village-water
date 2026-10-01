import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Home,
  Shield,
  Users,
  ClipboardList,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { canManageStaff } from '@/lib/auth/permissions'
import { RoleBadge } from '@/components/ui/role-badge'
import { NavLink } from '@/components/ui/nav-link'
import CreateStaffModal from './create-staff-modal'
import EditStaffModal from './edit-staff-modal'
import DeleteStaffButton from './delete-staff-button'

export default async function StaffPage() {
  const session = await getSession()
  if (!session) redirect('/admin')

  if (!canManageStaff(session)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
          </p>
          <Link href="/admin/dashboard" className="btn-primary">
            ← กลับแดชบอร์ด
          </Link>
        </div>
      </div>
    )
  }

  const sb = createAdminClient()
  const [
    { data: staffList },
    { data: villages },
    { data: systems },
    { data: operatorSystems },
  ] = await Promise.all([
    sb.from('staff').select('*').order('created_at', { ascending: true }),
    sb.from('villages').select('*').order('village_no'),
    sb
      .from('water_systems')
      .select('*')
      .order('village_id')
      .order('system_no'),
    sb.from('operator_systems').select('*'),
  ])

  const villageMap = new Map<
    number,
    { village_no: number; village_name: string }
  >()
  ;(villages ?? []).forEach(v => villageMap.set(v.id, v))

  const sysByStaff = new Map<number, number[]>()
  ;(operatorSystems ?? []).forEach(o => {
    if (!sysByStaff.has(o.staff_id)) sysByStaff.set(o.staff_id, [])
    sysByStaff.get(o.staff_id)!.push(o.water_system_id)
  })

  const list = staffList ?? []

  return (
    <div className="min-h-screen bg-brand-50/30">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link
              href="/admin/dashboard"
              aria-label="กลับแดชบอร์ด"
              className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold leading-tight text-sm md:text-base truncate">
                จัดการเจ้าหน้าที่
              </h1>
              <p className="text-[11px] text-brand-100">
                ทั้งหมด {list.length} คน
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 md:gap-2 shrink-0">
            <NavLink
              href="/admin/audit"
              className="px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 active:scale-95 transition inline-flex items-center gap-1.5"
            >
              <ClipboardList size={16} />
              <span className="hidden md:inline">ประวัติการใช้งาน</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-5"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard
            icon={<Users size={18} />}
            value={list.length}
            label="เจ้าหน้าที่ทั้งหมด"
            color="text-brand-600 bg-brand-50"
          />
          <StatCard
            icon={<Shield size={18} />}
            value={list.filter(s => s.role === 'super_admin').length}
            label="ผู้ดูแลระบบ"
            color="text-red-600 bg-red-50"
          />
          <StatCard
            icon={<Users size={18} />}
            value={list.filter(s => s.role === 'staff').length}
            label="เจ้าหน้าที่ทั่วไป"
            color="text-sky-600 bg-sky-50"
          />
          <StatCard
            icon={<Home size={18} />}
            value={
              list.filter(
                s => s.role === 'village_head' || s.role === 'operator',
              ).length
            }
            label="ผู้ใหญ่บ้าน/ประจำระบบ"
            color="text-emerald-600 bg-emerald-50"
          />
        </div>

        {/* Table/Card */}
        <div className="card overflow-hidden">
          <div className="p-3 md:p-4 border-b border-brand-50 flex items-center justify-between gap-2">
            <h2 className="font-bold text-brand-900 text-sm md:text-base">
              รายชื่อเจ้าหน้าที่
            </h2>
            <CreateStaffModal
              villages={villages ?? []}
              systems={systems ?? []}
            />
          </div>

          {/* ====================== */}
          {/* Mobile: Card Layout    */}
          {/* ====================== */}
          <div className="md:hidden divide-y divide-brand-50">
            {list.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                ยังไม่มีเจ้าหน้าที่ในระบบ
              </div>
            )}
            {list.map(s => {
              const v = s.village_id ? villageMap.get(s.village_id) : null
              const sysIds = sysByStaff.get(s.id) ?? []
              return (
                <div key={s.id} className="p-3 space-y-2">
                  {/* Row 1: ชื่อ + สถานะ */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-900 text-sm">
                        {s.full_name ?? '–'}
                        {session.id === s.id && (
                          <span className="ml-2 text-[10px] text-brand-500">
                            (คุณ)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {s.code}
                      </p>
                    </div>
                    {s.is_active ? (
                      <span className="badge bg-green-100 text-green-700 shrink-0">
                        ใช้งาน
                      </span>
                    ) : (
                      <span className="badge bg-red-100 text-red-700 shrink-0">
                        ระงับ
                      </span>
                    )}
                  </div>

                  {/* Row 2: Role + ขอบเขต */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <RoleBadge role={s.role} />
                    <span className="text-slate-500">
                      {s.role === 'village_head' && v
                        ? `หมู่ ${v.village_no} ${v.village_name}`
                        : s.role === 'operator'
                          ? `${sysIds.length} ระบบ`
                          : 'ทั้งตำบล'}
                    </span>
                  </div>

                  {/* Row 3: ปุ่มจัดการ */}
                  <div className="flex items-center gap-2 pt-1">
                    <EditStaffModal
                      staff={{
                        id: s.id,
                        code: s.code,
                        full_name: s.full_name,
                        role: s.role,
                        village_id: s.village_id,
                        is_active: s.is_active,
                        system_ids: sysIds,
                      }}
                      villages={villages ?? []}
                      systems={systems ?? []}
                    />
                    {session.id !== s.id && (
                      <DeleteStaffButton
                        staffId={s.id}
                        staffName={s.full_name ?? ''}
                        staffCode={s.code}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ====================== */}
          {/* Desktop: Table         */}
          {/* ====================== */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-700">
                <tr>
                  <th className="p-3 text-left w-32" scope="col">
                    รหัสผ่าน
                  </th>
                  <th className="p-3 text-left" scope="col">
                    ชื่อ-สกุล
                  </th>
                  <th className="p-3 text-left w-40" scope="col">
                    สิทธิ์
                  </th>
                  <th className="p-3 text-left" scope="col">
                    ขอบเขต
                  </th>
                  <th className="p-3 text-left w-24" scope="col">
                    สถานะ
                  </th>
                  <th className="p-3 text-right w-32" scope="col">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map(s => {
                  const v = s.village_id
                    ? villageMap.get(s.village_id)
                    : null
                  const sysIds = sysByStaff.get(s.id) ?? []
                  return (
                    <tr
                      key={s.id}
                      className="border-t border-brand-50 hover:bg-brand-50/40"
                    >
                      <td className="p-3 font-mono text-xs text-slate-700">
                        {s.code}
                      </td>
                      <td className="p-3 font-medium text-brand-900">
                        {s.full_name ?? '–'}
                        {session.id === s.id && (
                          <span className="ml-2 text-[10px] text-brand-500">
                            (คุณ)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <RoleBadge role={s.role} />
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {s.role === 'village_head' && v ? (
                          `หมู่ ${v.village_no} ${v.village_name}`
                        ) : s.role === 'operator' ? (
                          `${sysIds.length} ระบบ`
                        ) : (
                          <span className="text-slate-400">ทั้งตำบล</span>
                        )}
                      </td>
                      <td className="p-3">
                        {s.is_active ? (
                          <span className="badge bg-green-100 text-green-700">
                            ใช้งาน
                          </span>
                        ) : (
                          <span className="badge bg-red-100 text-red-700">
                            ระงับ
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-3">
                          <EditStaffModal
                            staff={{
                              id: s.id,
                              code: s.code,
                              full_name: s.full_name,
                              role: s.role,
                              village_id: s.village_id,
                              is_active: s.is_active,
                              system_ids: sysIds,
                            }}
                            villages={villages ?? []}
                            systems={systems ?? []}
                          />
                          {session.id !== s.id && (
                            <DeleteStaffButton
                              staffId={s.id}
                              staffName={s.full_name ?? ''}
                              staffCode={s.code}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
}) {
  return (
    <div className="card p-3 md:p-4">
      <div
        className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}
      >
        {icon}
      </div>
      <p className="text-xl md:text-2xl font-bold text-brand-900">{value}</p>
      <p className="text-[11px] md:text-xs text-brand-600 mt-0.5 truncate">
        {label}
      </p>
    </div>
  )
}