import { createClient } from '@/lib/supabase/server'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import SummaryStats from '@/components/overview/summary-stats'
import StatusChart from '@/components/overview/status-chart'
import VillageComparisonTable from '@/components/overview/village-comparison-table'
import TopProblems from '@/components/overview/top-problems'

export const revalidate = 60

interface Row {
  village: Village
  systems: WaterSystem[]
  latestSurvey: Survey | null
}

export default async function OverviewPage() {
  const sb = await createClient()

  const [{ data: villages }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').order('village_no'),
      sb.from('water_systems').select('*'),
      sb
        .from('surveys')
        .select('*')
        .in('status', ['submitted', 'approved'])
        .order('created_at', { ascending: false }),
    ])

  const vills = (villages as Village[] | null) ?? []
  const sys = (systems as WaterSystem[] | null) ?? []
  const svy = (surveys as Survey[] | null) ?? []

  const sysByVillage = new Map<number, WaterSystem[]>()
  sys.forEach(s => {
    if (!sysByVillage.has(s.village_id)) sysByVillage.set(s.village_id, [])
    sysByVillage.get(s.village_id)!.push(s)
  })

  const latestBySystem = new Map<number, Survey>()
  svy.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  const rows: Row[] = vills.map(v => {
    const sysList = sysByVillage.get(v.id) ?? []
    const latest =
      sysList
        .map(s => latestBySystem.get(s.id))
        .filter((x): x is Survey => !!x)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )[0] ?? null
    return { village: v, systems: sysList, latestSurvey: latest }
  })

  const totalSystems = sys.length
  const totalHouseholds = sys.reduce((a, s) => a + (s.household_count ?? 0), 0)
  const totalSurveys = svy.length

  const statusCount: Record<string, number> = {
    'ดี': 0,
    'พอใช้': 0,
    'ต้องปรับปรุง': 0,
    'เร่งด่วน': 0,
    'ไม่มีข้อมูล': 0,
  }
  sys.forEach(s => {
    const k = s.overall_condition ?? 'ไม่มีข้อมูล'
    statusCount[k] = (statusCount[k] ?? 0) + 1
  })

  const urgentSystems = sys
    .filter(
      s =>
        s.overall_condition === 'เร่งด่วน' ||
        s.overall_condition === 'ต้องปรับปรุง',
    )
    .sort((a, b) => {
      const order: Record<string, number> = {
        เร่งด่วน: 0,
        ต้องปรับปรุง: 1,
      }
      return (
        (order[a.overall_condition ?? ''] ?? 9) -
        (order[b.overall_condition ?? ''] ?? 9)
      )
    })
    .slice(0, 10)

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/30">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ตราเทศบาล"
              className="w-10 h-10 rounded-xl ring-2 ring-white/30"
            />
            <div>
              <h1 className="font-bold leading-tight text-sm md:text-base">
                ภาพรวมระบบประปา 14 หมู่บ้าน
              </h1>
              <p className="text-[11px] text-brand-100 hidden md:block">
                ทต.ท่าวังทอง · อ.เมืองพะเยา
              </p>
            </div>
          </a>
          <nav className="flex items-center gap-1 md:gap-2">
            <a
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition"
            >
              หน้าหลัก
            </a>
            <a
              href="/map"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition"
            >
              🗺️ แผนที่
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <SummaryStats
          totalVillages={vills.length}
          totalSystems={totalSystems}
          totalHouseholds={totalHouseholds}
          totalSurveys={totalSurveys}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <StatusChart statusCount={statusCount} total={totalSystems} />
          <TopProblems systems={urgentSystems} villages={vills} />
        </div>

        <VillageComparisonTable
          rows={rows}
          latestBySystem={latestBySystem}
        />
      </main>

      <footer className="bg-brand-900 text-brand-100 py-8 mt-auto">
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