'use client'

import { useEffect, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { X } from 'lucide-react'
import LeafletBase from './LeafletBase'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { MarkerData } from './VillagesMapClient'

interface Props {
  markers: MarkerData[]
  height?: string
}

const HOVER_DELAY_MS = 500 // ⏱️ delay ก่อนเปิด modal (ปรับได้)

function AutoFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 16)
      return
    }
    const lats = points.map(p => p[0])
    const lngs = points.map(p => p[1])
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 })
  }, [points, map])
  return null
}

export default function VillagesMapInner({
  markers,
  height = 'h-[500px]',
}: Props) {
  const [selected, setSelected] = useState<MarkerData | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ล้าง timer เมื่อ unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }, [])

  // ปิด Modal เมื่อกด ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    if (selected) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selected])

  function cancelHover() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  function startHover(m: MarkerData) {
    cancelHover()
    hoverTimer.current = setTimeout(() => {
      setSelected(m)
    }, HOVER_DELAY_MS)
  }

  if (markers.length === 0) {
    return (
      <div
        className={`${height} rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center`}
      >
        <div className="text-center">
          <p className="text-base font-medium text-brand-600">
            ไม่พบระบบประปาตามเงื่อนไข
          </p>
          <p className="text-sm text-slate-400 mt-1">
            ลองเปลี่ยนตัวกรองหรือเลือก "ทั้งหมด"
          </p>
        </div>
      </div>
    )
  }

  const center: [number, number] = [markers[0].lat, markers[0].lng]
  const allPoints = markers.map(m => [m.lat, m.lng] as [number, number])

  return (
    <>
      <div
        className={`${height} rounded-2xl overflow-hidden border border-brand-100`}
      >
        <LeafletBase center={center} zoom={13} className="w-full h-full">
          <AutoFitBounds points={allPoints} />
          {markers.map(m => (
            <Marker
              key={m.systemId}
              position={[m.lat, m.lng]}
              icon={createWaterMarkerIcon(m.status, m.userCount)}
              eventHandlers={{
                click: () => {
                  cancelHover()
                  setSelected(m)
                },
                mouseover: () => startHover(m),
                mouseout: cancelHover,
              }}
            />
          ))}
        </LeafletBase>
      </div>

      {selected && (
        <DetailModal data={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

/* ============================================================ */
/* MODAL                                                        */
/* ============================================================ */
function DetailModal({
  data: m,
  onClose,
}: {
  data: MarkerData
  onClose: () => void
}) {
  const c = STATUS_COLORS[m.status] ?? STATUS_COLORS['ไม่มีข้อมูล']

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg"
          aria-label="ปิด"
        >
          <X size={22} />
        </button>

        {/* HERO */}
        <div
          className="relative px-8 py-6 text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${c.hex} 0%, ${c.hex}DD 60%, ${c.hex}BB 100%)`,
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-4 w-32 h-32 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center font-extrabold text-3xl text-white shadow-xl shrink-0 ring-2 ring-white/40">
              {m.systemNo}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl md:text-3xl font-extrabold leading-tight truncate">
                {m.systemName}
              </p>
              <p className="text-base text-white/95 mt-1 flex items-center gap-2">
                <span>📍</span>
                <span>
                  หมู่ {m.villageNo} {m.villageName}
                </span>
              </p>
              {m.productionTypes.length > 0 && (
                <p className="text-sm text-white/85 mt-1">
                  💧 {m.productionTypes.join(', ')}
                </p>
              )}
            </div>
            <div className="text-5xl shrink-0 drop-shadow-lg">
              {STATUS_EMOJI[m.status] ?? ''}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <StatBox
              value={m.householdCount.toLocaleString()}
              label="ครัวเรือน"
            />
            <StatBox
              value={m.tankCapacity != null ? `${m.tankCapacity}` : '–'}
              label="ความจุ (ลบ.ม.)"
            />
            <StatBox
              value={m.waterRate != null ? `${m.waterRate}` : '–'}
              label="บาท/หน่วย"
              suffix={m.waterRate != null ? '฿' : undefined}
            />
            <StatBox
              value={
                m.sufficiency === 'เพียงพอ'
                  ? 'เพียงพอ'
                  : m.sufficiency?.includes('ไม่เพียงพอ')
                    ? 'ไม่พอ'
                    : '–'
              }
              label="น้ำดิบ"
              small
            />
          </div>

          <div className="px-8 py-6 space-y-6">
            {m.operatorName && (
              <Section title="ช่างประปา">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-brand-50/30 border border-brand-100">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600 shrink-0 text-2xl">
                    👷
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-brand-900 truncate">
                      {m.operatorName}
                    </p>
                  </div>
                  {m.operatorPhone && (
                    <a
                      href={`tel:${m.operatorPhone}`}
                      className="text-base font-mono font-semibold text-brand-600 hover:text-brand-800 px-4 py-2 rounded-lg bg-white border border-brand-100 hover:border-brand-300 transition shrink-0"
                    >
                      {m.operatorPhone}
                    </a>
                  )}
                </div>
              </Section>
            )}

            {m.committee.length > 0 && (
              <Section title={`คณะกรรมการ (${m.committee.length} คน)`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {m.committee.map((person, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <p className="text-base font-semibold text-slate-800 truncate">
                            {person.name}
                          </p>
                          {person.phone && (
                            <a
                              href={`tel:${person.phone}`}
                              className="inline-flex items-center gap-1 text-sm font-mono font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                            >
                              📞 {person.phone}
                            </a>
                          )}
                        </div>
                        {person.position && (
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {person.position}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {m.problems.length > 0 && (
              <Section
                title={`ปัญหาที่พบ (${m.problems.length})`}
                accent="orange"
              >
                <ul className="space-y-2">
                  {m.problems.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-base text-slate-700 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-100"
                    >
                      <span className="text-orange-500 shrink-0 mt-0.5">●</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {m.photos.length > 0 && (
              <Section
                title={`ภาพถ่าย (${m.photos.length})`}
                accent="emerald"
              >
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {m.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md hover:scale-105 hover:shadow-xl transition-all ring-1 ring-slate-200"
                    >
                      <img
                        src={url}
                        alt={`ภาพที่ ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>

        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 shrink-0">
          <span>ระบบที่ {m.systemNo}</span>
          <span className="font-mono">
            {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/* SUB COMPONENTS                                               */
/* ============================================================ */
function StatBox({
  value,
  label,
  suffix,
  small,
}: {
  value: string
  label: string
  suffix?: string
  small?: boolean
}) {
  return (
    <div className="text-center py-5 px-2">
      <p
        className={`font-extrabold text-brand-900 leading-none tabular-nums ${
          small ? 'text-xl' : 'text-3xl md:text-4xl'
        }`}
      >
        {value}
        {suffix && (
          <span className="text-base text-brand-500 ml-1 font-semibold">
            {suffix}
          </span>
        )}
      </p>
      <p className="text-xs md:text-sm uppercase text-slate-400 font-semibold tracking-wider mt-2">
        {label}
      </p>
    </div>
  )
}

function Section({
  title,
  children,
  accent = 'brand',
}: {
  title: string
  children: React.ReactNode
  accent?: 'brand' | 'orange' | 'emerald'
}) {
  const colorMap = {
    brand: 'from-brand-400 to-brand-600',
    orange: 'from-orange-400 to-orange-600',
    emerald: 'from-emerald-400 to-emerald-600',
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-1.5 h-5 bg-gradient-to-b ${colorMap[accent]} rounded-full`}
        />
        <h3 className="text-base font-bold text-brand-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}