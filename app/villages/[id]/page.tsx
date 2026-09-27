import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Home, ArrowLeft, Phone, Calendar } from 'lucide-react'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import VillageSystemsMap from '@/components/villages/village-systems-map'
import SystemDetailCard from '@/components/villages/system-detail-card'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export default async function VillagePage({ params }: Props) {
  const { id } = await params
  const villageId = Number(id)

  if (!villageId || Number.isNaN(villageId)) notFound()

  const sb = await createClient()

  const [{ data: village }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').eq('id', villageId).single(),
      sb
        .from('water_systems')
        .select('*')
        .eq('village_id', villageId)
        .order('system_no'),
      sb
        .from('surveys')
        .select('*')
        .eq('village_id', villageId)
        .order('created_at', { ascending: false }),
    ])

  if (!village) notFound()

  const v = village as Village
  const sysList = (systems as WaterSystem[] | null) ?? []
  const surveyList = (surveys as Survey[] | null) ?? []

  // survey ล่าสุดของแต่ละระบบ
  const latestBySystem = new Map<number, Survey>()
  surveyList.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  // survey ล่าสุดของหมู่บ้าน (fallback ถ้าไม่มีระบบ)
  const latestSurvey = surveyList[0] ?? null

  // สถิติรวม
  const totalHouseholds = sysList.reduce(
    (a, s) => a + (s.household_count ?? 0),
    0,
  )

  // นับสถานะ
  const statusCount: Record<string, number> = {
    'ดี': 0,
    'พอใช้': 0,
    'ต้องปรับปรุง': 0,
    'เร่งด่วน': 0,
    'ไม่มีข้อมูล': 0,
  }
  sysList.forEach(s => {
    const k = s.overall_condition ?? 'ไม่มีข้อมูล'
    statusCount[k] = (statusCount[k] ?? 0) + 1
  })

  // รวมรูปจากทุก survey (6 ภาพ)
  const photos: { url: string; label: string; systemName: string }[] = []
  sysList.forEach(sys => {
    const s = latestBySystem.get(sys.id)
    if (!s?.photos?.length) return
    const labels = [
      'แหล่งน้ำดิบ',
      'ระบบสูบน้ำ',
      'ระบบผลิต/กรองน้ำ',
      'ถังเก็บน้ำ',
      'ระบบท่อ',
      'จุดชำรุด/ปัญหา',
    ]
    s.photos.forEach((url, i) => {
      if (url) {
        photos.push({
          url,
          label: labels[i] ?? `ภาพที่ ${i + 1}`,
          systemName: sys.system_name,
        })
      }
    })
  })

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/30">
      {/* ============================================
          HERO
          ============================================ */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />

        {/* Top bar */}
        <div className="relative max-w-7xl mx-auto px-4 pt-5 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur transition"
          >
            <ArrowLeft size={14} /> กลับหน้าหลัก
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur transition"
          >
            🗺️ ดูแผนที่รวม
          </Link>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-16">
          <div className="flex items-start gap-4 md:gap-6">
            <img
              src="/logo.png"
              alt="ตราเทศบาล"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl ring-4 ring-white/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-100 font-medium">
                หมู่ที่ {v.village_no}
              </p>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mt-1">
                {v.village_name}
              </h1>
              <p className="text-sm md:text-base text-brand-100 mt-1">
                ต.{v.tambon} อ.{v.amphoe} จ.{v.province}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================
          STATS
          ============================================ */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={<MapPin size={20} />} value={sysList.length} label="ระบบประปา" />
          <StatCard icon={<Home size={20} />} value={totalHouseholds} label="ครัวเรือน" />
          <StatCard
            icon={<Calendar size={20} />}
            value={latestSurvey ? 1 : 0}
            label="แบบสำรวจ"
          />
        </div>
      </section>

      {/* ============================================
          STATUS SUMMARY
          ============================================ */}
      {sysList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <div className="card p-4">
            <h2 className="text-sm font-bold text-brand-900 mb-3">
              สรุปสถานะระบบประปา
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(statusCount).map(([status, count]) => {
                const c = STATUS_COLORS[status]
                return (
                  <div
                    key={status}
                    className="flex items-center gap-2 p-2 rounded-lg border border-brand-100 bg-white"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: c.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 truncate">{status}</p>
                      <p className="text-lg font-bold text-brand-900 leading-tight">
                        {count}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          MAP
          ============================================ */}
      {sysList.filter(s => s.lat && s.lng).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <h2 className="text-lg font-bold text-brand-900 mb-3">
            ตำแหน่งระบบประปาในหมู่บ้าน
          </h2>
          <VillageSystemsMap systems={sysList} />
        </section>
      )}

      {/* ============================================
          SYSTEM LIST
          ============================================ */}
      <section className="max-w-7xl mx-auto px-4 mt-8 w-full">
        <h2 className="text-lg font-bold text-brand-900 mb-3">
          รายละเอียดระบบประปา ({sysList.length} ระบบ)
        </h2>

        {sysList.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-brand-400 text-sm">
              ยังไม่มีข้อมูลระบบประปาสำหรับหมู่บ้านนี้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sysList.map(sys => (
              <SystemDetailCard
                key={sys.id}
                system={sys}
                survey={latestBySystem.get(sys.id) ?? null}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============================================
          PHOTOS
          ============================================ */}
      {photos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <h2 className="text-lg font-bold text-brand-900 mb-3">
            ภาพถ่ายประกอบ ({photos.length} ภาพ)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-brand-100 bg-white"
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full h-40 object-cover group-hover:scale-105 transition"
                />
                <div className="p-2">
                  <p className="text-xs font-medium text-brand-900 truncate">
                    {p.label}
                  </p>
                  <p className="text-[10px] text-brand-500 truncate">
                    {p.systemName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================
          CONTACT
          ============================================ */}
      {sysList.some(s => latestBySystem.get(s.id)?.operator_phone) && (
        <section className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <h2 className="text-lg font-bold text-brand-900 mb-3">
            ช่องทางติดต่อ
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {sysList.map(sys => {
              const s = latestBySystem.get(sys.id)
              if (!s?.operator_phone) return null
              return (
                <div key={sys.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-500">
                      {sys.system_name}
                    </p>
                    <p className="font-medium text-brand-900 text-sm truncate">
                      {s.operator_name ?? 'ช่างประปา'}
                    </p>
                    <a
                      href={`tel:${s.operator_phone}`}
                      className="text-sm text-brand-600 hover:underline font-mono"
                    >
                      {s.operator_phone}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-brand-900 text-brand-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="ตราเทศบาล"
            className="w-12 h-12 rounded-full ring-2 ring-white/20"
          />
          <p className="text-sm text-center">
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ============================================ */
/* Sub components                                */
/* ============================================ */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="card p-4 w-full h-full">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-brand-900">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-brand-600 mt-0.5">{label}</p>
    </div>
  )
}