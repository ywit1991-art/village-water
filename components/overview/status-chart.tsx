'use client'

import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import { useState, useEffect } from 'react'
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
  const [mounted, setMounted] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)

    let start = 0
    const duration = 1000
    const increment = total / (duration / 16)
    const countTimer = setInterval(() => {
      start += increment
      if (start >= total) {
        setCount(total)
        clearInterval(countTimer)
      } else {
        setCount(Math.ceil(start))
      }
    }, 16)

    return () => {
      clearTimeout(timer)
      clearInterval(countTimer)
    }
  }, [total])

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
  
  // ขนาดกราฟ
  const size = isFullscreen ? 320 : 240
  const center = size / 2
  const radius = size * 0.4

  // ⭐ คำนวณ Path สำหรับ Pie Chart
  let currentAngle = 0
  const segments = ORDER.map(key => {
    const itemCount = statusCount[key] ?? 0
    const pct = itemCount / total
    const sweepAngle = pct * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sweepAngle
    
    // คำนวณพิกัดจุดเริ่มต้นและสิ้นสุด
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (endAngle - 90) * Math.PI / 180

    const startX = center + radius * Math.cos(startRad)
    const startY = center + radius * Math.sin(startRad)
    const endX = center + radius * Math.cos(endRad)
    const endY = center + radius * Math.sin(endRad)

    // ถ้ามุมเกิน 180 องศา ต้องใช้ largeArcFlag = 1
    const largeArcFlag = sweepAngle <= 180 ? 0 : 1
    
    // คำนวณจุดศูนย์กลางของชิ้นส่วน เพื่อใช้ในการเด้งออก (Explode)
    const midAngle = startAngle + sweepAngle / 2
    const midRad = (midAngle - 90) * Math.PI / 180
    const explodeDistance = 12 // ระยะที่เด้งออก
    const dx = Math.cos(midRad) * explodeDistance
    const dy = Math.sin(midRad) * explodeDistance

    const pathData = `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`

    currentAngle += sweepAngle

    return {
      key,
      itemCount,
      pct,
      pathData,
      dx,
      dy,
      color: STATUS_COLORS[key]?.hex ?? '#94a3b8'
    }
  }).filter(s => s.itemCount > 0)

  return (
    <div className="card p-4 md:p-6 h-full flex flex-col overflow-visible">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6 relative z-10">
        <h2 className={`${titleClass} font-bold text-brand-900`}>
          สถานะข้อมูลประปา
        </h2>
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          {rightSlot}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 flex-1 relative z-10">
        
        {/* ⭐⭐⭐ กราฟ 3D Pie Chart ⭐⭐⭐ */}
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ 
            width: size, 
            height: size,
            transform: mounted ? 'scale(1) rotate(0)' : 'scale(0.5) rotate(-180deg)',
            opacity: mounted ? 1 : 0,
            transition: 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
            {/* วาดเงาสำหรับ 3D ด้านล่าง */}
            <g transform="translate(0, 8)">
              {segments.map(seg => (
                <path
                  key={`shadow-${seg.key}`}
                  d={seg.pathData}
                  fill="#000000"
                  opacity="0.15"
                  style={{ filter: 'blur(4px)' }}
                />
              ))}
            </g>
            
            {/* วาดชิ้นส่วน Pie Chart หลัก */}
            {segments.map(seg => {
              const isHovered = hoveredKey === seg.key || activeStatus === seg.key
              
              return (
                <g
                  key={seg.key}
                  onMouseEnter={() => setHoveredKey(seg.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onStatusClick?.(seg.key)}
                  className="cursor-pointer transition-all duration-300 ease-out"
                  style={{
                    transform: isHovered ? `translate(${seg.dx}px, ${seg.dy}px)` : 'translate(0, 0)',
                    filter: isHovered ? `drop-shadow(0px 10px 15px ${seg.color}80)` : 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'
                  }}
                >
                  <path
                    d={seg.pathData}
                    fill={seg.color}
                    className="stroke-white stroke-2 hover:brightness-110"
                  />
                </g>
              )
            })}
          </svg>

          {/* ตัวเลขตรงกลาง */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: mounted ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s'
            }}
          >
            <div className="flex flex-col items-center justify-center text-center bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100"
                 style={{ width: size * 0.4, height: size * 0.4 }}>
              <p className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-brand-700 to-brand-400 leading-none tabular-nums ${
                isFullscreen ? 'text-5xl' : 'text-3xl'
              }`}>
                {count}
              </p>
              <p className={`text-slate-400 mt-1 uppercase tracking-widest font-semibold ${
                isFullscreen ? 'text-sm' : 'text-[9px]'
              }`}>
                ทั้งหมด
              </p>
            </div>
          </div>
        </div>

        {/* ⭐ Mobile UI: แสดงเฉพาะ Icon + ตัวเลข */}
        <div className="md:hidden w-full grid grid-cols-5 gap-2 mt-4">
          {ORDER.map((key) => {
            const itemCount = statusCount[key] ?? 0
            if (itemCount === 0) return null
            const isActive = activeStatus === key
            
            return (
              <button
                key={key}
                onClick={() => onStatusClick?.(key)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                  isActive || hoveredKey === key ? 'bg-brand-50 ring-2 ring-brand-400 shadow-sm -translate-y-1' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl mb-1">{STATUS_EMOJI[key]}</span>
                <span className="text-sm font-extrabold text-brand-900">{itemCount}</span>
              </button>
            )
          })}
        </div>

        {/* ⭐ Desktop UI: Legend */}
        <div className="hidden md:flex flex-col w-full max-w-md gap-2">
          {ORDER.map((key) => {
            const itemCount = statusCount[key] ?? 0
            const pct = total > 0 ? Math.round((itemCount / total) * 100) : 0
            const c = STATUS_COLORS[key]
            const isActive = activeStatus === key
            const isClickable = !!onStatusClick && itemCount > 0
            const isHovered = hoveredKey === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => isClickable && onStatusClick?.(key)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                disabled={!isClickable}
                className={`group/btn w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                  isActive || isHovered
                    ? 'ring-2 ring-brand-400 bg-brand-50/80 shadow-md translate-x-2'
                    : isClickable
                      ? 'hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer bg-white'
                      : 'cursor-default bg-white border border-slate-100 opacity-60'
                }`}
              >
                <div 
                  className={`w-1.5 h-8 rounded-full shrink-0 transition-transform duration-300 ${
                    isHovered ? 'scale-y-125' : ''
                  }`}
                  style={{ background: c.hex }}
                />
                
                <span className={`flex-1 text-sm truncate font-semibold transition-colors ${
                  isHovered ? 'text-brand-900' : 'text-slate-700'
                }`}>
                  {STATUS_EMOJI[key]} {key}
                </span>
                
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-extrabold text-brand-900 text-lg tabular-nums">
                    {itemCount}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-md min-w-[45px] text-center transition-colors ${
                    isHovered ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-500'
                  }`}>
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