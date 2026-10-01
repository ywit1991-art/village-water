'use client'

import { useMemo, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Droplets, Info, HelpCircle } from 'lucide-react'
import {
  calcSufficiency,
  SUFFICIENCY_COLORS,
  DRY_SEASON_FACTOR,
  WATER_PER_PERSON_PER_DAY,
  PEOPLE_PER_HOUSEHOLD,
  PRODUCTION_HOURS_PER_DAY,
  type Season,
  type SufficiencyResult,
} from '@/lib/water-sufficiency'
import type { MarkerData } from '@/components/maps/VillagesMapClient'
import type { ReactNode } from 'react'

interface Props {
  markers: MarkerData[]
  rightSlot?: ReactNode
}

interface Row {
  systemId: number
  systemName: string
  systemNo: number
  villageNo: number
  villageName: string
  householdCount: number
  hasData: boolean
  normal: SufficiencyResult | null
  dry: SufficiencyResult | null
}

type SeasonFilter = 'both' | Season

export default function SufficiencyChart({ markers, rightSlot }: Props) {
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('both')
  const chartRef = useRef<HTMLDivElement>(null)
  const inView = useInView(chartRef, { once: true, margin: '-50px' })

  const rows: Row[] = useMemo(() => {
    return markers
      .map(m => {
        const hasData = (m.householdCount ?? 0) > 0
        return {
          systemId: m.systemId,
          systemName: m.systemName,
          systemNo: m.systemNo,
          villageNo: m.villageNo,
          villageName: m.villageName,
          householdCount: m.householdCount,
          hasData,
          normal: hasData
            ? calcSufficiency(m.householdCount, null, 'normal')
            : null,
          dry: hasData
            ? calcSufficiency(m.householdCount, null, 'dry')
            : null,
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
            ความเพียงพอของน้ำ
          </h2>
          {rightSlot}
        </div>
        <p className="text-sm text-brand-400 text-center py-10">
          ยังไม่มีข้อมูลครัวเรือน
        </p>
      </div>
    )
  }

  // นับตามฤดูแล้ง (worst case)
  const rowsWithData = rows.filter(r => r.hasData && r.dry !== null)
  const rowsNoData = rows.filter(r => !r.hasData)

  const summary = {
    excellent: rowsWithData.filter(r => r.dry!.level === 'excellent').length,
    good: rowsWithData.filter(r => r.dry!.level === 'good').length,
    fair: rowsWithData.filter(r => r.dry!.level === 'fair').length,
    poor: rowsWithData.filter(r => r.dry!.level === 'poor').length,
    critical: rowsWithData.filter(r => r.dry!.level === 'critical').length,
    noData: rowsNoData.length,
  }

  // ⭐ แกน Y คงที่
  const yMax = 1000
  const yTicks = [1000, 750, 500, 250, 0]
  const refPct = (100 / yMax) * 100

  const minWidthPerSystem = seasonFilter === 'both' ? 56 : 40
  const chartMinWidth = Math.max(rows.length * minWidthPerSystem, 400)

  // ⭐ Summary: แสดงเป็น "จำนวนระบบ" ไม่ใช่ %
  const totalWithData = rowsWithData.length
  const avgNormal = totalWithData > 0
    ? rowsWithData.reduce((a, r) => a + r.normal!.ratio, 0) / totalWithData
    : 0
  const avgDry = totalWithData > 0
    ? rowsWithData.reduce((a, r) => a + r.dry!.ratio, 0) / totalWithData
    : 0
  const minDry = totalWithData > 0
    ? Math.min(...rowsWithData.map(r => r.dry!.ratio))
    : 0
  const maxDry = totalWithData > 0
    ? Math.max(...rowsWithData.map(r => r.dry!.ratio))
    : 0

  return (
    <div className="card p-6 flex flex-col">
      {/* ============ Header ============ */}
      <div className="flex items-center gap-3 flex-wrap pb-3 mb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2 shrink-0">
          <Droplets size={18} className="text-brand-600" />
          ความเพียงพอของน้ำ
        </h2>

        <span className="text-[11px] text-slate-500 whitespace-nowrap">
          {rows.length} ระบบ · {WATER_PER_PERSON_PER_DAY} ลิตร/คน/วัน ·{' '}
          {PEOPLE_PER_HOUSEHOLD} คน/ครัวเรือน ·{' '}
          {PRODUCTION_HOURS_PER_DAY} ชม./วัน · ฤดูแล้ง ×{DRY_SEASON_FACTOR}
        </span>

        <span className="text-slate-300 hidden md:inline">|</span>

        <div className="inline-flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
            แสดง:
          </span>
          <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
            {(
              [
                { key: 'both', label: 'ทั้ง 2 ฤดู' },
                { key: 'normal', label: '🌤️ ปกติ' },
                { key: 'dry', label: '☀️ ฤดูแล้ง' },
              ] as const
            ).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSeasonFilter(t.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  seasonFilter === t.key
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-300 hidden md:inline">|</span>

        <div className="flex items-center gap-3">
          {seasonFilter !== 'dry' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-sm bg-sky-500 shrink-0" />
              <span className="text-slate-600 whitespace-nowrap">ฤดูปกติ</span>
            </div>
          )}
          {seasonFilter !== 'normal' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-sm bg-orange-500 shrink-0" />
              <span className="text-slate-600 whitespace-nowrap">
                ฤดูแล้ง (×{DRY_SEASON_FACTOR})
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 ml-auto">
          {(['critical', 'poor', 'fair', 'good', 'excellent'] as const).map(
            k => {
              const c = SUFFICIENCY_COLORS[k]
              const count = summary[k]
              if (count === 0) return null
              return (
                <div key={k} className="flex items-center gap-1 text-xs">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: c.hex }}
                  />
                  <span className="text-slate-500">{c.emoji}</span>
                  <span className="font-bold text-brand-900 tabular-nums">
                    {count}
                  </span>
                </div>
              )
            },
          )}
          {summary.noData > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-500">❔</span>
              <span className="font-bold text-slate-500 tabular-nums">
                {summary.noData}
              </span>
              <span className="text-slate-400">ไม่มีข้อมูล</span>
            </div>
          )}
        </div>
      </div>

      {/* ============ Chart ============ */}
      <div ref={chartRef} className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${chartMinWidth}px` }} className="px-2">
          <div className="flex gap-2">
            <div className="relative shrink-0 w-14" style={{ height: '360px' }}>
              {yTicks.map((val, i) => (
                <div
                  key={val}
                  className="absolute right-1 text-[10px] text-slate-400 tabular-nums leading-none"
                  style={{
                    top: `${(i / (yTicks.length - 1)) * 100}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {val}%
                </div>
              ))}
            </div>

            <div
              className="relative flex-1 min-w-0"
              style={{ height: '360px' }}
            >
              {yTicks.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                  style={{ top: `${(i / (yTicks.length - 1)) * 100}%` }}
                />
              ))}

              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-300 z-10"
                style={{ top: `${100 - refPct}%` }}
              >
                <span className="absolute right-0 -top-4 text-[10px] text-red-500 font-semibold bg-white px-1 rounded">
                  100%
                </span>
              </div>

              <div className="absolute inset-0 flex items-end gap-1">
                {rows.map((row, idx) => {
                  // ระบบที่ไม่มีข้อมูล → แสดงแท่งเทาสูงเต็ม
                  if (!row.hasData) {
                    return (
                      <div
                        key={row.systemId}
                        className="flex-1 flex items-end justify-center min-w-0 h-full"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={inView ? { height: '100%' } : { height: 0 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.1 + idx * 0.04,
                            ease: 'easeOut',
                          }}
                          className="w-3 md:w-4 rounded-t cursor-help"
                          style={{
                            background:
                              'repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 4px, #e2e8f0 4px, #e2e8f0 8px)',
                          }}
                          title={`ม.${row.villageNo} ${row.systemName}
❔ ไม่มีข้อมูลครัวเรือน`}
                        />
                      </div>
                    )
                  }

                  const normalPct = (row.normal!.ratio / yMax) * 100
                  const dryPct = (row.dry!.ratio / yMax) * 100
                  const dryColor = SUFFICIENCY_COLORS[row.dry!.level].hex
                  const normalColor = '#0ea5e9'

                  return (
                    <div
                      key={row.systemId}
                      className="flex-1 flex items-end justify-center gap-0.5 min-w-0 h-full"
                    >
                      {seasonFilter !== 'dry' && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={
                            inView
                              ? { height: `${Math.min(normalPct, 100)}%` }
                              : { height: 0 }
                          }
                          transition={{
                            duration: 0.7,
                            delay: 0.1 + idx * 0.04,
                            ease: 'easeOut',
                          }}
                          className="w-3 md:w-4 rounded-t cursor-pointer hover:brightness-110"
                          style={{ background: normalColor }}
                          title={`ม.${row.villageNo} ${row.systemName}
── ฤดูปกติ ──
ครัวเรือน: ${row.householdCount} หลัง (${row.normal!.peopleCount} คน)
ความต้องการ: ${row.normal!.dailyDemand} ลบ.ม./วัน
กำลังผลิตที่ต้องการ: ${row.normal!.requiredProduction} ลบ.ม./ชม.
กำลังผลิตที่มี: ${row.normal!.actualProduction} ลบ.ม./ชม.
ความเพียงพอ: ${row.normal!.ratio}%`}
                        />
                      )}

                      {seasonFilter !== 'normal' && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={
                            inView
                              ? { height: `${Math.min(dryPct, 100)}%` }
                              : { height: 0 }
                          }
                          transition={{
                            duration: 0.7,
                            delay: 0.2 + idx * 0.04,
                            ease: 'easeOut',
                          }}
                          className="w-3 md:w-4 rounded-t cursor-pointer hover:brightness-110"
                          style={{ background: dryColor }}
                          title={`ม.${row.villageNo} ${row.systemName}
── ฤดูแล้ง (×${DRY_SEASON_FACTOR}) ──
ครัวเรือน: ${row.householdCount} หลัง (${row.dry!.peopleCount} คน)
ความต้องการ: ${row.dry!.dailyDemand} ลบ.ม./วัน
กำลังผลิตที่ต้องการ: ${row.dry!.requiredProduction} ลบ.ม./ชม.
กำลังผลิตที่มี: ${row.dry!.actualProduction} ลบ.ม./ชม.
ความเพียงพอ: ${row.dry!.ratio}%`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* X-axis */}
          <div className="flex gap-1 ml-16 mt-2">
            {rows.map(row => (
              <div key={row.systemId} className="flex-1 min-w-0 text-center">
                <p className="text-[10px] font-semibold text-brand-700 truncate leading-tight">
                  ม.{row.villageNo}
                </p>
                <p className="text-[9px] text-slate-500 truncate leading-tight">
                  {row.systemName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
        <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
        <span>
          <strong>อ้างอิง:</strong> กรมทรัพยากรน้ำ ({WATER_PER_PERSON_PER_DAY}{' '}
          ลิตร/คน/วัน) · คู่มือการออกแบบระบบประปาหมู่บ้าน (
          {PEOPLE_PER_HOUSEHOLD} คน/ครัวเรือน · {PRODUCTION_HOURS_PER_DAY}{' '}
          ชม./วัน) · Peak Day Factor ฤดูแล้ง ×{DRY_SEASON_FACTOR}{' '}
          (มาตรฐานการประปาส่วนภูมิภาค)
        </span>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
  color,
  decimals = 0,
}: {
  label: string
  value: number
  unit?: string
  color: 'sky' | 'orange' | 'red' | 'emerald'
  decimals?: number
}) {
  const colorMap = {
    sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
  }
  const c = colorMap[color]

  const formatted = value.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <div className={`rounded-xl p-3 border ${c.bg} ${c.border}`}>
      <p className={`text-[10px] font-medium ${c.text} leading-tight`}>
        {label}
      </p>
      <p className={`text-2xl font-bold tabular-nums ${c.text} mt-1`}>
        {formatted}
      </p>
      {unit && (
        <p className={`text-[10px] ${c.text} opacity-70 mt-0.5`}>{unit}</p>
      )}
    </div>
  )
}