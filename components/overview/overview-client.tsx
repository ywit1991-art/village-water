'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Filter,
  MapPin,
  Droplets,
  Home,
  Package,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  PieChart,
} from 'lucide-react'
import StatusChart from './status-chart'
import VillageStatusChart from './village-status-chart'
import SufficiencyChart from '@/components/stats/SufficiencyChart'
import VillagesMapClient, {
  type MarkerData,
  type MarkerMode,
} from '@/components/maps/VillagesMapClient'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { NavLink } from '@/components/ui/nav-link'
import type { Village, Survey } from '@/lib/types'
import type { SystemWithContext } from '@/app/overview/page'

const STATUS_OPTIONS = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

type ViewMode = 'map' | 'stats'
type ChartMode = 'status' | 'village' | 'sufficiency'

interface ChartFilter {
  type: 'status' | 'village' | null
  value: string | number | null
}

interface Props {
  villages: Village[]
  systems: SystemWithContext[]
}

export default function OverviewClient({ villages, systems }: Props) {
  const [villageFilter, setVillageFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const [statsFullscreen, setStatsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [chartMode, setChartMode] = useState<ChartMode>('status')
  const [markerMode, setMarkerMode] = useState<MarkerMode>('sufficiency')
  const [chartFilter, setChartFilter] = useState<ChartFilter>({
    type: null,
    value: null,
  })
  const mapRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onFsChange() {
      const el = document.fullscreenElement
      setMapFullscreen(el === mapRef.current)
      setStatsFullscreen(el === statsRef.current)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleMapFullscreen() {
    if (!mapRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      mapRef.current.requestFullscreen()
    }
  }

  function toggleStatsFullscreen() {
    if (!statsRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      statsRef.current.requestFullscreen()
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
    return {
      villages: uniqueVillages,
      systems: totalSystems,
      households: totalHouseholds,
      capacity: totalCapacity,
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

      const totalHP = (s.survey?.pumps ?? []).reduce((sum, p) => {
        const hp = parseFloat(String(p?.hp ?? 0))
        return sum + (isNaN(hp) ? 0 : hp)
      }, 0)

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
        productionCapacity:
          s.survey?.production_capacity ??
          s.system.production_capacity ??
          null,
        totalHP,
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
  const hasAnyFilter = hasFilter || chartFilter.type !== null

  function clearAllFilters() {
    setVillageFilter('all')
    setStatusFilter('all')
    setChartFilter({ type: null, value: null })
  }

  const cards = [
    {
      icon: <MapPin size={16} />,
      value: stats.villages,
      label: 'หมู่บ้าน',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      icon: <Droplets size={16} />,
      value: stats.systems,
      label: 'ระบบประปา',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      icon: <Home size={16} />,
      value: stats.households,
      label: 'ครัวเรือน',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: <Package size={16} />,
      value: stats.capacity,
      label: 'ความจุ (ลบ.ม.)',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  const chartToolbar = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-brand-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setChartMode('status')}
          className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap active:scale-95 ${
            chartMode === 'status'
              ? 'bg-brand-500 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PieChart size={14} />
          <span className="hidden md:inline">สถานะ</span>
        </button>

        <button
          type="button"
          onClick={() => setChartMode('village')}
          className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
            chartMode === 'village'
              ? 'bg-brand-500 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={14} />
          <span className="hidden md:inline">หมู่บ้าน</span>
        </button>

        <button
          type="button"
          onClick={() => setChartMode('sufficiency')}
          className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
            chartMode === 'sufficiency'
              ? 'bg-sky-500 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Droplets size={14} />
          <span className="hidden md:inline">ความเพียงพอ</span>
        </button>
      </div>

      <button
        type="button"
        onClick={toggleStatsFullscreen}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg border border-brand-100 hover:bg-white text-slate-700 hover:text-slate-900 transition active:scale-95 shrink-0"
        title={statsFullscreen ? 'ออกจากเต็มจอ' : 'ขยายเต็มจอ'}
      >
        {statsFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>
  )

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-b from-brand-50 via-brand-50/30 to-white relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-40 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      {/* ⭐ ปรับ max-w-[1600px] เป็น max-w-7xl ให้เท่ากับ Dashboard */}
      <header className="sticky top-0 z-30 bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 text-white shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/40 blur-lg scale-110" />
              <img
                src="/logo.png"
                alt="ตราเทศบาลตำบลท่าวังทอง"
                className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover shadow-lg ring-2 ring-white/40 bg-white/10 p-0.5"
              />
            </div>
            <div>
              <h1 className="font-bold leading-tight text-sm md:text-base">
                ระบบประปาหมู่บ้าน
              </h1>
              <p className="text-[10px] md:text-[11px] text-brand-50 hidden md:block">
                ทต.ท่าวังทอง · อ.เมืองพะเยา
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 md:gap-2">
            <NavLink
              href="/"
              exact
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/15 active:scale-95 transition"
            >
              หน้าหลัก
            </NavLink>
            <NavLink
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium hover:bg-white/15 active:scale-95 transition"
            >
              👤 เจ้าหน้าที่
            </NavLink>
          </nav>
        </div>
      </header>

      {/* ⭐ ปรับ max-w-[1600px] เป็น max-w-7xl และ px-4 py-6 ให้เท่ากับ Dashboard */}
      <main className="flex-1 min-h-0 max-w-7xl mx-auto px-4 py-6 w-full flex flex-col md:flex-row gap-4 relative">
        
        {/* ================= ซ้าย: Sidebar (30%) ================= */}
        <div className="w-full md:w-[30%] lg:w-[32%] flex flex-col gap-2 md:gap-3 shrink-0 md:h-full">
          
          {/* 1. Toggle & Filters Card */}
          <div className="card bg-white/95 backdrop-blur-sm p-3 shadow-sm border border-slate-100 flex flex-col gap-2 shrink-0">
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner w-full">
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs md:text-sm transition-all active:scale-95 ${
                  viewMode === 'map'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <MapPin size={14} />
                แผนที่
              </button>
              <button
                type="button"
                onClick={() => setViewMode('stats')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs md:text-sm transition-all active:scale-95 ${
                  viewMode === 'stats'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <BarChart3 size={14} />
                สถิติ
              </button>
            </div>

            <div className="h-px w-full bg-slate-100" />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-bold text-brand-900 flex items-center gap-1.5">
                  <Filter size={12} />
                  กรองข้อมูล
                </h3>
                {hasAnyFilter && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[10px] md:text-[11px] text-brand-600 hover:underline font-medium active:scale-95 transition"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] md:text-[11px] text-slate-500 font-medium">หมู่บ้าน</label>
                  <select
                    value={villageFilter}
                    onChange={e => {
                      setVillageFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                      setChartFilter({ type: null, value: null })
                    }}
                    className="input text-xs md:text-sm py-1.5 px-2 md:px-3 w-full"
                  >
                    <option value="all">ทั้งหมด ({villages.length} หมู่)</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>หมู่ {v.village_no} {v.village_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] md:text-[11px] text-slate-500 font-medium">สถานะ</label>
                  <select
                    value={statusFilter}
                    onChange={e => {
                      setStatusFilter(e.target.value)
                      setChartFilter({ type: null, value: null })
                    }}
                    className="input text-xs md:text-sm py-1.5 px-2 md:px-3 w-full"
                  >
                    <option value="all">ทั้งหมด</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {chartFilter.type && (
                  <div className="pt-0.5">
                    <button
                      onClick={() => setChartFilter({ type: null, value: null })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-100 text-brand-800 text-[10px] md:text-xs font-medium hover:bg-brand-200 active:scale-95 transition w-full justify-center"
                    >
                      🎯 {chartFilter.type === 'status' ? chartFilter.value : `หมู่ ${chartFilter.value}`}
                      <span className="text-brand-500 ml-1">×</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-slate-100" />

            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 w-full border border-brand-100">
              <TrendingUp size={14} />
              <span className="text-xs font-semibold whitespace-nowrap">
                พบ {filtered.length} ระบบ
              </span>
            </div>
          </div>

          {/* 2. Stats Grid 2x2 */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 md:flex-1 min-h-[160px]">
            {cards.map((c, i) => (
              <div 
                key={i} 
                className="card p-3 md:p-4 hover:bg-brand-50/60 transition-all group cursor-pointer border border-slate-100 bg-white/90 backdrop-blur-sm flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="text-[11px] md:text-sm text-slate-500 font-medium pt-0.5 truncate">
                    {c.label}
                  </span>
                  <div className={`w-7 h-7 md:w-9 md:h-9 shrink-0 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${c.bg} ${c.color}`}>
                    <span className="scale-110 md:scale-125">{c.icon}</span>
                  </div>
                </div>
                
                <p className="text-xl md:text-3xl lg:text-4xl font-extrabold text-brand-900 leading-none tabular-nums mt-4 md:mt-auto">
                  <AnimatedCounter value={c.value} />
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* ================= ขวา: เนื้อหา (70%) ================= */}
        <div className="w-full md:w-[70%] lg:w-[68%] flex flex-col flex-1 min-h-[500px] md:min-h-0 relative">
          
          {/* Map View */}
          {viewMode === 'map' && (
            <div
              ref={mapRef}
              className="card overflow-hidden shadow-md w-full h-[500px] md:h-full relative bg-white animate-in fade-in duration-300"
            >
              <div className="absolute inset-0">
                <VillagesMapClient
                  markers={markers}
                  height="h-full"
                  isFullscreen={mapFullscreen}
                  onToggleFullscreen={toggleMapFullscreen}
                  markerMode={markerMode}
                  onMarkerModeChange={setMarkerMode}
                  fullscreenRef={mapRef}
                />
              </div>
            </div>
          )}

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div
              ref={statsRef}
              className={
                statsFullscreen
                  ? 'fixed inset-0 z-[9999] bg-slate-50 overflow-y-auto p-4 md:p-8 flex flex-col w-full h-full animate-in fade-in duration-300'
                  : 'w-full h-full flex flex-col animate-in fade-in duration-300'
              }
            >
              <div className="w-full flex-1 relative flex flex-col min-h-0">
                {chartMode === 'status' && (
                  <StatusChart
                    statusCount={statusCount}
                    total={stats.systems}
                    rightSlot={chartToolbar}
                    activeStatus={chartFilter.type === 'status' ? (chartFilter.value as string) : null}
                    onStatusClick={status => {
                      setChartFilter(prev => prev.type === 'status' && prev.value === status ? { type: null, value: null } : { type: 'status', value: status })
                      if (!statsFullscreen) setViewMode('map')
                    }}
                    isFullscreen={statsFullscreen}
                  />
                )}
                {chartMode === 'village' && (
                  <VillageStatusChart
                    villages={villages}
                    systems={filtered}
                    rightSlot={chartToolbar}
                    activeVillage={chartFilter.type === 'village' ? (chartFilter.value as number) : null}
                    onVillageClick={villageId => {
                      setChartFilter(prev => prev.type === 'village' && prev.value === villageId ? { type: null, value: null } : { type: 'village', value: villageId })
                      if (!statsFullscreen) setViewMode('map')
                    }}
                    isFullscreen={statsFullscreen}
                  />
                )}
                {chartMode === 'sufficiency' && (
                  <SufficiencyChart
                    markers={markers}
                    rightSlot={chartToolbar}
                    isFullscreen={statsFullscreen}
                  />
                )}
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* ⭐ ปรับ max-w-[1600px] เป็น max-w-7xl ให้เท่ากับ Dashboard */}
      {!statsFullscreen && !mapFullscreen && (
        <footer className="relative bg-gradient-to-r from-brand-800 to-brand-900 text-brand-100 py-2 md:py-3 mt-auto z-10 shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
            <img
              src="/logo.png"
              alt="ตราเทศบาล"
              className="w-7 h-7 md:w-9 md:h-9 rounded-full ring-2 ring-white/20 shrink-0"
            />
            <div className="text-[10px] md:text-xs leading-snug text-center">
              <p className="font-medium">
                เทศบาลตำบลท่าวังทอง เลขที่ 131 หมู่ที่ 4 ถนนพะเยา-ปาแดด
              </p>
              <p className="text-brand-300">
                ตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา 56000
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}