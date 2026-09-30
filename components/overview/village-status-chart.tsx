'use client'

import { STATUS_COLORS } from '@/lib/constants'
import type { Village } from '@/lib/types'
import type { SystemWithContext } from '@/app/overview/page'
import type { ReactNode } from 'react'

const STATUS_ORDER = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

interface Props {
  villages: Village[]
  systems: SystemWithContext[]
  rightSlot?: ReactNode
}

interface VillageStats {
  village: Village
  counts: Record<string, number>
  total: number
}

export default function VillageStatusChart({
  villages,
  systems,
  rightSlot,
}: Props) {
  const stats: VillageStats[] = villages
    .map(v => {
      const vSystems = systems.filter(s => s.system.village_id === v.id)
      const counts: Record<string, number> = {
        'ดี': 0,
        'พอใช้': 0,
        'ต้องปรับปรุง': 0,
        'เร่งด่วน': 0,
        'ไม่มีข้อมูล': 0,
      }
      vSystems.forEach(s => {
        const k =
          s.survey?.overall_condition ??
          s.system.overall_condition ??
          'ไม่มีข้อมูล'
        counts[k] = (counts[k] ?? 0) + 1
      })
      return {
        village: v,
        counts,
        total: vSystems.length,
      }
    })
    .filter(s => s.total > 0)
    .sort((a, b) => a.village.village_no - b.village.village_no)

  const maxTotal = Math.max(...stats.map(s => s.total), 1)

  if (stats.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-brand-900">
            สถานะแยกตามหมู่บ้าน
          </h2>
          {rightSlot}
        </div>
        <p className="text-sm text-brand-400 text-center py-10">
          ยังไม่มีข้อมูลข้อมูลประปา
        </p>
      </div>
    )
  }

  const totals: Record<string, number> = {
    'ดี': 0,
    'พอใช้': 0,
    'ต้องปรับปรุง': 0,
    'เร่งด่วน': 0,
    'ไม่มีข้อมูล': 0,
  }
  stats.forEach(s => {
    STATUS_ORDER.forEach(k => {
      totals[k] += s.counts[k] ?? 0
    })
  })
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  return (
    <div className="card p-6 flex flex-col">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-brand-900">
          สถานะแยกตามหมู่บ้าน
        </h2>
        {rightSlot}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5 pb-4 border-b border-brand-50">
        {STATUS_ORDER.map(k => {
          const c = STATUS_COLORS[k]
          const count = totals[k]
          if (count === 0) return null
          const pct =
            grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0
          return (
            <div key={k} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3 h-3 rounded-sm border border-white shadow"
                style={{ background: c.hex }}
              />
              <span className="text-slate-600">{k}</span>
              <span className="font-bold text-brand-900 tabular-nums">
                {count}
              </span>
              <span className="text-slate-400">({pct}%)</span>
            </div>
          )
        })}
      </div>

      {/* Bars */}
      <div
        className="space-y-3.5 overflow-y-auto pr-1"
        style={{ maxHeight: '380px' }}
      >
        {stats.map(({ village, counts, total }) => {
          const scalePct = (total / maxTotal) * 100

          return (
            <div key={village.id} className="flex items-center gap-3">
              <div className="w-24 md:w-28 shrink-0 text-right">
                <p className="text-xs font-semibold text-brand-700 truncate leading-tight">
                  หมู่ {village.village_no}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">
                  {village.village_name}
                </p>
              </div>

              <div className="flex-1 min-w-0">
                <div className="relative h-7 bg-slate-50 rounded-md overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full flex"
                    style={{ width: `${scalePct}%` }}
                  >
                    {STATUS_ORDER.map(k => {
                      const count = counts[k] ?? 0
                      if (count === 0) return null
                      const segPct = (count / total) * 100
                      const c = STATUS_COLORS[k]
                      return (
                        <div
                          key={k}
                          className="h-full flex items-center justify-center text-[10px] font-bold text-white transition hover:brightness-110"
                          style={{
                            width: `${segPct}%`,
                            background: c.hex,
                          }}
                          title={`${k}: ${count} ข้อมูล`}
                        >
                          {count >= 1 && segPct >= 15 && count}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="w-10 shrink-0 text-right">
                <p className="text-sm font-bold text-brand-900 tabular-nums">
                  {total}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-brand-50 text-xs text-slate-500 flex items-center justify-between">
        <span>รวม {stats.length} หมู่บ้าน</span>
        <span className="font-semibold text-brand-700">
          {grandTotal} ข้อมูล
        </span>
      </div>
    </div>
  )
}