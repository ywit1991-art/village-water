'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Filter,
  MapPin,
  Droplets,
  Home,
  Package,
  ClipboardList,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import StatusChart from './status-chart'
import VillageStatusChart from './village-status-chart'
import VillagesMapClient, {
  type MarkerData,
} from '@/components/maps/VillagesMapClient'
import type { Village, Survey } from '@/lib/types'
import type { SystemWithContext } from '@/app/overview/page'

const STATUS_OPTIONS = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

interface Props {
  villages: Village[]
  systems: SystemWithContext[]
}

export default function OverviewClient({ villages, systems }: Props) {
  const [villageFilter, setVillageFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chartMode, setChartMode] = useState<'status' | 'village'>('status')
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!mapRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      mapRef.current.requestFullscreen()
    }
  }

  const filtered = useMemo(() => {
    return systems.filter(s => {
      if (!s.survey) return false

      if (villageFilter !== 'all' && s.system.village_id !== villageFilter)
        return false

      const condition =
        s.survey.overall_condition ??
        s.system.overall_condition ??
        'ไม่มีข้อมูล'
      if (statusFilter !== 'all' && condition !== statusFilter) return false

      return true
    })
  }, [systems, villageFilter, statusFilter])

  const stats = useMemo(() => {
    const uniqueVillages = new Set(filtered.map(s => s.system.village_id)).size
    const totalSystems = filtered.length
    const totalHouseholds = filtered.reduce(
      (a, s) => a + (s.survey?.household_count ?? s.system.household_count ?? 0),
      0,
    )
    const totalCapacity = filtered.reduce(
      (a, s) => a + (s.survey?.tank_capacity ?? s.system.tank_capacity ?? 0),
      0,
    )
    const totalSurveys = filtered.filter(s => s.survey != null).length

    return {
      villages: uniqueVillages,
      systems: totalSystems,
      households: totalHouseholds,
      capacity: totalCapacity,
      surveys: totalSurveys,
    }
  }, [filtered])

  const statusCount: Record<string, number> = {
    'ดี': 0,
    'พอใช้': 0,
    'ต้องปรับปรุง': 0,
    'เร่งด่วน': 0,
    'ไม่มีข้อมูล': 0,
  }
  filtered.forEach(s => {
    const k =
      s.survey?.overall_condition ?? s.system.overall_condition ?? 'ไม่มีข้อมูล'
    statusCount[k] = (statusCount[k] ?? 0) + 1
  })

  const markers: MarkerData[] = useMemo(() => {
    const result: MarkerData[] = []

    for (const s of filtered) {
      const lat = s.survey?.lat ?? s.system.lat
      const lng = s.survey?.lng ?? s.system.lng
      if (!lat || !lng) continue

      const productionTypes = (s.survey?.production_type ?? []).filter(
        (t): t is string => typeof t === 'string' && t.length > 0,
      )

      const problems = (s.survey?.problems ?? []).filter(
        (p): p is string => typeof p === 'string' && p.length > 0,
      )

      const improvements = (s.survey?.improvements ?? []).filter(
        (p): p is string => typeof p === 'string' && p.length > 0,
      )

      const photos = (s.survey?.photos ?? []).filter(
        (u): u is string => typeof u === 'string' && u.length > 0,
      )

      result.push({
        systemId: s.system.id,
        villageId: s.system.village_id,
        villageNo: s.village.village_no,
        villageName: s.village.village_name,
        systemName: s.system.system_name,
        systemNo: s.system.system_no,
        lat,
        lng,
        status:
          s.survey?.overall_condition ??
          s.system.overall_condition ??
          'ไม่มีข้อมูล',
        userCount: s.system.user_count ?? 0,
        householdCount:
          s.survey?.household_count ?? s.system.household_count ?? 0,
        tankCapacity: s.survey?.tank_capacity ?? s.system.tank_capacity ?? null,
        waterRate: s.survey?.water_rate ?? s.system.water_rate ?? null,
        productionTypes,
        sufficiency: s.survey?.water_source_sufficiency ?? null,
        operatorName: s.survey?.operator_name ?? null,
        operatorPhone: s.survey?.operator_phone ?? null,
        committee: s.survey?.committee_members ?? [],
        problems,
        improvements,
        photos,
      })
    }

    return result
  }, [filtered])

  const hasFilter = villageFilter !== 'all' || statusFilter !== 'all'

  function clearFilters() {
    setVillageFilter('all')
    setStatusFilter('all')
  }

  const cards = [
    {
      icon: <MapPin size={18} />,
      value: stats.villages,
      label: 'หมู่บ้าน',
      color: 'text-brand-600 bg-brand-50',
    },
    {
      icon: <Droplets size={18} />,
      value: stats.systems,
      label: 'ข้อมูลประปา',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      icon: <Home size={18} />,
      value: stats.households,
      label: 'ครัวเรือน',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      icon: <Package size={18} />,
      value: stats.capacity,
      label: 'ความจุ (ลบ.ม.)',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: <ClipboardList size={18} />,
      value: stats.surveys,
      label: 'แบบสำรวจ',
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  const toggleSlot = (
    <ChartToggle chartMode={chartMode} setChartMode={setChartMode} />
  )

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/30">
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
                ข้อมูลประปาหมู่บ้าน
              </h1>
              <p className="text-[11px] text-brand-100 hidden md:block">
                ทต.ท่าวังทอง · อ.เมืองพะเยา
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 md:gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 transition"
            >
              👤 เจ้าหน้าที่
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-5">
        {/* FILTER + STATS */}
        <div className="card overflow-hidden">
          <div className="p-3.5 border-b border-brand-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-brand-600">
                <Filter size={14} />
                <span className="font-medium">กรองข้อมูล:</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">หมู่บ้าน</label>
                <select
                  value={villageFilter}
                  onChange={e =>
                    setVillageFilter(
                      e.target.value === 'all' ? 'all' : Number(e.target.value),
                    )
                  }
                  className="input text-sm py-1.5 pr-8 min-w-[200px]"
                >
                  <option value="all">ทั้งหมด ({villages.length} หมู่)</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>
                      หมู่ {v.village_no} {v.village_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">สถานะ</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="input text-sm py-1.5 pr-8 min-w-[160px]"
                >
                  <option value="all">ทั้งหมด</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-600 hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              )}

              <div className="text-sm text-brand-700 font-medium ml-auto">
                พบ <span className="font-bold">{filtered.length}</span> ระบบ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-brand-50">
            {cards.map((c, i) => (
              <div key={i} className="p-3.5 hover:bg-brand-50/40 transition">
                <div className="flex items-center gap-2 mb-1">
                  <span className={c.color.split(' ')[0]}>{c.icon}</span>
                  <span className="text-xs text-slate-500">{c.label}</span>
                </div>
                <p className="text-2xl font-bold text-brand-900 leading-none tabular-nums">
                  {c.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CHART + MAP */}
        <div className="grid lg:grid-cols-[minmax(320px,1fr)_2fr] gap-5">
          {chartMode === 'status' ? (
            <StatusChart
              statusCount={statusCount}
              total={stats.systems}
              rightSlot={toggleSlot}
            />
          ) : (
            <VillageStatusChart
              villages={villages}
              systems={filtered}
              rightSlot={toggleSlot}
            />
          )}

          <div className="card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-brand-50">
              <div>
                <h3 className="font-bold text-brand-900">แผนที่ข้อมูลประปา</h3>
                <p className="text-[11px] text-brand-500">
                  💡 เลื่อนเมาส์ชี้ที่หมุดเพื่อดูรายละเอียด
                </p>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center transition shrink-0"
                title={isFullscreen ? 'ออกจากเต็มจอ' : 'ขยายเต็มจอ'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            <div
              ref={mapRef}
              className="flex-1 bg-white"
              style={
                isFullscreen ? { height: '100vh', width: '100vw' } : undefined
              }
            >
              <VillagesMapClient
                markers={markers}
                height={isFullscreen ? 'h-screen' : 'h-[520px]'}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-brand-900 text-brand-100 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <img
            src="/logo.png"
            alt="ตราเทศบาล"
            className="w-11 h-11 rounded-full ring-2 ring-white/20 shrink-0"
          />
          <div className="text-xs md:text-sm leading-snug text-center">
            <p className="font-medium">
              เทศบาลตำบลท่าวังทอง เลขที่ 131 หมู่ที่ 4 ถนนพะเยา-ป่าแดด
            </p>
            <p className="text-brand-300">
              ตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา 56000
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ============================================================ */
/* SUB COMPONENTS                                               */
/* ============================================================ */
function ChartToggle({
  chartMode,
  setChartMode,
}: {
  chartMode: 'status' | 'village'
  setChartMode: (m: 'status' | 'village') => void
}) {
  return (
    <div className="inline-flex bg-slate-100 rounded-lg p-0.5 shadow-sm shrink-0">
      <button
        type="button"
        onClick={() => setChartMode('status')}
        className={`px-2.5 py-1 rounded-md text-[11px] md:text-xs font-medium transition whitespace-nowrap ${
          chartMode === 'status'
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        🍩 สถานะ
      </button>
      <button
        type="button"
        onClick={() => setChartMode('village')}
        className={`px-2.5 py-1 rounded-md text-[11px] md:text-xs font-medium transition whitespace-nowrap ${
          chartMode === 'village'
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        📊 หมู่บ้าน
      </button>
    </div>
  )
}