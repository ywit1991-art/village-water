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
      <header className="h-16 bg-white border-b border-brand-100 flex items-center justify-between px-4 shrink-0 z-20 relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-200">
            ป
          </div>
          <div>
            <h1 className="font-bold text-brand-900 leading-tight text-sm md:text-base">
              แผนที่ระบบประปาหมู่บ้าน
            </h1>
            <p className="text-[11px] text-brand-600 hidden md:block">
              ทต.ท่าวังทอง · อ.เมืองพะเยา
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="/" className="btn-ghost text-sm">
            หน้าหลัก
          </Link>
          <span className="btn-primary text-sm pointer-events-none">
            แผนที่
          </span>
          <Link href="/admin" className="btn-ghost text-sm">
            เจ้าหน้าที่
          </Link>
        </nav>
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