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
          <h2 className="text-base md:text-lg font-bold text-brand-900 whitespace-nowrap">
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

  const titleClass = isFullscreen ? 'text-2xl md:text-3xl' : 'text-base md:text-lg whitespace-nowrap'
  const size = isFullscreen ? 300 : 220
  const innerSize = isFullscreen ? 200 : 150 

  // สร้างสีแบบ conic-gradient
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

  return (
    <div className="card p-4 md:p-6 h-full flex flex-col overflow-hidden">
      
      {/* ⭐⭐⭐ CSS Animation: หมุนวนตลอดเวลา (Infinite) ไม่มีวันหยุด ⭐⭐⭐ */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spinInfinite {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-infinite {
          animation: spinInfinite 15s linear infinite !important; /* หมุนช้าๆ ตลอดเวลา */
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6 relative z-10">
        <h2 className={`${titleClass} font-bold text-brand-900`}>
          สถานะข้อมูลประปา
        </h2>
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          {rightSlot}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 flex-1 relative z-10">
        
        {/* ⭐ ตัววงกลม: พื้นหลังหมุน แต่วงในไม่หมุน */}
        <div
          className="relative shrink-0 flex items-center justify-center drop-shadow-xl"
          style={{ width: size, height: size }}
        >
          {/* วงแหวนพื้นหลัง (หมุนด้วย CSS Infinite) */}
          <div
            className="absolute inset-0 rounded-full animate-spin-infinite"
            style={{ background: gradient }}
          />
          
          {/* วงในสีขาว (บังตรงกลางให้เป็นโดนัท และไม่หมุนตาม) */}
          <div 
            className="relative z-10 flex flex-col items-center justify-center text-center bg-white rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.08)] border border-slate-100"
            style={{ width: innerSize, height: innerSize }}
          >
            <p className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-brand-700 to-brand-400 leading-none tabular-nums ${
              isFullscreen ? 'text-6xl' : 'text-4xl md:text-5xl'
            }`}>
              {total}
            </p>
            <p className={`text-slate-400 mt-1 uppercase tracking-widest font-medium ${
              isFullscreen ? 'text-sm' : 'text-[10px] md:text-xs'
            }`}>
              ทั้งหมด
            </p>
          </div>
        </div>

        {/* ⭐ Mobile UI: แสดงเฉพาะ Icon + ตัวเลข (ไม่มีตัวหนังสือยาว) */}
        <div className="md:hidden w-full grid grid-cols-5 gap-2 mt-2">
          {ORDER.map((key, idx) => {
            const count = statusCount[key] ?? 0
            if (count === 0) return null
            const isActive = activeStatus === key
            
            return (
              <button
                key={key}
                onClick={() => onStatusClick?.(key)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                  isActive ? 'bg-brand-50 ring-2 ring-brand-400 shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl mb-1">{STATUS_EMOJI[key]}</span>
                <span className="text-sm font-extrabold text-brand-900">{count}</span>
              </button>
            )
          })}
        </div>

        {/* ⭐ Desktop UI: แสดงรายการการ์ดสวยๆ */}
        <div className="hidden md:flex flex-col w-full max-w-md gap-2">
          {ORDER.map((key, idx) => {
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
                className={`group w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                  isActive
                    ? 'ring-2 ring-brand-400 bg-brand-50/80 shadow-md scale-[1.02]'
                    : isClickable
                      ? 'hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-slate-200 cursor-pointer bg-white'
                      : 'cursor-default bg-white border border-slate-100'
                }`}
              >
                <div 
                  className="w-1.5 h-8 rounded-full shrink-0 transition-transform group-hover:scale-y-110"
                  style={{ background: c.hex }}
                />
                
                <span className="flex-1 text-sm text-slate-700 truncate font-semibold group-hover:text-slate-900 transition-colors">
                  {STATUS_EMOJI[key]} {key}
                </span>
                
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-extrabold text-brand-900 text-lg tabular-nums">
                    {count}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md min-w-[45px] text-center">
                    {pct}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}