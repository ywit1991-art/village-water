import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LogOut,
  PlusCircle,
  Pencil,
  Eye,
  Users,
  ClipboardList,
  Shield,
  Home,
  Droplets,
  Info,
  FileText,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { logoutAction } from '../actions'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import {
  canManageStaff,
  canViewAudit,
  canCreateSystem,
  canDeleteSystem,
  canAccessVillage,
  canAccessSystem,
  ROLE_LABELS,
} from '@/lib/auth/permissions'
import { RoleBadge } from '@/components/ui/role-badge'
import CreateSystemModal from './create-system-modal'
import IdleGuard from './idle-guard'
import DeleteSystemButton from './delete-system-button'

interface SystemRow {
  system: WaterSystem
  village: Village
  survey: Survey | null
}

// ========================================
// ข้อความ Header ตาม Role
// ========================================
const ROLE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  super_admin: {
    title: 'แผงควบคุมผู้ดูแลระบบ',
    subtitle: 'จัดการเจ้าหน้าที่ ดูประวัติ และดูแลข้อมูลทั้งหมด',
  },
  staff: {
    title: 'แดชบอร์ดเจ้าหน้าที่',
    subtitle: 'ดูแลข้อมูลประปาทั้งตำบล',
  },
  village_head: {
    title: 'แดชบอร์ดผู้ใหญ่บ้าน',
    subtitle: 'ดูแลข้อมูลประปาในหมู่บ้านของท่าน',
  },
  operator: {
    title: 'แดชบอร์ดผู้ดูแลข้อมูลประปา',
    subtitle: 'ดูแลเฉพาะข้อมูลประปาที่ท่านรับผิดชอบ',
  },
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin')

  const sb = createAdminClient()

  const [{ data: villages }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').order('village_no'),
      sb
        .from('water_systems')
        .select('*')
        .order('village_id')
        .order('system_no'),
      sb.from('surveys').select('*').order('created_at', { ascending: false }),
    ])

  // ========================================
  // 🔒 กรองข้อมูลตามสิทธิ์
  // ========================================
  const rawVillages = (villages as Village[] | null) ?? []
  const rawSystems = (systems as WaterSystem[] | null) ?? []
  const rawSurveys = (surveys as Survey[] | null) ?? []

  const filteredVillages = rawVillages.filter(v =>
    canAccessVillage(session, v.id),
  )

  const filteredSystems = rawSystems.filter(s =>
    canAccessSystem(session, s.id, s.village_id),
  )

  const visibleSystemIds = new Set(filteredSystems.map(s => s.id))
  const filteredSurveys = rawSurveys.filter(
    s => s.water_system_id && visibleSystemIds.has(s.water_system_id),
  )

  // ========================================
  // สร้าง Maps
  // ========================================
  const villageMap = new Map<number, Village>()
  filteredVillages.forEach(v => villageMap.set(v.id, v))

  const surveyMap = new Map<number, Survey>()
  filteredSurveys.forEach(s => {
    if (s.water_system_id && !surveyMap.has(s.water_system_id)) {
      surveyMap.set(s.water_system_id, s)
    }
  })

  const grouped = new Map<number, SystemRow[]>()
  filteredSystems.forEach(sys => {
    const v = villageMap.get(sys.village_id)
    if (!v) return
    const row: SystemRow = {
      system: sys,
      village: v,
      survey: surveyMap.get(sys.id) ?? null,
    }
    if (!grouped.has(sys.village_id)) grouped.set(sys.village_id, [])
    grouped.get(sys.village_id)!.push(row)
  })

  // ========================================
  // Stats
  // ========================================
  const totalSurveys = filteredSurveys.length
  const submittedCount = filteredSurveys.filter(
    s => s.status === 'submitted',
  ).length
  const draftCount = filteredSurveys.filter(s => s.status === 'draft').length

  const header = ROLE_HEADERS[session.role] ?? ROLE_HEADERS.staff
  const showCreate = canCreateSystem(session)
  const showDelete = canDeleteSystem(session)

  return (
    <>
      <IdleGuard timeout={60_000} warnBefore={15_000} />

      {/* ============================== */}
      {/* HEADER                          */}
      {/* ============================== */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/40 blur-lg scale-110" />
              <img
                src="/logo.png"
                alt="ตราเทศบาลตำบลท่าวังทอง"
                className="relative w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shadow-lg ring-2 ring-white/40 bg-white/10 p-0.5"
              />
            </div>
            <div>
              <h1 className="font-bold leading-tight text-sm md:text-base">
                {header.title}
              </h1>
              <p className="text-[11px] text-brand-100 hidden md:block">
                {session.full_name ?? 'เจ้าหน้าที่'} · {session.code}
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 md:gap-2">
            <span className="hidden md:inline-flex">
              <RoleBadge role={session.role} />
            </span>

            {canManageStaff(session) && (
              <Link
                href="/admin/staff"
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
              >
                <Users size={16} />
                <span className="hidden md:inline">เจ้าหน้าที่</span>
              </Link>
            )}

            {canViewAudit(session) && (
              <Link
                href="/admin/audit"
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
              >
                <ClipboardList size={16} />
                <span className="hidden md:inline">ประวัติ</span>
              </Link>
            )}

            <Link
              href="/overview"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
            >
              <Eye size={16} />
              <span className="hidden md:inline">ดูสาธารณะ</span>
            </Link>

            <form action={logoutAction}>
              <button
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
                type="submit"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">ออก</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Subtitle */}
        <div className="mb-4 flex items-center gap-2 text-sm text-brand-700">
          <Info size={14} className="shrink-0" />
          <span>{header.subtitle}</span>
        </div>

        {/* Scope Banner */}
        {session.role === 'village_head' && session.village_id && (
          <ScopeBanner
            icon={<Home size={18} />}
            color="emerald"
            title="ขอบเขตของคุณ"
            detail={
              villageMap.get(session.village_id)
                ? `หมู่ ${villageMap.get(session.village_id)!.village_no} ${
                    villageMap.get(session.village_id)!.village_name
                  }`
                : 'หมู่บ้านของคุณ'
            }
          />
        )}

        {session.role === 'operator' && (
          <ScopeBanner
            icon={<Droplets size={18} />}
            color="amber"
            title="ระบบที่คุณดูแล"
            detail={`${filteredSystems.length} ข้อมูลประปา ใน ${grouped.size} หมู่บ้าน`}
          />
        )}

        {/* ============================== */}
        {/* Stats                            */}
        {/* ============================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-brand-500">
              {session.role === 'village_head'
                ? 'หมู่บ้านของฉัน'
                : session.role === 'operator'
                  ? 'หมู่บ้านที่มีระบบ'
                  : 'หมู่บ้านทั้งหมด'}
            </p>
            <p className="text-2xl font-bold text-brand-900">
              {grouped.size || filteredVillages.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-brand-500">ข้อมูลประปา</p>
            <p className="text-2xl font-bold text-brand-900">
              {filteredSystems.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-brand-500">แบบสำรวจ</p>
            <p className="text-2xl font-bold text-brand-900">
              {totalSurveys}{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({submittedCount} ส่ง, {draftCount} ร่าง)
              </span>
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-brand-500">
              {session.role === 'super_admin'
                ? 'บทบาทของคุณ'
                : 'สิทธิ์การใช้งาน'}
            </p>
            <p className="text-base font-bold text-brand-900 mt-1">
              {ROLE_LABELS[session.role]}
            </p>
          </div>
        </div>

        {/* ============================== */}
        {/* ตารางกลุ่มตามหมู่บ้าน             */}
        {/* ============================== */}
        <div className="space-y-4">
          {filteredVillages.length === 0 && (
            <div className="card p-10 text-center">
              <Shield size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">
                {session.role === 'operator'
                  ? 'คุณยังไม่ได้รับมอบหมายข้อมูลประปา — กรุณาติดต่อผู้ดูแลระบบ'
                  : 'ไม่พบข้อมูลหมู่บ้านที่คุณเข้าถึงได้'}
              </p>
            </div>
          )}

          {filteredVillages.map(v => {
            const rows = grouped.get(v.id) ?? []

            if (rows.length === 0 && !showCreate) return null

            return (
              <div key={v.id} className="card overflow-hidden">
                {/* Header หมู่บ้าน */}
                <div className="px-4 py-3 bg-brand-50/60 border-b border-brand-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-500">
                      หมู่ที่ {v.village_no}
                    </p>
                    <h2 className="font-bold text-brand-900">
                      {v.village_name}
                    </h2>
                  </div>

                  {showCreate && (
                    <CreateSystemModal
                      villageId={v.id}
                      villageName={v.village_name}
                    />
                  )}
                </div>

                {/* ตารางข้อมูล */}
                {rows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    ยังไม่มีข้อมูลประปาในหมู่บ้านนี้
                    {showCreate && ' — กด "เพิ่มข้อมูล" ด้านบน'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white text-brand-700 border-b border-brand-50">
                        <tr>
                          <th className="p-3 text-left w-24">ข้อมูลที่</th>
                          <th className="p-3 text-left">ชื่อข้อมูล</th>
                          <th className="p-3 text-left w-32">สถานะ</th>
                          <th className="p-3 text-left w-32">วันที่ตรวจ</th>
                          <th className="p-3 text-left w-40">สภาพ</th>
                          <th className="p-3 text-right w-72">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(({ system: sys, survey: s }) => {
                          const st =
                            s?.overall_condition ??
                            sys.overall_condition ??
                            'ไม่มีข้อมูล'
                          const conditionStyle = STATUS_COLORS[st]

                          return (
                            <tr
                              key={sys.id}
                              className="border-t border-brand-50 hover:bg-brand-50/40"
                            >
                              <td className="p-3">
                                <span className="badge bg-brand-100 text-brand-700">
                                  {sys.system_no}
                                </span>
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-brand-900">
                                    {sys.system_name}
                                  </p>
                                  {sys.user_count > 0 && (
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Users size={10} />
                                      {sys.user_count} ราย
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                {!s ? (
                                  <span className="badge bg-slate-100 text-slate-500">
                                    ยังไม่มี
                                  </span>
                                ) : s.status === 'draft' ? (
                                  <span className="badge bg-yellow-100 text-yellow-700">
                                    ฉบับร่าง
                                  </span>
                                ) : s.status === 'submitted' ? (
                                  <span className="badge bg-green-100 text-green-700">
                                    ส่งแล้ว
                                  </span>
                                ) : (
                                  <span className="badge bg-blue-100 text-blue-700">
                                    อนุมัติ
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-brand-600 text-xs">
                                {s?.survey_date ?? '–'}
                              </td>
                              <td className="p-3">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    background: `${conditionStyle?.hex}20`,
                                    color: conditionStyle?.hex,
                                  }}
                                >
                                  {STATUS_EMOJI[st] ?? ''} {st}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                  {/* ปุ่มแก้ไขแบบฟอร์ม */}
                                  <Link
                                    href={`/admin/surveys/${s?.id ?? 'new'}?village=${v.id}&system=${sys.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition"
                                  >
                                    {s ? (
                                      <>
                                        <Pencil size={12} /> แก้ไขแบบฟอร์ม
                                      </>
                                    ) : (
                                      <>
                                        <PlusCircle size={12} /> กรอกแบบฟอร์ม
                                      </>
                                    )}
                                  </Link>

                                  {/* ปุ่มรายงาน — แสดงเมื่อมี survey เท่านั้น */}
                                  {s && (
                                    <Link
                                      href={`/admin/surveys/${s.id}/report`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium transition"
                                      title="เปิดรายงานแบบเต็มเพื่อพิมพ์"
                                    >
                                      <FileText size={12} /> รายงาน
                                    </Link>
                                  )}

                                  {/* ปุ่มลบ — เฉพาะ staff/super_admin */}
                                  {showDelete && (
                                    <DeleteSystemButton
                                      systemId={sys.id}
                                      systemName={sys.system_name}
                                      villageName={`หมู่ ${v.village_no} ${v.village_name}`}
                                      hasSurvey={!!s}
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
                )}
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}

// ========================================
// Sub-component: Scope Banner
// ========================================
function ScopeBanner({
  icon,
  title,
  detail,
  color,
}: {
  icon: React.ReactNode
  title: string
  detail: string
  color: 'emerald' | 'amber' | 'brand'
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      subtext: 'text-emerald-600',
      icon: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      subtext: 'text-amber-600',
      icon: 'text-amber-600',
    },
    brand: {
      bg: 'bg-brand-50',
      border: 'border-brand-200',
      text: 'text-brand-800',
      subtext: 'text-brand-600',
      icon: 'text-brand-600',
    },
  }
  const c = colorMap[color]

  return (
    <div
      className={`mb-4 flex items-center gap-3 p-3 rounded-xl border ${c.bg} ${c.border}`}
    >
      <div className={`shrink-0 ${c.icon}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${c.subtext}`}>{title}</p>
        <p className={`text-sm font-bold ${c.text} truncate`}>{detail}</p>
      </div>
    </div>
  )
}