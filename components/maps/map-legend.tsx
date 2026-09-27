'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { STATUS_COLORS } from '@/lib/constants'

interface Props {
  counts: Record<string, number>
  activeFilter: string | null
  onFilterChange: (status: string | null) => void
}

export default function MapLegend({
  counts,
  activeFilter,
  onFilterChange,
}: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-64 bg-white/95 backdrop-blur rounded-xl border border-brand-100 shadow-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-brand-50/80 hover:bg-brand-100/80 transition"
      >
        <span className="text-xs font-bold text-brand-800">คำอธิบาย</span>
        {open ? (
          <ChevronDown size={14} className="text-brand-600" />
        ) : (
          <ChevronUp size={14} className="text-brand-600" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-1">
          {Object.keys(STATUS_COLORS).map(key => {
            const c = STATUS_COLORS[key]
            const count = counts[key] ?? 0
            const active = activeFilter === key
            return (
              <button
                key={key}
                onClick={() => onFilterChange(active ? null : key)}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-md text-left text-xs transition ${
                  active ? 'bg-brand-100 ring-1 ring-brand-300' : 'hover:bg-brand-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 border-white shadow"
                    style={{ background: c.hex }}
                  />
                  <span className="text-slate-700">{key}</span>
                </span>
                <span className="font-semibold text-slate-600 tabular-nums">
                  {count}
                </span>
              </button>
            )
          })}
          <div className="pt-2 mt-1 border-t border-brand-100">
            <p className="text-[10px] text-brand-500 leading-tight">
              💡 ขนาด marker = จำนวนผู้ใช้น้ำ
              <br />
              คลิกเพื่อกรอง · คลิกซ้ำเพื่อล้าง
            </p>
          </div>
        </div>
      )}
    </div>
  )
}