'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { ReactNode } from 'react'

interface Props {
  statusCount: Record<string, number>
  total: number
  rightSlot?: ReactNode
  onStatusClick?: (status: string) => void
  activeStatus?: string | null
}

const ORDER = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

export default function StatusChart({
  statusCount,
  total,
  rightSlot,
  onStatusClick,
  activeStatus,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setAnimated(true), 100)
      return () => clearTimeout(t)
    }
  }, [inView])

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

  return (
    <div ref={ref} className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-brand-900">
          สถานะข้อมูลประปา
        </h2>
        {rightSlot}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {/* ===== Donut (animated) ===== */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={
            inView
              ? { scale: 1, opacity: 1, rotate: 0 }
              : { scale: 0.5, opacity: 0, rotate: -90 }
          }
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative shrink-0"
        >
          <div
            className="w-52 h-52 rounded-full transition-all"
            style={{ background: gradient }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center shadow-inner"
            >
              <p className="text-4xl font-extrabold text-brand-900 leading-none tabular-nums">
                {total}
              </p>
              <p className="text-xs text-brand-500 mt-1">ข้อมูลทั้งหมด</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== List (animated + clickable) ===== */}
        <div className="w-full max-w-sm space-y-2">
          {ORDER.map((key, i) => {
            const count = statusCount[key] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const c = STATUS_COLORS[key]
            const isActive = activeStatus === key
            const isClickable = !!onStatusClick && count > 0

            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => isClickable && onStatusClick?.(key)}
                disabled={!isClickable}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={isClickable ? { scale: 1.02 } : {}}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'ring-2 ring-brand-400 bg-brand-50/80 shadow-sm'
                    : isClickable
                      ? 'hover:bg-brand-50/60 cursor-pointer'
                      : 'cursor-default'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border-2 border-white shadow shrink-0"
                  style={{ background: c.hex }}
                />
                <span className="flex-1 text-sm text-slate-700">
                  {STATUS_EMOJI[key]} {key}
                </span>
                <span className="text-sm font-bold text-brand-900 tabular-nums">
                  {count}
                </span>
                <span className="text-xs text-slate-400 w-12 text-right tabular-nums">
                  {pct}%
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {onStatusClick && (
        <p className="text-[11px] text-slate-400 text-center mt-5">
          💡 คลิกที่รายการเพื่อกรองข้อมูลบนแผนที่
        </p>
      )}
    </div>
  )
}