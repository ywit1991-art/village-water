'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import StatusStats from './status-stats'
import SystemList from './system-list'
import type { WaterSystemWithVillage, Village } from '@/lib/types'

interface Props {
  systems: WaterSystemWithVillage[]
  villages: Village[]
  counts: Record<string, number>
  totalUsers: number
  totalHouseholds: number
  activeFilter: string | null
  onFilterChange: (s: string | null) => void
  selectedId: number | null
  onSelect: (id: number) => void
  isOpen: boolean
  onClose: () => void
}

export default function MapSidebar({
  systems,
  villages,
  counts,
  totalUsers,
  totalHouseholds,
  activeFilter,
  onFilterChange,
  selectedId,
  onSelect,
  isOpen,
  onClose,
}: Props) {
  const [query, setQuery] = useState('')
  const [villageFilter, setVillageFilter] = useState<number | null>(null)

  const filtered = systems.filter(s => {
    if (activeFilter && (s.overall_condition ?? 'ไม่มีข้อมูล') !== activeFilter)
      return false
    if (villageFilter && s.village_id !== villageFilter) return false
    if (query) {
      const q = query.toLowerCase()
      if (
        !s.system_name.toLowerCase().includes(q) &&
        !s.village.village_name.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-[1100] md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-[1200] md:z-10 w-80 bg-brand-50/60 md:bg-transparent border-r border-brand-100 flex flex-col transition-transform md:transition-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-brand-100">
          <span className="font-bold text-brand-900">ข้อมูลระบบประปา</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400"
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อระบบ/หมู่บ้าน..."
              className="input pl-8 text-sm"
            />
          </div>

          <select
            value={villageFilter ?? ''}
            onChange={e =>
              setVillageFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="input text-sm"
          >
            <option value="">— ทุกหมู่บ้าน —</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>
                หมู่ {v.village_no} {v.village_name}
              </option>
            ))}
          </select>

          <StatusStats
            totalSystems={systems.length}
            totalUsers={totalUsers}
            totalHouseholds={totalHouseholds}
            counts={counts}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />

          <div>
            <p className="text-xs font-semibold text-brand-500 mb-2 px-1">
              รายชื่อระบบ ({filtered.length})
            </p>
            <SystemList
              systems={filtered}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>
        </div>
      </aside>
    </>
  )
}