'use client'

import { STATUS_COLORS } from '@/lib/constants'
import type { WaterSystemWithVillage } from '@/lib/types'
import { MapPin, Users } from 'lucide-react'

interface Props {
  systems: WaterSystemWithVillage[]
  selectedId: number | null
  onSelect: (id: number) => void
}

const ORDER: Record<string, number> = {
  เร่งด่วน: 0,
  ต้องปรับปรุง: 1,
  พอใช้: 2,
  ดี: 3,
  ไม่มีข้อมูล: 4,
}

export default function SystemList({ systems, selectedId, onSelect }: Props) {
  const sorted = [...systems].sort((a, b) => {
    const ao = ORDER[a.overall_condition ?? 'ไม่มีข้อมูล'] ?? 99
    const bo = ORDER[b.overall_condition ?? 'ไม่มีข้อมูล'] ?? 99
    if (ao !== bo) return ao - bo
    return (b.user_count ?? 0) - (a.user_count ?? 0)
  })

  if (sorted.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-brand-400">
        ไม่พบข้อมูลตามเงื่อนไข
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map(s => {
        const c = STATUS_COLORS[s.overall_condition ?? 'ไม่มีข้อมูล']
        const active = selectedId === s.id

        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left card p-3 transition hover:shadow-md ${
              active ? 'ring-2 ring-brand-400 bg-brand-50/50' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className="w-3 h-3 mt-1 rounded-full border-2 border-white shadow shrink-0"
                style={{ background: c.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-brand-900 truncate">
                  {s.system_name}
                </p>
                <p className="text-[11px] text-brand-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  หมู่ {s.village.village_no} {s.village.village_name}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5">
                    <Users size={10} />
                    {s.user_count} ราย
                  </span>
                  <span className={`px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
                    {s.overall_condition ?? 'ไม่มีข้อมูล'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}