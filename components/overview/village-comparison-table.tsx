'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { Village, Survey, WaterSystem } from '@/lib/types'

interface Row {
  village: Village
  systems: WaterSystem[]
  latestSurvey: Survey | null
}

interface Props {
  rows: Row[]
  latestBySystem: Map<number, Survey>
}

type SortKey = 'no' | 'systems' | 'households' | 'status'

const STATUS_ORDER: Record<string, number> = {
  เร่งด่วน: 0,
  ต้องปรับปรุง: 1,
  พอใช้: 2,
  ดี: 3,
  ไม่มีข้อมูล: 4,
}

export default function VillageComparisonTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('no')
  const [asc, setAsc] = useState(true)

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0

    if (sortKey === 'no') cmp = a.village.village_no - b.village.village_no
    else if (sortKey === 'systems') cmp = a.systems.length - b.systems.length
    else if (sortKey === 'households') {
      const ah = a.systems.reduce((s, x) => s + (x.household_count ?? 0), 0)
      const bh = b.systems.reduce((s, x) => s + (x.household_count ?? 0), 0)
      cmp = ah - bh
    } else if (sortKey === 'status') {
      const aa = Math.min(
        ...a.systems.map(
          s => STATUS_ORDER[s.overall_condition ?? 'ไม่มีข้อมูล'] ?? 9,
        ),
        STATUS_ORDER['ไม่มีข้อมูล'],
      )
      const bb = Math.min(
        ...b.systems.map(
          s => STATUS_ORDER[s.overall_condition ?? 'ไม่มีข้อมูล'] ?? 9,
        ),
        STATUS_ORDER['ไม่มีข้อมูล'],
      )
      cmp = aa - bb
    }

    return asc ? cmp : -cmp
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc(!asc)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-brand-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-900">
          ตารางเปรียบเทียบ 14 หมู่บ้าน
        </h2>
        <p className="text-xs text-brand-500">คลิกหัวตารางเพื่อเรียงลำดับ</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-700">
            <tr>
              <th className="p-3 text-left w-20">
                <button
                  onClick={() => toggleSort('no')}
                  className="inline-flex items-center gap-1 hover:text-brand-900"
                >
                  หมู่ที่
                  {sortKey === 'no' ? (
                    asc ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </button>
              </th>
              <th className="p-3 text-left">หมู่บ้าน</th>
              <th className="p-3 text-center w-24">
                <button
                  onClick={() => toggleSort('systems')}
                  className="inline-flex items-center gap-1 hover:text-brand-900"
                >
                  ข้อมูล
                  {sortKey === 'systems' ? (
                    asc ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </button>
              </th>
              <th className="p-3 text-right w-28">
                <button
                  onClick={() => toggleSort('households')}
                  className="inline-flex items-center gap-1 hover:text-brand-900"
                >
                  ครัวเรือน
                  {sortKey === 'households' ? (
                    asc ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </button>
              </th>
              <th className="p-3 text-left w-64">
                <button
                  onClick={() => toggleSort('status')}
                  className="inline-flex items-center gap-1 hover:text-brand-900"
                >
                  สถานะ
                  {sortKey === 'status' ? (
                    asc ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => {
              const households = row.systems.reduce(
                (s, x) => s + (x.household_count ?? 0),
                0,
              )

              const statusList = row.systems.map(
                s => s.overall_condition ?? 'ไม่มีข้อมูล',
              )
              const noData = statusList.length === 0

              return (
                <tr
                  key={row.village.id}
                  className="border-t border-brand-50 hover:bg-brand-50/40"
                >
                  <td className="p-3 text-brand-600 font-medium">
                    {row.village.village_no}
                  </td>
                  <td className="p-3 font-medium text-brand-900">
                    {row.village.village_name}
                  </td>
                  <td className="p-3 text-center">
                    {row.systems.length === 0 ? (
                      <span className="text-slate-400">–</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                        {row.systems.length}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums text-slate-700">
                    {households > 0 ? households.toLocaleString() : '–'}
                  </td>
                  <td className="p-3">
                    {noData ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        ❔ ยังไม่มีข้อมูล
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {statusList
                          .sort(
                            (a, b) =>
                              (STATUS_ORDER[a] ?? 9) - (STATUS_ORDER[b] ?? 9),
                          )
                          .map((st, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                background: `${STATUS_COLORS[st].hex}20`,
                                color: STATUS_COLORS[st].hex,
                              }}
                            >
                              {STATUS_EMOJI[st]} {st}
                            </span>
                          ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}