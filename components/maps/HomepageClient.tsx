'use client'

import { useState, useMemo } from 'react'
import { Filter, MapPin, Users, Home, ClipboardList } from 'lucide-react'
import VillagesMapClient, { type MarkerData } from './VillagesMapClient'

const STATUS_OPTIONS = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

interface Props {
  markers: MarkerData[]
  totalVillages: number
}

export default function HomepageClient({ markers, totalVillages }: Props) {
  const [villageFilter, setVillageFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // หมู่บ้านที่มีใน markers
  const villages = useMemo(() => {
    const map = new Map<number, { id: number; no: number; name: string }>()
    markers.forEach(m => {
      if (!map.has(m.villageId)) {
        map.set(m.villageId, {
          id: m.villageId,
          no: m.villageNo,
          name: m.villageName,
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.no - b.no)
  }, [markers])

  // กรอง markers ตาม filter
  const filtered = useMemo(() => {
    return markers.filter(m => {
      if (villageFilter !== 'all' && m.villageId !== villageFilter) return false
      if (statusFilter !== 'all' && m.status !== statusFilter) return false
      return true
    })
  }, [markers, villageFilter, statusFilter])

  // Stats — คำนวณจาก filtered
  const stats = useMemo(() => {
    const uniqueVillages = new Set(filtered.map(m => m.villageId)).size
    const totalSystems = filtered.length
    const totalHouseholds = filtered.reduce(
      (a, m) => a + (m.householdCount ?? 0),
      0,
    )
    const totalSurveys = filtered.filter(m => m.status !== 'ไม่มีข้อมูล').length

    return {
      villages: uniqueVillages,
      systems: totalSystems,
      households: totalHouseholds,
      surveys: totalSurveys,
    }
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
      color: 'text-brand-600 bg-brand-50',
    },
    {
      icon: <Users size={20} />,
      value: stats.systems,
      label: 'ข้อมูลประปา',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      icon: <Home size={20} />,
      value: stats.households,
      label: 'ครัวเรือน',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      icon: <ClipboardList size={20} />,
      value: stats.surveys,
      label: 'แบบสำรวจ',
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  return (
    <>
      {/* ===== STATS (อัปเดตตาม filter) ===== */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="card p-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-brand-900 leading-tight">
                    {c.value.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-brand-600">{c.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FILTERS (เหมือน overview) ===== */}
      <section className="max-w-7xl mx-auto px-4 mt-4 w-full">
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <Filter size={14} />
              <span className="font-medium">กรองข้อมูล:</span>
            </div>

            {/* หมู่บ้าน */}
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
                    หมู่ {v.no} {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* สถานะ */}
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

            {/* ล้างตัวกรอง */}
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
              พบ <span className="font-bold">{filtered.length}</span> ข้อมูล
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <MapSection markers={filtered} />
      </section>
    </>
  )
}

function MapSection({ markers }: { markers: MarkerData[] }) {
  return <VillagesMapClient markers={markers} />
}