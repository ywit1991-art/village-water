import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Users, Home, ClipboardList } from 'lucide-react'
import type { Village, Survey } from '@/lib/types'
import { STATUS_STYLES, STATUS_EMOJI } from '@/lib/constants'
import VillagesMapClient from '@/components/maps/VillagesMapClient'

export const revalidate = 60

export default async function HomePage() {
  const sb = await createClient()

  const [{ data: villages }, { data: surveys }] = await Promise.all([
    sb.from('villages').select('*').order('village_no'),
    sb
      .from('surveys')
      .select('*')
      .in('status', ['submitted', 'approved'])
      .order('created_at', { ascending: false }),
  ])

  const latest = new Map<number, Survey>()
  ;(surveys as Survey[] | null)?.forEach(s => {
    if (!latest.has(s.village_id)) latest.set(s.village_id, s)
  })

  const list = (villages as Village[] | null) ?? []
  const totalUsers = [...latest.values()].reduce(
    (a, s) => a + (s.user_count ?? 0),
    0,
  )
  const totalHouses = [...latest.values()].reduce(
    (a, s) => a + (s.household_count ?? 0),
    0,
  )

  const mapPoints = list
    .filter(v => latest.get(v.id)?.lat && latest.get(v.id)?.lng)
    .map(v => {
      const s = latest.get(v.id)!
      return {
        id: v.id,
        name: `หมู่ ${v.village_no} ${v.village_name}`,
        lat: s.lat!,
        lng: s.lng!,
        status: s.overall_condition ?? 'ไม่มีข้อมูล',
      }
    })

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
<div className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="ตราเทศบาล"
    className="w-10 h-10 rounded-xl shadow-lg shadow-brand-200 object-cover"
  />
  <div>
    <h1 className="font-bold text-brand-900 leading-tight">
      ระบบประปาหมู่บ้าน
    </h1>
    <p className="text-xs text-brand-600">
      ทต.ท่าวังทอง · อ.เมืองพะเยา
    </p>
  </div>
</div>
            <div>
              <h1 className="font-bold text-brand-900 leading-tight">
                ระบบประปาหมู่บ้าน
              </h1>
              <p className="text-xs text-brand-600">
                ทต.ท่าวังทอง · อ.เมืองพะเยา
              </p>
            </div>
          </div>
<div className="flex items-center gap-2">
  <Link href="/map" className="btn-ghost">
    🗺️ แผนที่
  </Link>
  <Link href="/admin" className="btn-ghost">
    สำหรับเจ้าหน้าที่
  </Link>
</div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <span className="badge bg-white/20 text-white">
            🗂️ ข้อมูลระบบประปา 14 หมู่บ้าน
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight">
            ข้อมูลระบบประปาหมู่บ้าน
            <br />
            เพื่อการบริหารจัดการน้ำที่ยั่งยืน
          </h2>
          <p className="mt-3 md:text-lg text-brand-100 max-w-3xl leading-relaxed">
            ศูนย์รวมข้อมูลสถานะระบบประปา ผู้ใช้น้ำ คุณภาพน้ำ และการบริหารจัดการ
            เพื่อการพัฒนาระบบน้ำประปาของชุมชนอย่างโปร่งใส
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Stat
            icon={<MapPin className="text-brand-600" />}
            value={list.length}
            label="หมู่บ้าน"
          />
          <Stat
            icon={<Users className="text-brand-600" />}
            value={totalUsers}
            label="ผู้ใช้น้ำ (ราย)"
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

      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold text-brand-900 mb-4">
          แผนที่ระบบประปาทั้ง 14 หมู่บ้าน
        </h3>
        <VillagesMapClient points={mapPoints} />
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-12 pb-20">
        <h3 className="text-2xl font-bold text-brand-900 mb-6">
          รายชื่อหมู่บ้าน
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(v => {
            const s = latest.get(v.id)
            const st = s?.overall_condition ?? 'ไม่มีข้อมูล'
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
                    className={`badge border ${STATUS_STYLES[st] ?? STATUS_STYLES['ไม่มีข้อมูล']}`}
                  >
                    {STATUS_EMOJI[st] ?? ''} {st}
                  </span>
                </div>
                <p className="text-sm text-brand-700 min-h-[2.5rem] line-clamp-2">
                  {s?.water_system_name ?? (
                    <span className="text-slate-400">ยังไม่มีข้อมูล</span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-3 mt-3 border-t border-brand-50">
                  <Mini label="ผู้ใช้น้ำ" value={s?.user_count} />
                  <Mini label="ครัวเรือน" value={s?.household_count} />
                  <Mini label="บาท/หน่วย" value={s?.water_rate} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <footer className="bg-brand-900 text-brand-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-medium">
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </p>
          <p className="text-sm text-brand-300 mt-2">
            ระบบจัดเก็บและเผยแพร่ข้อมูลระบบประปาหมู่บ้าน
          </p>
        </div>
      </footer>
    </>
  )
}

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