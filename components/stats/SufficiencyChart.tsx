'use client'

import { useMemo, useState, useEffect } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

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
      <div className="card p-6 h-full flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
            <Droplets size={18} className="text-brand-600" />
            ความเพียงพอของน้ำ (ฤดูแล้ง)
          </h2>
          {rightSlot}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-brand-400">ยังไม่มีข้อมูลครัวเรือน</p>
        </div>
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

  const paddingClass = isFullscreen ? 'p-6 md:p-8' : 'p-4 md:p-5'
  const titleClass = isFullscreen ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
  const legendTextClass = isFullscreen ? 'text-sm md:text-base' : 'text-[10px] md:text-xs'
  const axisTextClass = isFullscreen ? 'text-sm font-medium' : 'text-[9px] md:text-[10px]'
  const xAxisTextClass = isFullscreen ? 'text-sm md:text-base' : 'text-[10px]'
  
  const minBarWidth = isFullscreen ? 60 : 45 
  const chartWidth = Math.max(rows.length * minBarWidth, 300)

  return (
    // ⭐ เปลี่ยนเป็น h-full เพื่อให้การ์ดสูงเต็มพื้นที่ที่เหลือ
    <div className={`card ${paddingClass} flex flex-col w-full h-full`}>
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <h2 className={`${titleClass} font-bold text-brand-900 flex items-center gap-2 shrink-0`}>
            <Droplets size={isFullscreen ? 24 : 16} className="text-brand-600" />
            <span className="hidden sm:inline">ความเพียงพอของน้ำ (ฤดูแล้ง)</span>
            <span className="sm:hidden">น้ำประปา (ฤดูแล้ง)</span>
          </h2>

          <span className={`hidden md:inline ${legendTextClass} text-slate-500 whitespace-nowrap`}>
            {rows.length} ระบบ · {WATER_PER_PERSON_PER_DAY} ลิตร/คน/วัน · {PEOPLE_PER_HOUSEHOLD} คน/ครัวเรือน
          </span>

          <span className="text-slate-300 hidden xl:inline">|</span>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={`${isFullscreen ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-sm bg-blue-600 shrink-0`} />
              <span className={`${legendTextClass} text-slate-600`}>ผลิต</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`${isFullscreen ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-sm bg-teal-400 shrink-0`} />
              <span className={`${legendTextClass} text-slate-600`}>ต้องการ</span>
            </div>
          </div>
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

      {/* Chart Area */}
      <div className="relative w-full flex-1 flex flex-col min-h-0">
        <div className={`${axisTextClass} text-slate-500 font-semibold pl-10 md:pl-14 mb-1 md:mb-2 shrink-0`}>
          ลบ.ม./วัน
        </div>

        <div className="flex w-full flex-1 min-h-0 relative">
          
          {/* แกน Y */}
          <div className={`relative shrink-0 ${isFullscreen ? 'w-12' : 'w-8 md:w-12'} flex flex-col`}>
            <div className="relative flex-1">
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
            <div className="h-14 shrink-0" />
          </div>

          {/* พื้นที่กราฟ */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
            <div 
              className="h-full flex flex-col"
              style={{ width: `${chartWidth}px`, minWidth: '100%' }}
            >
              {/* ⭐ พื้นที่แท่งกราฟ: ใช้ flex-1 ทำให้ยืดเต็มพื้นที่ความสูงที่เหลือ */}
              <div className="relative flex-1 w-full min-h-[200px]">
                
                {yTicks.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                    style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
                  />
                ))}

                <div className="absolute inset-0 flex items-end justify-start w-full px-1">
                  {rows.map((row, idx) => {
                    const prodPct = Math.min((row.dailyProduction / yMax) * 100, 100)
                    const demandPct = Math.min((row.peakDayDemand / yMax) * 100, 100)

                    return (
                      <div 
                        key={row.systemId} 
                        className="flex flex-col items-center justify-end h-full shrink-0 px-0.5 md:px-1"
                        style={{ width: `${minBarWidth}px` }}
                      >
                        <div className="flex items-end justify-center gap-0.5 md:gap-1 w-full h-full relative group">
                          
                          <div className="relative flex flex-col items-center justify-end h-full flex-1">
                            {row.dailyProduction > yMax && (
                              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-0.5 ${isFullscreen ? 'text-xs' : 'text-[8px] md:text-[9px]'} font-bold text-blue-700 tabular-nums whitespace-nowrap z-10`}>
                                <ArrowUp size={8} /> {Math.round(row.dailyProduction)}
                              </div>
                            )}
                            <div
                              className="w-full max-w-[14px] md:max-w-[20px] rounded-t bg-blue-600 transition-[height] duration-700 ease-out cursor-pointer hover:bg-blue-700"
                              style={{ height: mounted ? `${Math.max(prodPct, 2)}%` : '0%' }}
                              title={`ม.${row.villageNo} ${row.systemName}\nผลิต: ${row.dailyProduction} ลบ.ม./วัน`}
                            />
                          </div>

                          <div className="relative flex flex-col items-center justify-end h-full flex-1">
                            {row.peakDayDemand > yMax && (
                              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-0.5 ${isFullscreen ? 'text-xs' : 'text-[8px] md:text-[9px]'} font-bold text-teal-700 tabular-nums whitespace-nowrap z-10`}>
                                <ArrowUp size={8} /> {Math.round(row.peakDayDemand)}
                              </div>
                            )}
                            <div
                              className="w-full max-w-[14px] md:max-w-[20px] rounded-t bg-teal-400 transition-[height] duration-700 ease-out cursor-pointer hover:bg-teal-500"
                              style={{ height: mounted ? `${Math.max(demandPct, 2)}%` : '0%' }}
                              title={`ม.${row.villageNo} ${row.systemName}\nต้องการ: ${row.peakDayDemand} ลบ.ม./วัน`}
                            />
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* แกน X */}
              <div className="flex w-full mt-2 shrink-0 h-12 overflow-hidden px-1">
                {rows.map(row => (
                  <div 
                    key={row.systemId} 
                    className="shrink-0 text-center px-0.5 flex flex-col justify-start"
                    style={{ width: `${minBarWidth}px` }}
                  >
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

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[9px] md:text-xs text-slate-500 leading-relaxed shrink-0">
        <Info size={isFullscreen ? 16 : 12} className="shrink-0 mt-0.5 text-slate-400" />
        <span className="line-clamp-1 md:line-clamp-none">
          <strong>สูตร:</strong> ผลิต/วัน = กำลังผลิต × {PRODUCTION_HOURS_PER_DAY} ชม. · ความต้องการ (PDD) = ครัวเรือน × {PEOPLE_PER_HOUSEHOLD} คน × {WATER_PER_PERSON_PER_DAY} ลิตร × {DRY_SEASON_FACTOR} (ฤดูแล้ง)
        </span>
      </div>
    </div>
  )
}