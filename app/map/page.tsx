import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WaterSystemsMap from '@/components/maps/water-systems-map'
import type { WaterSystemWithVillage, Village } from '@/lib/types'

export const revalidate = 60

export default async function MapPage() {
  const sb = await createClient()

  const [{ data: villages }, { data: systems }] = await Promise.all([
    sb.from('villages').select('*').order('village_no'),
    sb.from('water_systems').select('*').order('village_id').order('system_no'),
  ])

  const villageMap = new Map<number, Village>()
  ;(villages as Village[] | null)?.forEach(v => villageMap.set(v.id, v))

  const systemsWithVillage: WaterSystemWithVillage[] = (systems ?? [])
    .map(s => {
      const v = villageMap.get(s.village_id)
      if (!v) return null
      return { ...s, village: v }
    })
    .filter((x): x is WaterSystemWithVillage => x !== null)

  return (
    <div className="min-h-screen flex flex-col bg-white">
<header className="h-16 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg flex items-center justify-between px-4 shrink-0 z-20 relative">
  {/* ซ้าย: เมนู */}
  <nav className="flex items-center gap-1">
    <Link
      href="/"
      className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition"
    >
      หน้าหลัก
    </Link>
    <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/20">
      แผนที่
    </span>
    <Link
      href="/admin"
      className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition"
    >
      เจ้าหน้าที่
    </Link>
  </nav>

  {/* ขวา: โลโก้ + ข้อความ */}
  <div className="flex items-center gap-3">
    <div className="text-right">
      <h1 className="font-bold leading-tight text-sm md:text-base">
        แผนที่ระบบประปาหมู่บ้าน
      </h1>
      <p className="text-[11px] text-brand-100 hidden md:block">
        ทต.ท่าวังทอง · อ.เมืองพะเยา
      </p>
    </div>
    <img
      src="/logo.png"
      alt="ตราเทศบาลตำบลท่าวังทอง"
      className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-lg"
    />
  </div>
</header>

      <main className="flex-1 relative">
        <WaterSystemsMap
          systems={systemsWithVillage}
          villages={(villages as Village[]) ?? []}
        />
      </main>
    </div>
  )
}