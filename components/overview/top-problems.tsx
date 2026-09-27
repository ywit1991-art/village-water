'use client'

import { AlertTriangle } from 'lucide-react'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { Village, WaterSystem } from '@/lib/types'

interface Props {
  systems: WaterSystem[]
  villages: Village[]
}

export default function TopProblems({ systems, villages }: Props) {
  const villageMap = new Map<number, Village>()
  villages.forEach(v => villageMap.set(v.id, v))

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-orange-500" />
        <h2 className="text-lg font-bold text-brand-900">
          ระบบที่ต้องแก้ไขเร่งด่วน
        </h2>
      </div>

      {systems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            ไม่มีระบบที่ต้องแก้ไขเร่งด่วน
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ทุกระบบมีสถานะ "ดี" หรือ "พอใช้"
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {systems.map((s, i) => {
            const v = villageMap.get(s.village_id)
            const c = STATUS_COLORS[s.overall_condition ?? 'ไม่มีข้อมูล']
            return (
              <div
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-brand-100 hover:bg-brand-50/40 transition"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: c.hex }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-brand-900 truncate">
                    {s.system_name}
                  </p>
                  <p className="text-[11px] text-brand-500 mt-0.5">
                    หมู่ {v?.village_no} {v?.village_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: `${c.hex}20`,
                        color: c.hex,
                      }}
                    >
                      {STATUS_EMOJI[s.overall_condition ?? '']}{' '}
                      {s.overall_condition}
                    </span>
                  </div>
                </div>
                <a
                  href={`/villages/${s.village_id}`}
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-medium shrink-0 mt-1"
                >
                  ดู →
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}