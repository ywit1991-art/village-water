import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut, PlusCircle, Pencil, Eye, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { logoutAction } from '../actions'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import { STATUS_STYLES, STATUS_EMOJI, STATUS_COLORS } from '@/lib/constants'
import CreateSystemModal from './create-system-modal'

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
      sb
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

  const villageMap = new Map<number, Village>()
  ;(villages as Village[] | null)?.forEach(v => villageMap.set(v.id, v))

  // สำหรับแต่ละ water_system → หา survey ล่าสุด
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

  // Stats
  const totalSurveys = surveys?.length ?? 0
  const submittedCount = surveys?.filter(s => s.status === 'submitted').length ?? 0
  const draftCount = surveys?.filter(s => s.status === 'draft').length ?? 0

  return (
    <>
<header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    {/* ซ้าย: โลโก้ + ข้อมูลเจ้าหน้าที่ */}
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="ตราเทศบาลตำบลท่าวังทอง"
        className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-lg"
      />
      <div>
        <h1 className="font-bold leading-tight text-sm md:text-base">
          สำหรับเจ้าหน้าที่เทศบาลตำบลท่าวังทอง
        </h1>
        <p className="text-[11px] text-brand-100">
          {session.full_name ?? 'เจ้าหน้าที่'} · {session.code}
        </p>
      </div>
    </div>

    {/* ขวา: ปุ่ม */}
    <div className="flex items-center gap-2">
      <Link
        href="/"
        className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
      >
        <Eye size={16} /> <span className="hidden md:inline">ดูสาธารณะ</span>
      </Link>
      <form action={logoutAction}>
        <button
          className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition inline-flex items-center gap-1.5"
          type="submit"
        >
          <LogOut size={16} /> <span className="hidden md:inline">ออก</span>
        </button>
      </form>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-brand-500">หมู่บ้านทั้งหมด</p>
            <p className="text-2xl font-bold text-brand-900">
              {allVillages.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-brand-500">ระบบประปาทั้งหมด</p>
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
            <p className="text-xs text-brand-500">มีผู้ใช้ในระบบ</p>
            <p className="text-2xl font-bold text-brand-900">1</p>
          </div>
        </div>

        {/* ตารางกลุ่มตามหมู่บ้าน */}
        <div className="space-y-4">
          {allVillages.map(v => {
            const rows = grouped.get(v.id) ?? []

            return (
              <div key={v.id} className="card overflow-hidden">
                {/* Header ของหมู่บ้าน */}
                <div className="px-4 py-3 bg-brand-50/60 border-b border-brand-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-500">หมู่ที่ {v.village_no}</p>
                    <h2 className="font-bold text-brand-900">
                      {v.village_name}
                    </h2>
                  </div>
                  <CreateSystemModal
                    villageId={v.id}
                    villageName={v.village_name}
                  />
                </div>

                {/* ตารางระบบ */}
                {rows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    ยังไม่มีระบบประปาในหมู่บ้านนี้ — กด "เพิ่มระบบ" ด้านบน
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white text-brand-700 border-b border-brand-50">
                      <tr>
                        <th className="p-3 text-left w-24">ระบบที่</th>
                        <th className="p-3 text-left">ชื่อระบบ</th>
                        <th className="p-3 text-left w-32">สถานะ</th>
                        <th className="p-3 text-left w-32">วันที่ตรวจ</th>
                        <th className="p-3 text-left w-40">สภาพ</th>
                        <th className="p-3 text-right w-32">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ system: sys, survey: s }) => {
                        const st = s?.overall_condition ?? sys.overall_condition ?? 'ไม่มีข้อมูล'
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
                            <td className="p-3 text-right">
                              <Link
                                href={`/admin/surveys/${s?.id ?? 'new'}?village=${v.id}&system=${sys.id}`}
                                className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-xs"
                              >
                                {s ? (
                                  <>
                                    <Pencil size={12} /> แก้ไข
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle size={12} /> บันทึก
                                  </>
                                )}
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}