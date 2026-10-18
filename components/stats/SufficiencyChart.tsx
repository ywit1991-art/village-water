'use client'

import { useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Droplets, Info, ArrowUp } from 'lucide-react'
import {
  calcSufficiency,
  SUFFICIENCY_COLORS,
  DRY_SEASON_FACTOR,
  WATER_PER_PERSON_PER_DAY,
  PEOPLE_PER_HOUSEHOLD,
  PRODUCTION_HOURS_PER_DAY,
} from '@/lib/water-sufficiency'
import type { MarkerData } from '@/components/maps/VillagesMapClient'
import type { ReactNode } from 'react'

interface Props {
  markers: MarkerData[]
  rightSlot?: ReactNode
  isFullscreen?: boolean
}

export default function SufficiencyChart({
  markers,
  rightSlot,
  isFullscreen = false,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const inView = useInView(chartRef, { once: true, margin: '-50px' })

  const rows = useMemo(() => {
    return markers
      .filter(m => (m.householdCount ?? 0) > 0)
      .map(m => {
        const s = calcSufficiency(
          m.householdCount,
          m.productionCapacity ?? null,
          m.tankCapacity,
          'dry',
          m.totalHP ?? 0,
        )
        return {
          systemId: m.systemId,
          systemName: m.systemName,
          systemNo: m.systemNo,
          villageNo: m.villageNo,
          villageName: m.villageName,
          ...s,
        }
      })
      .sort((a, b) => {
        if (a.villageNo !== b.villageNo) return a.villageNo - b.villageNo
        return a.systemNo - b.systemNo
      })
  }, [markers])

  if (rows.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
            <Droplets size={18} className="text-brand-600" />
            ความเพียงพอของน้ำ (ฤดูแล้ง)
          </h2>
          {rightSlot}
        </div>
        <p className="text-sm text-brand-400 text-center py-10">
          ยังไม่มีข้อมูลครัวเรือน
        </p>
      </div>
    )
  }

  const summary = {
    'no-data': rows.filter(r => r.level === 'no-data').length,
    good: rows.filter(r => r.level === 'good').length,
    fair: rows.filter(r => r.level === 'fair').length,
    poor: rows.filter(r => r.level === 'poor').length,
    critical: rows.filter(r => r.level === 'critical').length,
  }

  const yMax = 100
  const yTicks = [100, 75, 50, 25, 0]

  const paddingClass = isFullscreen ? 'p-6 md:p-8' : 'p-4 md:p-6'
  const titleClass = isFullscreen ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
  const axisTextClass = isFullscreen ? 'text-sm font-medium' : 'text-[9px] md:text-[10px]'
  const xAxisTextClass = isFullscreen ? 'text-sm md:text-base' : 'text-[10px]'
  const barWidth = isFullscreen ? 'w-4 md:w-6' : 'w-3 md:w-4'
  const chartAreaHeight = isFullscreen ? 'flex-1 min-h-[400px]' : 'h-[250px] md:h-[350px]'

  return (
    <div className={`card ${paddingClass} flex flex-col w-full ${isFullscreen ? 'h-full' : ''}`}>
      
      {/* Header: มือถือโชว์สั้นๆ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <h2 className={`${titleClass} font-bold text-brand-900 flex items-center gap-2 shrink-0`}>
            <Droplets size={isFullscreen ? 24 : 16} className="text-brand-600" />
            <span className="hidden sm:inline">ความเพียงพอของน้ำ (ฤดูแล้ง)</span>
            <span className="sm:hidden">น้ำประปา (ฤดูแล้ง)</span>
          </h2>
          
          {/* มือถือ: ซ่อนข้อความยาว */}
          <span className="hidden md:inline text-xs md:text-sm text-slate-500 whitespace-nowrap">
            {rows.length} ระบบ · {WATER_PER_PERSON_PER_DAY} ลิตร/คน/วัน · {PEOPLE_PER_HOUSEHOLD} คน/ครัวเรือน
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 xl:ml-auto flex-wrap">
          <div className="flex flex-wrap gap-1.5 md:gap-2 mr-2">
            {(
              [
                { key: 'good', range: '≥ 90%', color: '#1e40af' },
                { key: 'fair', range: '70-89%', color: '#3b82f6' },
                { key: 'poor', range: '50-69%', color: '#0ea5e9' },
                { key: 'critical', range: '< 50%', color: '#94a3b8' },
              ] as const
            ).map(item => {
              const count = summary[item.key]
              if (count === 0) return null
              return (
                <div key={item.key} className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 rounded bg-white border border-slate-200">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px] md:text-xs font-bold tabular-nums" style={{ color: item.color }}>{item.range}</span>
                </div>
              )
            })}
          </div>
          {rightSlot}
        </div>
      </div>

      <div className="relative w-full flex-1 flex flex-col min-h-0">
        <div className={`${axisTextClass} text-slate-500 font-semibold pl-12 md:pl-16 mb-1 md:mb-2 shrink-0`}>
          ลบ.ม./วัน
        </div>

        {/* ⭐ มือถือ: ใส่ Overflow-x-auto ให้เลื่อนซ้ายขวาได้ ไม่ล้น */}
        <div ref={chartRef} className="w-full flex flex-col flex-1 min-h-0 overflow-x-auto custom-scrollbar">
          <div className="min-w-[500px] md:min-w-0 w-full flex flex-col flex-1 min-h-0 pb-2">
            <div className={`flex gap-1 md:gap-2 ${chartAreaHeight}`}>
              
              <div className={`relative shrink-0 ${isFullscreen ? 'w-14' : 'w-10 md:w-14'}`}>
                {yTicks.map((val, i) => {
                  const isFirst = i === 0
                  const isLast = i === yTicks.length - 1
                  return (
                    <div
                      key={i}
                      className={`absolute right-2 ${axisTextClass} text-slate-400 tabular-nums leading-none`}
                      style={{
                        top: isFirst ? '0%' : isLast ? '100%' : `${(i / (yTicks.length - 1)) * 100}%`,
                        transform: isFirst ? 'translateY(0)' : isLast ? 'translateY(-100%)' : 'translateY(-50%)',
                      }}
                    >
                      {val}
                    </div>
                  )
                })}
              </div>

              <div className="flex-1 flex flex-col min-w-0 pr-4 md:pr-0">
                <div className="relative flex-1 min-h-0 w-full">
                  {yTicks.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                      style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
                    />
                  ))}

                  <div className="absolute inset-0 flex items-end w-full">
                    {rows.map((row, idx) => {
                      const prodCapped = row.dailyProduction > yMax
                      const demandCapped = row.peakDayDemand > yMax
                      const prodPct = Math.min((row.dailyProduction / yMax) * 100, 100)
                      const demandPct = Math.min((row.peakDayDemand / yMax) * 100, 100)

                      return (
                        <div key={row.systemId} className="flex-1 min-w-0 h-full flex items-end justify-center gap-0.5 md:gap-1 px-0.5 relative">
                          <div className="relative flex flex-col items-center justify-end h-full w-full max-w-[30px] md:max-w-[40px]">
                            {prodCapped && (
                              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${isFullscreen ? 'text-xs' : 'text-[8px] md:text-[9px]'} font-bold text-blue-700 tabular-nums whitespace-nowrap`}>
                                <ArrowUp size={8} /> {Math.round(row.dailyProduction)}
                              </div>
                            )}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={inView ? { height: `${prodPct}%` } : { height: 0 }}
                              transition={{ duration: 0.7, delay: 0.1 + idx * 0.04, ease: 'easeOut' }}
                              className={`${barWidth} rounded-t bg-blue-600`}
                            />
                          </div>

                          <div className="relative flex flex-col items-center justify-end h-full w-full max-w-[30px] md:max-w-[40px]">
                            {demandCapped && (
                              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 ${isFullscreen ? 'text-xs' : 'text-[8px] md:text-[9px]'} font-bold text-teal-700 tabular-nums whitespace-nowrap`}>
                                <ArrowUp size={8} /> {Math.round(row.peakDayDemand)}
                              </div>
                            )}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={inView ? { height: `${demandPct}%` } : { height: 0 }}
                              transition={{ duration: 0.7, delay: 0.2 + idx * 0.04, ease: 'easeOut' }}
                              className={`${barWidth} rounded-t bg-teal-400`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* X-Axis: มือถือโชว์แค่ ม.1, ซ่อนชื่อระบบ */}
                <div className="flex w-full mt-1 md:mt-2 shrink-0">
                  {rows.map(row => (
                    <div key={row.systemId} className="flex-1 min-w-0 text-center px-0.5">
                      <p className={`${xAxisTextClass} font-semibold text-brand-700 truncate leading-tight`}>
                        ม.{row.villageNo}
                      </p>
                      <p className={`${isFullscreen ? 'text-sm' : 'text-[8px] md:text-[9px]'} text-slate-500 truncate leading-tight hidden md:block`}>
                        {row.systemName}
                      </p>
                      <p
                        className={`${isFullscreen ? 'text-base' : 'text-[9px] md:text-[10px]'} font-bold tabular-nums leading-tight mt-0.5`}
                        style={{ color: SUFFICIENCY_COLORS[row.level].hex }}
                      >
                        {row.level === 'no-data' ? '—' : `${row.ratio}%`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* มือถือ: ซ่อนข้อความสูตรยาวๆ */}
      <div className="hidden md:flex mt-3 pt-3 border-t border-slate-100 items-start gap-1.5 text-xs md:text-sm text-slate-500 leading-relaxed shrink-0">
        <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <span>
          <strong>สูตร:</strong> ผลิต/วัน = กำลังผลิต × {PRODUCTION_HOURS_PER_DAY} ชม. · ความต้องการ (PDD) = ครัวเรือน × {PEOPLE_PER_HOUSEHOLD} คน × {WATER_PER_PERSON_PER_DAY} ลิตร × {DRY_SEASON_FACTOR} (ฤดูแล้ง)
        </span>
      </div>
    </div>
  )
}