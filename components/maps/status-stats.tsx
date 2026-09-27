'use client'

import { Users, Home, MapPin } from 'lucide-react'
import { STATUS_COLORS } from '@/lib/constants'

interface Props {
  totalSystems: number
  totalUsers: number
  totalHouseholds: number
  counts: Record<string, number>
  activeFilter: string | null
  onFilterChange: (status: string | null) => void
}

export default function StatusStats({
  totalSystems,
  totalUsers,
  totalHouseholds,
  counts,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="card p-3">
        <p className="text-xs font-semibold text-brand-500 mb-2">ภาพรวม</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="w-6 h-6 mx-auto rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-1">
              <MapPin size={12} />
            </div>
            <p className="text-base font-bold text-brand-900">{totalSystems}</p>
            <p className="text-[10px] text-brand-500">จุด</p>
          </div>
          <div>
            <div className="w-6 h-6 mx-auto rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-1">
              <Users size={12} />
            </div>
            <p className="text-base font-bold text-brand-900">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-[10px] text-brand-500">ราย</p>
          </div>
          <div>
            <div className="w-6 h-6 mx-auto rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-1">
              <Home size={12} />
            </div>
            <p className="text-base font-bold text-brand-900">
              {totalHouseholds.toLocaleString()}
            </p>
            <p className="text-[10px] text-brand-500">ครัวเรือน</p>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <p className="text-xs font-semibold text-brand-500 mb-2">
          สถานะระบบประปา
        </p>
        <div className="space-y-1">
          {Object.keys(STATUS_COLORS).map(key => {
            const c = STATUS_COLORS[key]
            const count = counts[key] ?? 0
            const active = activeFilter === key
            const pct =
              totalSystems > 0 ? Math.round((count / totalSystems) * 100) : 0

            return (
              <button
                key={key}
                onClick={() => onFilterChange(active ? null : key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition ${
                  active
                    ? 'bg-brand-100 ring-1 ring-brand-300'
                    : 'hover:bg-brand-50'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border-2 border-white shadow shrink-0"
                  style={{ background: c.hex }}
                />
                <span className="text-xs text-slate-700 flex-1">{key}</span>
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {count}
                </span>
                <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">
                  {pct}%
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}