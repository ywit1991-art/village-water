'use client'

import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { ReactNode } from 'react'

interface Props {
  statusCount: Record<string, number>
  total: number
  rightSlot?: ReactNode
  onStatusClick?: (status: string) => void
  activeStatus?: string | null
  isFullscreen?: boolean
}

const ORDER = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

export default function StatusChart({
  statusCount,
  total,
  rightSlot,
  onStatusClick,
  activeStatus,
  isFullscreen = false,
}: Props) {
  if (total === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-brand-900">
            สถานะข้อมูลประปา
          </h2>
          {rightSlot}
        </div>
        <p className="text-sm text-brand-400 text-center py-10">
          ยังไม่มีข้อมูลประปา
        </p>
      </div>
    )
  }

  // สร้าง conic-gradient
  let cumulative = 0
  const segments: string[] = []
  ORDER.forEach(key => {
    const count = statusCount[key] ?? 0
    if (count === 0) return
    const pct = (count / total) * 100
    const start = cumulative
    cumulative += pct
    const color = STATUS_COLORS[key]?.hex ?? '#94a3b8'
    segments.push(`${color} ${start}% ${cumulative}%`)
  })
  const gradient = `conic-gradient(${segments.join(', ')})`

  // ⭐ ขนาดตัวหนังสือและขนาดกราฟ
  const titleClass = isFullscreen ? 'text-2xl md:text-3xl' : 'text-lg'
  const legendTextClass = isFullscreen ? 'text-base md:text-lg' : 'text-sm'
  const donutSize = isFullscreen ? 'w-72 h-72 md:w-80 md:h-80' : 'w-52 h-52'
  const donutInner = isFullscreen ? 'w-48 h-48 md:w-56 md:h-56' : 'w-32 h-32'

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className={`${titleClass} font-bold text-brand-900`}>
          สถานะข้อมูลประปา
        </h2>
        {rightSlot}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 flex-1">
        {/* ===== Donut ===== */}
        <div className="relative shrink-0">
          <div
            className={`${
              isFullscreen ? 'w-72 h-72 md:w-80 md:h-80' : 'w-52 h-52'
            } rounded-full transition-all`} // ⭐ ขยายใน Fullscreen
            style={{ background: gradient }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${donutInner} rounded-full bg-white flex flex-col items-center justify-center shadow-inner`}>
              <p className={`font-extrabold text-brand-900 leading-none tabular-nums ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}>
                {total}
              </p>
              <p className={`text-brand-500 mt-2 ${isFullscreen ? 'text-base' : 'text-xs'}`}>ข้อมูลทั้งหมด</p>
            </div>
          </div>
        </div>

        {/* ===== List ===== */}
        <div className={`w-full max-w-md space-y-2`}>
          {ORDER.map(key => {
            const count = statusCount[key] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const c = STATUS_COLORS[key]
            const isActive = activeStatus === key
            const isClickable = !!onStatusClick && count > 0

            return (
              <button
                key={key}
                type="button"
                onClick={() => isClickable && onStatusClick?.(key)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'ring-2 ring-brand-400 bg-brand-50/80 shadow-sm'
                    : isClickable
                      ? 'hover:bg-brand-50/60 cursor-pointer'
                      : 'cursor-default'
                }`}
              >
                <span
                  className={`rounded-full border-2 border-white shadow shrink-0 ${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`}
                  style={{ background: c.hex }}
                />
                <span className={`flex-1 ${legendTextClass} text-slate-700`}>
                  {STATUS_EMOJI[key]} {key}
                </span>
                <span className={`font-bold text-brand-900 tabular-nums ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
                  {count}
                </span>
                <span className={`text-slate-400 text-right tabular-nums ${isFullscreen ? 'text-base w-16' : 'text-xs w-12'}`}>
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