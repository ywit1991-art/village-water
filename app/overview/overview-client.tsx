'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Filter,
  MapPin,
  Droplets,
  Home,
  Package,
  ClipboardList,
} from 'lucide-react'
import StatusChart from './status-chart'
import VillageComparisonTable from './village-comparison-table'
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

  // ===== กรองระบบตาม filter =====
  const filtered = useMemo(() => {
    return systems.filter(s => {
      if (villageFilter !== 'all' && s.system.village_id !== villageFilter)
        return false
      const condition =
        s.survey?.overall_condition ??
        s.system.overall_condition ??
        'ไม่มีข้อมูล'
      if (statusFilter !== 'all' && condition !== statusFilter) return false
      return true
    })
  }, [systems, villageFilter, statusFilter])

  // ===== Stats =====
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

  // ===== Status count =====
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

  // ===== Marker data =====
  const markers: MarkerData[] = useMemo(() => {
    return filtered
      .map(s => {
        const lat = s.survey?.lat ?? s.system.lat
        const lng = s.survey?.lng ?? s.system.lng
        if (!lat || !lng) return null

        return {
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
          productionTypes: (s.survey?.production_type ?? []).filter(
            (t): t is string => typeof t === 'string' && t.length > 0,
          ),
          sufficiency: s.survey?.water_source_sufficiency ?? null,
          operatorName: s.survey?.operator_name ?? null,
          operatorPhone: s.survey?.operator_phone ?? null,
          committee: s.survey?.committee_members ?? [],
          problems: (s.survey?.problems ?? []).filter(
            (p): p is string => typeof p === 'string' && p.length > 0,
          ),
          photos: (s.survey?.photos ?? []).filter(
            (u): u is string => typeof u === 'string' && u.length > 0,
          ),
        }
      })
      .filter((x): x is MarkerData => x !== null)
  }, [filtered])

  // ===== ตารางเปรียบเทียบ =====
  const rows = useMemo(() => {
    const villageIds = new Set(filtered.map(s => s.system.village_id))
    const filteredVillages = villages.filter(v => villageIds.has(v.id))

    const targetVillages =
      villageFilter === 'all'
        ? filteredVillages
        : filteredVillages.filter(v => v.id === villageFilter)

    return targetVillages.map(v => {
      const vSystems = filtered.filter(s => s.system.village_id === v.id)
      const latestSurvey =
        vSystems
          .map(s => s.survey)
          .filter((x): x is Survey => x !== null)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0] ?? null

      return {
        village: v,
        systems: vSystems.map(s => s.system),
        latestSurvey,
      }
    })
  }, [filtered, villages, villageFilter])

  const latestBySystem = useMemo(() => {
    const map = new Map<number, Survey>()
    filtered.forEach(s => {
      if (s.survey) map.set(s.system.id, s.survey)
    })
    return map
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
      label: 'ระบบประปา',
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
      label: 'ความจุรวม (ลบ.ม.)',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: <ClipboardList size={18} />,
      value: stats.surveys,
      label: 'แบบสำรวจ',
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/30">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ตราเทศบาล"
              className="w-10 h-10 rounded-xl ring-2 ring-white/30"
            />
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
        {/* ===== FILTER BAR ===== */}
        <div className="card p-4">
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
                className="text-xs text-brand-600 hover:underline ml-auto"
              >
                ล้างตัวกรอง
              </button>
            )}

            <div
              className={`text-sm text-brand-700 font-medium ${
                hasFilter ? 'ml-4' : 'ml-auto'
              }`}
            >
              พบ <span className="font-bold">{filtered.length}</span> ระบบ
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="card p-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-900 leading-tight">
                    {c.value.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-brand-600">{c.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== CHART + MAP ===== */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-5">
          <StatusChart statusCount={statusCount} total={stats.systems} />
          <div className="card p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-bold text-brand-900">
                แผนที่ระบบประปา
              </h3>
              <p className="text-[11px] text-brand-500">
                💡 เลื่อนเมาส์ชี้ที่หมุดเพื่อดูรายละเอียด
              </p>
            </div>
            <VillagesMapClient markers={markers} height="h-[420px]" />
          </div>
        </div>

        {/* ===== COMPARISON TABLE ===== */}
        <VillageComparisonTable rows={rows} latestBySystem={latestBySystem} />
      </main>

      <footer className="bg-brand-900 text-brand-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="ตราเทศบาล"
            className="w-10 h-10 rounded-full ring-2 ring-white/20"
          />
          <p className="text-sm text-center">
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </p>
        </div>
      </footer>
    </div>
  )
}