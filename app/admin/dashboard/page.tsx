import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut, PlusCircle, Pencil, Eye, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { logoutAction } from '../actions'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import CreateSystemModal from './create-system-modal'
import IdleGuard from './idle-guard'
import DeleteSystemButton from './delete-system-button'

interface SystemRow {
  system: WaterSystem
  village: Village
  survey: Survey | null
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/admin')

  const sb = await createClient()

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

  const villageMap = new Map<number, Village>()
  ;(villages as Village[] | null)?.forEach(v => villageMap.set(v.id, v))

// เลือก survey ล่าสุดของแต่ละข้อมูล (ทุกสถานะ)
const surveyMap = new Map<number, Survey>()
;(surveys as Survey[] | null)?.forEach(s => {
  if (s.water_system_id && !surveyMap.has(s.water_system_id)) {
    surveyMap.set(s.water_system_id, s)
  }
})

  // จัดกลุ่มตามหมู่บ้าน
  const grouped = new Map<number, SystemRow[]>()
  ;(systems as WaterSystem[] | null)?.forEach(sys => {
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

  const allVillages = (villages as Village[] | null) ?? []

  const totalSurveys = (surveys as Survey[] | null)?.length ?? 0
  const submittedCount =
    (surveys as Survey[] | null)?.filter(s => s.status === 'submitted')
      .length ?? 0
  const draftCount =
    (surveys as Survey[] | null)?.filter(s => s.status === 'draft').length ?? 0

  return (
    <>
      <IdleGuard timeout={60_000} warnBefore={15_000} />

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
                แดชบอร์ดเจ้าหน้าที่
              </h1>
              <p className="text-[11px] text-brand-100 hidden md:block">
                {session.full_name ?? 'เจ้าหน้าที่'} · {session.code}
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 md:gap-2">
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-brand-500">หมู่บ้านทั้งหมด</p>
            <p className="text-2xl font-bold text-brand-900">
              {allVillages.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-brand-500">ข้อมูลประปาทั้งหมด</p>
            <p className="text-2xl font-bold text-brand-900">
              {systems?.length ?? 0}
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
            <p className="text-xs text-brand-500">ผู้ใช้ในข้อมูล</p>
            <p className="text-2xl font-bold text-brand-900">1</p>
          </div>
        </div>

        {/* ตารางกลุ่มตามหมู่บ้าน */}
        <div className="space-y-4">
          {allVillages.map(v => {
            const rows = grouped.get(v.id) ?? []

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
                  <CreateSystemModal
                    villageId={v.id}
                    villageName={v.village_name}
                  />
                </div>

                {/* ตารางข้อมูล */}
                {rows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    ยังไม่มีข้อมูลประปาในหมู่บ้านนี้ — กด "เพิ่มข้อมูล" ด้านบน
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
                          <th className="p-3 text-right w-48">จัดการ</th>
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
  <div className="inline-flex items-center gap-3">
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

    {/* ปุ่มลบ */}
    <DeleteSystemButton
      systemId={sys.id}
      systemName={sys.system_name}
      villageName={`หมู่ ${v.village_no} ${v.village_name}`}
      hasSurvey={!!s}
    />
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