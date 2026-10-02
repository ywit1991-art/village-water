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
import { NavLink } from '@/components/ui/nav-link'
import CreateSystemModal from './create-system-modal'
import IdleGuard from './idle-guard'
import DeleteSystemButton from './delete-system-button'
import EditSystemModal from './edit-system-modal'
interface SystemRow {
  system: WaterSystem
  village: Village
  survey: Survey | null
}

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
    s =>
      s.water_system_id &&
      visibleSystemIds.has(s.water_system_id) &&
      (s.status === 'submitted' || s.status === 'approved'),
  )

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

  const header = ROLE_HEADERS[session.role] ?? ROLE_HEADERS.staff
  const showCreate = canCreateSystem(session)
  const showDelete = canDeleteSystem(session)

  return (
    <>
      <IdleGuard timeout={60_000} warnBefore={15_000} />

      {/* HEADER */}
      <header className="sticky top-0 z-[2000] bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/40 blur-lg scale-110" />
              <img
                src="/logo.png"
                alt="ตราเทศบาลตำบลท่าวังทอง"
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-lg ring-2 ring-white/40 bg-white/10 p-0.5"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold leading-tight text-sm md:text-base truncate">
                {header.title}
              </h1>
              <p className="text-[11px] text-brand-100 hidden md:block truncate">
                {session.full_name ?? 'เจ้าหน้าที่'} · {session.code}
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 md:gap-2 shrink-0">
            <span className="hidden md:inline-flex">
              <RoleBadge role={session.role} />
            </span>

            {canManageStaff(session) && (
              <NavLink
                href="/admin/staff"
                className="px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 active:scale-95 transition inline-flex items-center gap-1.5"
              >
                <Users size={16} />
                <span className="hidden md:inline">เจ้าหน้าที่</span>
              </NavLink>
            )}

            {canViewAudit(session) && (
              <NavLink
                href="/admin/audit"
                className="px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 active:scale-95 transition inline-flex items-center gap-1.5"
              >
                <ClipboardList size={16} />
                <span className="hidden md:inline">ประวัติ</span>
              </NavLink>
            )}

            <NavLink
              href="/overview"
              className="px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 active:scale-95 transition inline-flex items-center gap-1.5"
            >
              <Eye size={16} />
              <span className="hidden md:inline">สาธารณะ</span>
            </NavLink>

            <form action={logoutAction}>
              <button
                className="px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 active:scale-95 transition inline-flex items-center gap-1.5"
                type="submit"
                aria-label="ออกจากระบบ"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">ออก</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 w-full"
      >
        <div className="mb-3 md:mb-4 flex items-center gap-2 text-xs md:text-sm text-brand-700">
          <Info size={14} className="shrink-0" />
          <span>{header.subtitle}</span>
        </div>

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

        {/* Stats — 3 ใบ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="card p-3 md:p-4">
            <p className="text-[11px] md:text-xs text-brand-500 truncate">
              {session.role === 'village_head'
                ? 'หมู่บ้านของฉัน'
                : session.role === 'operator'
                  ? 'หมู่บ้านที่มีระบบ'
                  : 'หมู่บ้านที่มีข้อมูล'}
            </p>
            <p className="text-xl md:text-2xl font-bold text-brand-900">
              {grouped.size || filteredVillages.length}
            </p>
          </div>
          <div className="card p-3 md:p-4">
            <p className="text-[11px] md:text-xs text-brand-500 truncate">
              ข้อมูลประปา
            </p>
            <p className="text-xl md:text-2xl font-bold text-brand-900">
              {filteredSystems.length}
            </p>
          </div>
          <div className="card p-3 md:p-4 col-span-2 md:col-span-1">
            <p className="text-[11px] md:text-xs text-brand-500 truncate">
              {session.role === 'super_admin'
                ? 'บทบาท'
                : 'สิทธิ์การใช้งาน'}
            </p>
            <p className="text-xs md:text-base font-bold text-brand-900 mt-0.5 md:mt-1 leading-snug">
              {ROLE_LABELS[session.role]}
            </p>
          </div>
        </div>

        {/* ตารางกลุ่มตามหมู่บ้าน */}
        <div className="space-y-3 md:space-y-4">
          {filteredVillages.length === 0 && (
            <div className="card p-8 md:p-10 text-center">
              <Shield size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                {session.role === 'operator'
                  ? 'คุณยังไม่ได้รับมอบหมายข้อมูลประปา'
                  : 'ไม่พบข้อมูลหมู่บ้านที่คุณเข้าถึงได้'}
              </p>
            </div>
          )}

          {filteredVillages.map(v => {
            const rows = grouped.get(v.id) ?? []
            if (rows.length === 0 && !showCreate) return null

            return (
              <div key={v.id} className="card overflow-hidden">
                <div className="px-3 md:px-4 py-2.5 md:py-3 bg-brand-50/60 border-b border-brand-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] md:text-xs text-brand-500">
                      หมู่ที่ {v.village_no}
                    </p>
                    <h2 className="font-bold text-brand-900 text-sm md:text-base truncate">
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

                {rows.length === 0 ? (
                  <div className="p-6 md:p-8 text-center text-xs md:text-sm text-slate-400">
                    ยังไม่มีข้อมูลประปา
                    {showCreate && ' — กด "เพิ่มข้อมูล"'}
                  </div>
                ) : (
                  <>
                    {/* ====================== */}
                    {/* Mobile: Card Layout    */}
                    {/* ====================== */}
                    <div className="md:hidden divide-y divide-brand-50">
                      {rows.map(({ system: sys, survey: s }) => {
                        const st =
                          s?.overall_condition ??
                          sys.overall_condition ??
                          'ไม่มีข้อมูล'
                        const conditionStyle = STATUS_COLORS[st]

                        return (
                          <div key={sys.id} className="p-3 space-y-2">
                            {/* Row 1: ข้อมูลที่ + ชื่อ + สถานะ */}
                            <div className="flex items-start gap-2">
                              <span className="badge bg-brand-100 text-brand-700 shrink-0">
                                {sys.system_no}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-brand-900 text-sm truncate">
                                  {sys.system_name}
                                </p>
                                {sys.user_count > 0 && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Users size={10} />
                                    {sys.user_count} ราย
                                  </p>
                                )}
                              </div>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
                                style={{
                                  background: `${conditionStyle?.hex}20`,
                                  color: conditionStyle?.hex,
                                }}
                              >
                                {STATUS_EMOJI[st] ?? ''} {st}
                              </span>
                            </div>

                            {/* Row 2: สถานะ + วันที่ */}
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              {!s ? (
                                <span className="badge bg-slate-100 text-slate-500">
                                  ยังไม่มีแบบสำรวจ
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
                              {s?.updated_at && (
                                <span className="text-slate-500">
                                  อัปเดต:{' '}
                                  {new Date(s.updated_at).toLocaleDateString(
                                    'th-TH',
                                    {
                                      day: '2-digit',
                                      month: 'short',
                                      year: '2-digit',
                                    },
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Row 3: ปุ่ม icon */}
                            <div className="flex items-center gap-1.5">
                              {/* ⭐ ปุ่มแก้ไขชื่อ */}
                              <EditSystemModal system={sys} />

                              <Link
                                href={`/admin/surveys/${s?.id ?? 'new'}?village=${v.id}&system=${sys.id}`}
                                aria-label={s ? 'แก้ไขแบบฟอร์ม' : 'กรอกแบบฟอร์ม'}
                                className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-medium transition"
                              >
                                {s ? (
                                  <Pencil size={18} />
                                ) : (
                                  <PlusCircle size={18} />
                                )}
                              </Link>

                              {s && (
                                <Link
                                  href={`/admin/surveys/${s.id}/report`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="เปิดรายงาน"
                                  className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 active:scale-95 text-white transition"
                                >
                                  <FileText size={18} />
                                </Link>
                              )}

                              {showDelete && (
                                <DeleteSystemButton
                                  systemId={sys.id}
                                  systemName={sys.system_name}
                                  villageName={`หมู่ ${v.village_no} ${v.village_name}`}
                                  hasSurvey={!!s}
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
                        <thead className="bg-white text-brand-700 border-b border-brand-50">
                          <tr>
                            <th className="p-3 text-left w-24" scope="col">
                              ข้อมูลที่
                            </th>
                            <th className="p-3 text-left" scope="col">
                              ชื่อข้อมูล
                            </th>
                            <th className="p-3 text-left w-32" scope="col">
                              สถานะ
                            </th>
                            <th className="p-3 text-left w-40" scope="col">
                              วันที่อัปเดทข้อมูล
                            </th>
                            <th className="p-3 text-left w-40" scope="col">
                              สภาพ
                            </th>
                            <th className="p-3 text-right w-72" scope="col">
                              จัดการ
                            </th>
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
                                className="border-t border-brand-50 hover:bg-brand-50/40 transition"
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
                                  {s?.updated_at
                                    ? new Date(
                                        s.updated_at,
                                      ).toLocaleDateString('th-TH', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '–'}
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
                                    {/* ⭐ ปุ่มแก้ไขชื่อ/พิกัด */}
                                    <EditSystemModal system={sys} />

                                    <Link
                                      href={`/admin/surveys/${s?.id ?? 'new'}?village=${v.id}&system=${sys.id}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-medium transition"
                                    >
                                      {s ? (
                                        <>
                                          <Pencil size={12} /> แก้ไขแบบฟอร์ม
                                        </>
                                      ) : (
                                        <>
                                          <PlusCircle size={12} />{' '}
                                          กรอกแบบฟอร์ม
                                        </>
                                      )}
                                    </Link>

                                    {s && (
                                      <Link
                                        href={`/admin/surveys/${s.id}/report`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="เปิดรายงานแบบเต็ม"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 active:scale-95 text-white text-xs font-medium transition"
                                      >
                                        <FileText size={12} /> รายงาน
                                      </Link>
                                    )}

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
                  </>
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