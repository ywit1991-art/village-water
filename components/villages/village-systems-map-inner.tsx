'use client'

import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import LeafletBase from '@/components/maps/LeafletBase'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { WaterSystem, Survey, CommitteeMember } from '@/lib/types'

interface Props {
  systems: WaterSystem[]
  surveys: Survey[]
}

function getCoordinates(
  s: WaterSystem,
  survey: Survey | null,
): [number, number] | null {
  const lat = survey?.lat ?? s.lat
  const lng = survey?.lng ?? s.lng
  if (!lat || !lng) return null
  return [lat, lng]
}

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

export default function VillageSystemsMapInner({ systems, surveys }: Props) {
  const markersRef = useRef<Record<number, L.Marker | null>>({})
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    // ถ้าคลิกที่แผนที่หรือ popup → ไม่ปิด
    if (target.closest('.leaflet-container') || target.closest('.leaflet-popup')) {
      return
    }
    // ปิด popup ทุกตัว
    Object.values(markersRef.current).forEach(m => m?.closePopup())
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
  const latestBySystem = new Map<number, Survey>()
  surveys.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  const markers = systems
    .map(s => {
      const survey = latestBySystem.get(s.id) ?? null
      const coords = getCoordinates(s, survey)
      if (!coords) return null
      return { system: s, survey, coords }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  if (markers.length === 0) {
    return (
      <div className="card p-8 text-center text-brand-400 text-base">
        ยังไม่มีพิกัดของข้อมูลประปา
      </div>
    )
  }

  const center: [number, number] = markers[0].coords
  const allPoints = markers.map(m => m.coords)

  return (
    <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-brand-100 shadow-lg">
      <LeafletBase center={center} zoom={14} className="w-full h-full">
        <AutoFitBounds points={allPoints} />

        {markers.map(({ system: s, survey, coords }) => {
          const condition =
            survey?.overall_condition ?? s.overall_condition ?? 'ไม่มีข้อมูล'
          const c = STATUS_COLORS[condition]
          const committee = (survey?.committee_members ?? []) as CommitteeMember[]
          const problems = (survey?.problems ?? []).filter(
            (p): p is string => typeof p === 'string' && p.length > 0,
          )
          const productionTypes = (survey?.production_type ?? []).filter(
            (t): t is string => typeof t === 'string' && t.length > 0,
          )
          const sufficiency = survey?.water_source_sufficiency ?? null
          const householdCount = survey?.household_count ?? s.household_count ?? 0
          const tankCapacity = survey?.tank_capacity ?? s.tank_capacity ?? null
          const photos = (survey?.photos ?? []).filter(Boolean) as string[]

          return (
            <Marker
              key={s.id}
              ref={m => {
                markersRef.current[s.id] = m
              }}
              position={coords}
              icon={createWaterMarkerIcon(condition, s.user_count ?? 0)}
              eventHandlers={{
                mouseover: () => {
                  markersRef.current[s.id]?.openPopup()
                },
              }}
            >
              <Popup maxWidth={680} minWidth={620}>
                <div className="font-sans">
{/* ===== Header — เตี้ยลง ===== */}
<div className="px-4 py-2 border-b-2 border-slate-200">
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
        style={{ background: c.hex }}
      >
        {s.system_no}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-brand-900 text-base leading-tight truncate">
          {s.system_name}
        </p>
        {productionTypes.length > 0 && (
          <p className="text-xs text-slate-500 leading-tight truncate">
            ประเภทข้อมูลผลิต: {productionTypes.join(', ')}
          </p>
        )}
      </div>
    </div>
    <span className="text-xl shrink-0" title={condition}>
      {STATUS_EMOJI[condition] ?? ''}
    </span>
  </div>
</div>

                  {/* ===== 2-Column Body ===== */}
                  <div className="grid grid-cols-[1fr_1fr] divide-x divide-slate-100">
                    {/* LEFT COLUMN */}
                    <div className="px-5 py-3.5 space-y-3">
                      {/* ข้อมูลหลัก */}
                      <div className="space-y-2">
                        <Row label="ครัวเรือน" value={`${householdCount}`} />
                        <Row
                          label="ความจุ"
                          value={
                            tankCapacity != null ? `${tankCapacity} ลบ.ม.` : '–'
                          }
                        />
                        <Row
                          label="น้ำดิบ"
                          value={
                            sufficiency === 'เพียงพอ'
                              ? 'เพียงพอ'
                              : sufficiency?.includes('ไม่เพียงพอ')
                                ? 'ไม่เพียงพอ'
                                : '–'
                          }
                        />
                      </div>

                      {/* ช่างประปา */}
                      {survey?.operator_name && (
                        <div className="pt-2.5 border-t border-slate-100">
                          <p className="text-sm text-slate-500 mb-0.5">
                            ช่างประปา
                          </p>
                          <p className="text-base font-medium text-slate-800 leading-tight">
                            {survey.operator_name}
                          </p>
                          {survey.operator_phone && (
                            <a
                              href={`tel:${survey.operator_phone}`}
                              className="text-sm text-brand-600 hover:underline font-mono"
                            >
                              {survey.operator_phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="px-5 py-3.5 space-y-3">
                      {/* คณะกรรมการ */}
                      {committee.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            คณะกรรมการ ({committee.length} คน)
                          </p>
                          <ol className="space-y-0.5 text-sm text-slate-700 max-h-24 overflow-y-auto">
                            {committee.map((m, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-slate-400 shrink-0">
                                  {i + 1}.
                                </span>
                                <span className="flex-1">
                                  <span className="font-medium">{m.name}</span>
                                  {m.position && (
                                    <span className="text-slate-500">
                                      {' '}
                                      · {m.position}
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* ปัญหา */}
                      {problems.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-100">
                          <p className="text-sm text-slate-500 mb-1">
                            ปัญหาที่พบ ({problems.length})
                          </p>
                          <ul className="space-y-0.5 text-sm text-slate-700 max-h-20 overflow-y-auto">
                            {problems.map((p, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-slate-400 shrink-0">•</span>
                                <span className="line-clamp-2">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ===== Photos (ท้าย popup) ===== */}
                  {photos.length > 0 && (
                    <div className="px-5 py-3 border-t-2 border-slate-200">
                      <p className="text-sm text-slate-500 mb-1.5">
                        ภาพถ่าย ({photos.length})
                      </p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {photos.slice(0, 6).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded overflow-hidden border border-brand-100 hover:border-brand-300 transition"
                          >
                            <img
                              src={url}
                              alt={`ภาพที่ ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </LeafletBase>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-base font-medium text-slate-800">{value}</span>
    </div>
  )
}