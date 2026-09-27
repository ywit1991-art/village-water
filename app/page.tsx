import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Users, Home, ClipboardList } from 'lucide-react'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import { STATUS_STYLES, STATUS_EMOJI } from '@/lib/constants'
import VillagesMapClient from '@/components/maps/VillagesMapClient'

export const revalidate = 60

export default async function HomePage() {
  const sb = await createClient()

  const [{ data: villages }, { data: surveys }, { data: systems }] =
    await Promise.all([
      sb.from('villages').select('*').order('village_no'),
      sb
        .from('surveys')
        .select('*')
        .in('status', ['submitted', 'approved'])
        .order('created_at', { ascending: false }),
      sb
        .from('water_systems')
        .select('*')
        .order('village_id')
        .order('system_no'),
    ])

  const latest = new Map<number, Survey>()
  ;(surveys as Survey[] | null)?.forEach(s => {
    if (!latest.has(s.village_id)) latest.set(s.village_id, s)
  })

  const list = (villages as Village[] | null) ?? []
  const sysList = (systems as WaterSystem[] | null) ?? []

  const totalUsers = [...latest.values()].reduce(
    (a, s) => a + (s.user_count ?? 0),
    0,
  )
  const totalHouses = sysList.reduce(
    (a, s) => a + (s.household_count ?? 0),
    0,
  )

  // ⚡ ใช้พิกัดจาก water_systems (เหมือนหน้า /villages/[id])
  const mapPoints = sysList
    .filter(s => s.lat && s.lng)
    .map(s => {
      const v = list.find(x => x.id === s.village_id)
      return {
        id: s.village_id,
        systemId: s.id,
        name: s.system_name,
        villageLabel: v ? `หมู่ ${v.village_no} ${v.village_name}` : '',
        lat: s.lat!,
        lng: s.lng!,
        status: s.overall_condition ?? 'ไม่มีข้อมูล',
        userCount: s.user_count ?? 0,
      }
    })

  return (
    <>
      {/* ============================================
          HERO
          ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />

        {/* Top bar */}
        <div className="relative max-w-7xl mx-auto px-4 pt-5 pb-2 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold leading-tight text-sm md:text-base">
              ระบบประปาหมู่บ้าน
            </h1>
            <p className="text-[11px] text-brand-100">
              ทต.ท่าวังทอง · อ.เมืองพะเยา
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/overview"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur transition"
            >
              📊 ภาพรวม
            </Link>
            <Link
              href="/map"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur transition"
            >
              🗺️ แผนที่
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur transition"
            >
              👤 สำหรับเจ้าหน้าที่
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 pb-16 md:pb-20">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center">
            <div>
              <span className="badge bg-white/20 backdrop-blur text-white text-xs">
                🗂️ ข้อมูลระบบประปา 14 หมู่บ้าน
              </span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight">
                ข้อมูลระบบประปาหมู่บ้าน
                <br />
                เพื่อการบริหารจัดการน้ำที่ยั่งยืน
              </h2>
              <p className="mt-3 md:text-lg text-brand-100 max-w-2xl leading-relaxed">
                ศูนย์รวมข้อมูลสถานะระบบประปา ผู้ใช้น้ำ คุณภาพน้ำ และการบริหารจัดการ
                เพื่อการพัฒนาระบบน้ำประปาของชุมชนอย่างโปร่งใส
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl scale-110" />
                <img
                  src="/logo.png"
                  alt="ตราเทศบาลตำบลท่าวังทอง"
                  className="relative w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full shadow-2xl shadow-brand-900/40 object-cover ring-4 ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS
          ============================================ */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Stat
            icon={<MapPin className="text-brand-600" />}
            value={list.length}
            label="หมู่บ้าน"
          />
          <Stat
            icon={<Users className="text-brand-600" />}
            value={sysList.length}
            label="ระบบประปา"
          />
          <Stat
            icon={<Home className="text-brand-600" />}
            value={totalHouses}
            label="ครัวเรือน"
          />
          <Stat
            icon={<ClipboardList className="text-brand-600" />}
            value={surveys?.length ?? 0}
            label="แบบสำรวจ"
          />
        </div>
      </section>

      {/* ============================================
          MAP
          ============================================ */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold text-brand-900 mb-4">
          แผนที่ระบบประปาทั้ง 14 หมู่บ้าน
        </h3>
        <VillagesMapClient points={mapPoints} />
      </section>

      {/* ============================================
          VILLAGES
          ============================================ */}
      <section className="max-w-7xl mx-auto px-4 mt-12 pb-20">
        <h3 className="text-2xl font-bold text-brand-900 mb-6">รายชื่อหมู่บ้าน</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(v => {
            const s = latest.get(v.id)
            const st = s?.overall_condition ?? 'ไม่มีข้อมูล'
            const vSys = sysList.filter(x => x.village_id === v.id)
            const vHouses = vSys.reduce(
              (a, x) => a + (x.household_count ?? 0),
              0,
            )
            const vRate = vSys[0]?.water_rate

            return (
              <Link
                key={v.id}
                href={`/villages/${v.id}`}
                className="card p-5 hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-brand-500">
                      หมู่ที่ {v.village_no}
                    </p>
                    <h4 className="text-lg font-bold text-brand-900 leading-tight">
                      {v.village_name}
                    </h4>
                  </div>
                  <span
                    className={`badge border ${
                      STATUS_STYLES[st] ?? STATUS_STYLES['ไม่มีข้อมูล']
                    }`}
                  >
                    {STATUS_EMOJI[st] ?? ''} {st}
                  </span>
                </div>
                <p className="text-sm text-brand-700 min-h-[2.5rem] line-clamp-2">
                  {vSys.length > 0 ? (
                    `${vSys.length} ระบบประปา`
                  ) : (
                    <span className="text-slate-400">ยังไม่มีข้อมูล</span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-3 mt-3 border-t border-brand-50">
                  <Mini label="ระบบ" value={vSys.length} />
                  <Mini label="ครัวเรือน" value={vHouses} />
                  <Mini label="บาท/หน่วย" value={vRate} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-brand-900 text-brand-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="ตราเทศบาลตำบลท่าวังทอง"
            className="w-16 h-16 rounded-full ring-2 ring-white/20"
          />
          <p className="font-medium text-center">
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </p>
          <p className="text-sm text-brand-300 text-center">
            ระบบจัดเก็บและเผยแพร่ข้อมูลระบบประปาหมู่บ้าน
          </p>
        </div>
      </footer>
    </>
  )
}

/* ============================================ */
/* Sub components                                */
/* ============================================ */

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="card p-4 md:p-5">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-brand-900">
        {value.toLocaleString()}
      </div>
      <div className="text-xs md:text-sm text-brand-600 mt-1">{label}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value?: number | null }) {
  return (
    <div>
      <p className="text-base font-bold text-brand-900">{value ?? '–'}</p>
      <p className="text-[10px] uppercase text-brand-500">{label}</p>
    </div>
  )
}