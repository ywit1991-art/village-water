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
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import StatusChart from './status-chart'
import VillageStatusChart from './village-status-chart'
import SufficiencyChart from '@/components/stats/SufficiencyChart'
import VillagesMapClient, {
  type MarkerData,
} from '@/components/maps/VillagesMapClient'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import type { Village, Survey } from '@/lib/types'
import type { SystemWithContext } from '@/app/overview/page'

const STATUS_OPTIONS = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

type ViewMode = 'map' | 'stats'
type ChartMode = 'status' | 'village' | 'sufficiency'

interface Props {
  villages: Village[]
  systems: SystemWithContext[]
}

export default function OverviewClient({ villages, systems }: Props) {
  const [villageFilter, setVillageFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [chartMode, setChartMode] = useState<ChartMode>('status')
  const [chartFilter, setChartFilter] = useState<{
    type: 'status' | 'village' | null
    value: string | number | null
  }>({ type: null, value: null })
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
      // chart filter
      if (chartFilter.type === 'status' && condition !== chartFilter.value)
        return false
      if (
        chartFilter.type === 'village' &&
        s.system.village_id !== chartFilter.value
      )
        return false
      return true
    })
  }, [systems, villageFilter, statusFilter, chartFilter])

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
        waterRateType: s.survey?.water_rate_type ?? null,
        waterRateTiers: Array.isArray(s.survey?.water_rate_tiers)
          ? s.survey.water_rate_tiers.map(t => ({
              from: t.from,
              to: t.to,
              rate: t.rate,
              label: t.label,
            }))
          : null,
        productionTypes,
        sufficiency: s.survey?.water_source_sufficiency ?? null,
        operatorName: s.survey?.operator_name ?? null,
        operatorPhone: s.survey?.operator_phone ?? null,
        surveyDate: s.survey?.survey_date ?? null,
        updatedAt: s.survey?.updated_at ?? null,
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
      icon: <MapPin size={20} />,
      value: stats.villages,
      label: 'หมู่บ้าน',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      icon: <Droplets size={20} />,
      value: stats.systems,
      label: 'ระบบประปา',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      icon: <Home size={20} />,
      value: stats.households,
      label: 'ครัวเรือน',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: <Package size={20} />,
      value: stats.capacity,
      label: 'ความจุ (ลบ.ม.)',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: <ClipboardList size={20} />,
      value: stats.surveys,
      label: 'แบบสำรวจ',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/30">
      {/* ============================ */}
      {/* HEADER                        */}
      {/* ============================ */}
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
                ระบบประปาหมู่บ้าน
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
        {/* ============================ */}
        {/* FILTER + STATS                */}
        {/* ============================ */}
                <div className="card overflow-hidden shadow-md">
          {/* Filter */}
          <div className="p-4 bg-gradient-to-r from-brand-50/60 to-white border-b border-brand-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Filter size={16} />
                <span>กรองข้อมูล</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  หมู่บ้าน
                </label>
                <select
                  value={villageFilter}
                  onChange={e => {
                    setVillageFilter(
                      e.target.value === 'all' ? 'all' : Number(e.target.value),
                    )
                    setChartFilter({ type: null, value: null })
                  }}
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
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  สถานะ
                </label>
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value)
                    setChartFilter({ type: null, value: null })
                  }}
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

              {chartFilter.type && (
                <button
                  onClick={() => setChartFilter({ type: null, value: null })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-100 text-brand-800 text-xs font-medium hover:bg-brand-200 transition"
                >
                  🎯{' '}
                  {chartFilter.type === 'status'
                    ? chartFilter.value
                    : `หมู่ ${chartFilter.value}`}
                  <span className="text-brand-500 ml-1">×</span>
                </button>
              )}

              {(hasFilter || chartFilter.type) && (
                <button
                  onClick={() => {
                    clearFilters()
                    setChartFilter({ type: null, value: null })
                  }}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  ล้างตัวกรอง
                </button>
              )}

              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-100 text-brand-800">
                <TrendingUp size={14} />
                <span className="text-xs font-semibold">
                  พบ {filtered.length} ระบบ
                </span>
              </div>
            </div>
          </div>
          {/* Filter */}
          <div className="p-4 bg-gradient-to-r from-brand-50/60 to-white border-b border-brand-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Filter size={16} />
                <span>กรองข้อมูล</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  หมู่บ้าน
                </label>
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
                <label className="text-xs text-slate-500 whitespace-nowrap">
                  สถานะ
                </label>
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
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  ล้างตัวกรอง
                </button>
              )}

              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-100 text-brand-800">
                <TrendingUp size={14} />
                <span className="text-xs font-semibold">
                  พบ {filtered.length} ระบบ
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-brand-50">
            {cards.map((c, i) => (
              <div
                key={i}
                className="p-4 hover:bg-brand-50/60 transition-all group cursor-default"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${c.bg} ${c.color}`}
                  >
                    {c.icon}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {c.label}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-brand-900 leading-none tabular-nums">
                  <AnimatedCounter value={c.value} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================ */}
        {/* MAIN TABS                     */}
        {/* ============================ */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white shadow-sm border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'map'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin size={16} />
              แผนที่
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stats')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'stats'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={16} />
              สถิติ
            </button>
          </div>

          {viewMode === 'stats' && (
            <div className="inline-flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                ดูสถิติ:
              </span>
              <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
                {(
                  [
                    { key: 'status', label: '🍩 สถานะ' },
                    { key: 'village', label: '📊 หมู่บ้าน' },
                    { key: 'sufficiency', label: '💧 ความเพียงพอ' },
                  ] as const
                ).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setChartMode(t.key)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                      chartMode === t.key
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================ */}
        {/* VIEW: แผนที่                  */}
        {/* ============================ */}
        {viewMode === 'map' && (
          <div className="card overflow-hidden flex flex-col shadow-md">
            <div className="flex items-center justify-between p-4 border-b border-brand-50 bg-gradient-to-r from-sky-50/60 to-white">
              <div>
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <MapPin size={18} className="text-sky-600" />
                  แผนที่ระบบประปา
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  💡 เลื่อนเมาส์ชี้ที่หมุดเพื่อดูรายละเอียด ·{' '}
                  <span className="font-semibold text-sky-700">
                    {markers.length} ระบบ
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-700 hover:text-sky-700 flex items-center justify-center transition shrink-0"
                title={isFullscreen ? 'ออกจากเต็มจอ' : 'ขยายเต็มจอ'}
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            </div>

            <div
              ref={mapRef}
              className="flex-1 bg-white"
              style={
                isFullscreen
                  ? { height: '100vh', width: '100vw' }
                  : undefined
              }
            >
              <VillagesMapClient
                markers={markers}
                height={isFullscreen ? 'h-screen' : 'h-[700px]'}
              />
            </div>
          </div>
        )}

        {/* ============================ */}
        {/* VIEW: สถิติ                   */}
        {/* ============================ */}
        {viewMode === 'stats' && (
          <div>
            {chartMode === 'status' && (
              <StatusChart
                statusCount={statusCount}
                total={stats.systems}
                activeStatus={
                  chartFilter.type === 'status'
                    ? (chartFilter.value as string)
                    : null
                }
                onStatusClick={status => {
                  setChartFilter(prev =>
                    prev.type === 'status' && prev.value === status
                      ? { type: null, value: null }
                      : { type: 'status', value: status },
                  )
                  setViewMode('map')
                }}
              />
            )}
            {chartMode === 'village' && (
              <VillageStatusChart
                villages={villages}
                systems={filtered}
                activeVillage={
                  chartFilter.type === 'village'
                    ? (chartFilter.value as number)
                    : null
                }
                onVillageClick={villageId => {
                  setChartFilter(prev =>
                    prev.type === 'village' && prev.value === villageId
                      ? { type: null, value: null }
                      : { type: 'village', value: villageId },
                  )
                  setViewMode('map')
                }}
              />
            )}
            {chartMode === 'sufficiency' && (
              <SufficiencyChart markers={markers} />
            )}
          </div>
        )}
      </main>

      {/* ============================ */}
      {/* FOOTER                        */}
      {/* ============================ */}
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