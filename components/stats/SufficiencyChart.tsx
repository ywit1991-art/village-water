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
}

export default function SufficiencyChart({ markers, rightSlot }: Props) {
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
    good: rows.filter(r => r.level === 'good').length,
    fair: rows.filter(r => r.level === 'fair').length,
    poor: rows.filter(r => r.level === 'poor').length,
    critical: rows.filter(r => r.level === 'critical').length,
  }

  const yMax = 100
  const yTicks = [100, 75, 50, 25, 0]

  const chartMinWidth = rows.length < 5 ? 0 : Math.max(rows.length * 60, 500)

  return (
    <div className="card p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap pb-3 mb-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2 shrink-0">
          <Droplets size={18} className="text-brand-600" />
          ความเพียงพอของน้ำ (ฤดูแล้ง)
        </h2>

        <span className="text-[11px] text-slate-500 whitespace-nowrap">
          {rows.length} ระบบ · {WATER_PER_PERSON_PER_DAY} ลิตร/คน/วัน ·{' '}
          {PEOPLE_PER_HOUSEHOLD} คน/ครัวเรือน · {PRODUCTION_HOURS_PER_DAY}{' '}
          ชม./วัน · ฤดูแล้ง ×{DRY_SEASON_FACTOR}
        </span>

        <span className="text-slate-300 hidden md:inline">|</span>

        {/* Legend — ผลิต/ต้องการ */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-blue-600 shrink-0" />
            <span className="text-slate-600 whitespace-nowrap">ผลิต</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-teal-400 shrink-0" />
            <span className="text-slate-600 whitespace-nowrap">ต้องการ</span>
          </div>
        </div>

        {/* Legend — ระดับ */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 ml-auto">
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
              <div
                key={item.key}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: item.color }}
                >
                  {item.range}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="text-[10px] text-slate-500 font-semibold pl-16 mb-1">
          ลบ.ม./วัน
        </div>

        <div ref={chartRef} className="overflow-x-auto pb-2">
          <div
            style={
              chartMinWidth > 0 ? { minWidth: `${chartMinWidth}px` } : undefined
            }
            className="px-2"
          >
            <div className="flex gap-2">
              {/* Y-axis */}
              <div
                className="relative shrink-0 w-14"
                style={{ height: '360px' }}
              >
                {yTicks.map((val, i) => {
                  const isFirst = i === 0
                  const isLast = i === yTicks.length - 1
                  return (
                    <div
                      key={i}
                      className="absolute right-1 text-[10px] text-slate-400 tabular-nums leading-none"
                      style={{
                        top: isFirst
                          ? '0%'
                          : isLast
                            ? '100%'
                            : `${(i / (yTicks.length - 1)) * 100}%`,
                        transform: isFirst
                          ? 'translateY(0)'
                          : isLast
                            ? 'translateY(-100%)'
                            : 'translateY(-50%)',
                      }}
                    >
                      {val}
                    </div>
                  )
                })}
              </div>

              {/* Chart area */}
              <div
                className="relative flex-1 min-w-0"
                style={{ height: '360px' }}
              >
                {/* Grid */}
                {yTicks.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                    style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-center">
                  {rows.map((row, idx) => {
                    const prodCapped = row.dailyProduction > yMax
                    const demandCapped = row.peakDayDemand > yMax
                    const prodPct = Math.min(
                      (row.dailyProduction / yMax) * 100,
                      100,
                    )
                    const demandPct = Math.min(
                      (row.peakDayDemand / yMax) * 100,
                      100,
                    )

                    return (
                      <div
                        key={row.systemId}
                        className="flex-1 min-w-0 max-w-[180px] h-full flex items-end justify-center gap-0.5 px-1 relative"
                      >
                        {/* Production bar */}
                        <div className="relative flex flex-col items-center justify-end h-full">
                          {prodCapped && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9px] font-bold text-blue-700 tabular-nums whitespace-nowrap">
                              <ArrowUp size={9} />
                              {Math.round(row.dailyProduction)}
                            </div>
                          )}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={
                              inView
                                ? { height: `${prodPct}%` }
                                : { height: 0 }
                            }
                            transition={{
                              duration: 0.7,
                              delay: 0.1 + idx * 0.04,
                              ease: 'easeOut',
                            }}
                            className="w-3 md:w-4 rounded-t bg-blue-600 cursor-pointer hover:brightness-110 transition-all"
                            title={`ม.${row.villageNo} ${row.systemName}
━━━ ผลิต ━━━
กำลังผลิต: ${row.actualProduction} ลบ.ม./ชม.
ผลิต/วัน: ${row.dailyProduction} ลบ.ม.
เปรียบเทียบ PDD: ${row.productionRatio}%`}
                          />
                        </div>

                        {/* Demand bar */}
                        <div className="relative flex flex-col items-center justify-end h-full">
                          {demandCapped && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9px] font-bold text-teal-700 tabular-nums whitespace-nowrap">
                              <ArrowUp size={9} />
                              {Math.round(row.peakDayDemand)}
                            </div>
                          )}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={
                              inView
                                ? { height: `${demandPct}%` }
                                : { height: 0 }
                            }
                            transition={{
                              duration: 0.7,
                              delay: 0.2 + idx * 0.04,
                              ease: 'easeOut',
                            }}
                            className="w-3 md:w-4 rounded-t bg-teal-400 cursor-pointer hover:brightness-110 transition-all"
                            title={`ม.${row.villageNo} ${row.systemName}
━━━ ต้องการ (ฤดูแล้ง) ━━━
ครัวเรือน: ${row.householdCount} หลัง (${row.peopleCount} คน)
อัตราใช้: ${row.litersPerPerson} ลิตร/คน/วัน
ADD: ${row.dailyDemand} ลบ.ม./วัน
PDD: ${row.peakDayDemand} ลบ.ม./วัน`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* X-axis */}
            <div className="flex justify-center ml-14 mt-2">
              {rows.map(row => (
                <div
                  key={row.systemId}
                  className="flex-1 min-w-0 max-w-[180px] text-center px-1"
                >
                  <p className="text-[10px] font-semibold text-brand-700 truncate leading-tight">
                    ม.{row.villageNo}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate leading-tight">
                    {row.systemName}
                  </p>
                  <p
                    className="text-[10px] font-bold tabular-nums leading-tight mt-0.5"
                    style={{
                      color: SUFFICIENCY_COLORS[row.level].hex,
                    }}
                  >
                    {row.ratio}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
        <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
        <span>
          <strong>สูตร:</strong> ผลิต/วัน = กำลังผลิต ×{' '}
          {PRODUCTION_HOURS_PER_DAY} ชม. · ความต้องการ (PDD) = ครัวเรือน ×{' '}
          {PEOPLE_PER_HOUSEHOLD} คน × {WATER_PER_PERSON_PER_DAY} ลิตร ×{' '}
          {DRY_SEASON_FACTOR} (ฤดูแล้ง) · อ้างอิง: กรมทรัพยากรน้ำ +
          มาตรฐานการประปาส่วนภูมิภาค
        </span>
      </div>
    </div>
  )
}