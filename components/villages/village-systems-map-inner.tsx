'use client'

import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import LeafletBase from '@/components/maps/LeafletBase'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { WaterSystem, Survey, CommitteeMember } from '@/lib/types'
import { Phone, Home, UserCheck, AlertCircle, Droplets, Package } from 'lucide-react'

interface Props {
  systems: WaterSystem[]
  surveys: Survey[]
}

function AutoFitBounds({ systems }: { systems: WaterSystem[] }) {
  const map = useMap()
  useEffect(() => {
    if (systems.length === 0) return
    if (systems.length === 1) {
      const s = systems[0]
      if (s.lat && s.lng) map.setView([s.lat, s.lng], 16)
      return
    }
    const lats = systems.map(s => s.lat!).filter(Boolean)
    const lngs = systems.map(s => s.lng!).filter(Boolean)
    if (lats.length === 0) return
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 })
  }, [systems, map])
  return null
}

export default function VillageSystemsMapInner({ systems, surveys }: Props) {
  const valid = systems.filter(s => s.lat && s.lng)
  const markersRef = useRef<Record<number, L.Marker | null>>({})

  if (valid.length === 0) {
    return (
      <div className="card p-8 text-center text-brand-400 text-base">
        ยังไม่มีพิกัดของระบบประปา
      </div>
    )
  }

  const center: [number, number] = [valid[0].lat!, valid[0].lng!]

  const latestBySystem = new Map<number, Survey>()
  surveys.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  return (
    <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-brand-100 shadow-lg">
      <LeafletBase center={center} zoom={14} className="w-full h-full">
        <AutoFitBounds systems={valid} />

        {valid.map(s => {
          const survey = latestBySystem.get(s.id) ?? null
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

          // ⚡ ใช้ค่าจาก survey ก่อน → fallback water_systems
          const householdCount = survey?.household_count ?? s.household_count ?? 0
          const tankCapacity = survey?.tank_capacity ?? s.tank_capacity ?? null

          return (
            <Marker
              key={s.id}
              ref={m => {
                markersRef.current[s.id] = m
              }}
              position={[s.lat!, s.lng!]}
              icon={createWaterMarkerIcon(condition, s.user_count ?? 0)}
              eventHandlers={{
                mouseover: () => {
                  markersRef.current[s.id]?.openPopup()
                },
              }}
            >
              <Popup maxWidth={380} minWidth={340}>
                <div className="space-y-3" style={{ fontSize: '15px' }}>
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: c.hex, fontSize: '16px' }}
                    >
                      {s.system_no}
                    </div>
                    <p
                      className="font-bold text-brand-900 leading-tight flex-1"
                      style={{ fontSize: '16px' }}
                    >
                      {s.system_name}
                    </p>
                    <span className="text-2xl shrink-0" title={condition}>
                      {STATUS_EMOJI[condition] ?? ''}
                    </span>
                  </div>

                  {/* ประเภทระบบผลิต */}
                  {productionTypes.length > 0 && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Droplets size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-brand-500"
                          style={{ fontSize: '12px' }}
                        >
                          ประเภทระบบผลิต
                        </p>
                        <p
                          className="font-medium text-brand-900 leading-snug"
                          style={{ fontSize: '14px' }}
                        >
                          {productionTypes.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats 3 cols */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2.5 rounded-lg bg-brand-50/60">
                      <div className="w-7 h-7 mx-auto rounded-md bg-white text-brand-600 flex items-center justify-center mb-1.5">
                        <Home size={14} />
                      </div>
                      <p
                        className="font-bold text-brand-900 leading-tight"
                        style={{ fontSize: '17px' }}
                      >
                        {householdCount}
                      </p>
                      <p
                        className="text-brand-500 mt-0.5"
                        style={{ fontSize: '11px' }}
                      >
                        ครัวเรือน
                      </p>
                    </div>

                    <div className="text-center p-2.5 rounded-lg bg-brand-50/60">
                      <div className="w-7 h-7 mx-auto rounded-md bg-white text-brand-600 flex items-center justify-center mb-1.5">
                        <Package size={14} />
                      </div>
                      <p
                        className="font-bold text-brand-900 leading-tight"
                        style={{ fontSize: '17px' }}
                      >
                        {tankCapacity ?? '–'}
                      </p>
                      <p
                        className="text-brand-500 mt-0.5"
                        style={{ fontSize: '11px' }}
                      >
                        ความจุ (ลบ.ม.)
                      </p>
                    </div>

                    <div className="text-center p-2.5 rounded-lg bg-brand-50/60">
                      <div className="w-7 h-7 mx-auto rounded-md bg-white flex items-center justify-center mb-1.5 text-lg leading-none">
                        {sufficiency
                          ? sufficiency === 'เพียงพอ'
                            ? '✅'
                            : sufficiency.includes('ไม่เพียงพอ')
                              ? '⚠️'
                              : '❔'
                          : '❔'}
                      </div>
                      <p
                        className="font-bold text-brand-900 leading-tight"
                        style={{ fontSize: '14px' }}
                      >
                        {sufficiency === 'เพียงพอ'
                          ? 'พอ'
                          : sufficiency?.includes('ไม่เพียงพอ')
                            ? 'ไม่พอ'
                            : '–'}
                      </p>
                      <p
                        className="text-brand-500 mt-0.5"
                        style={{ fontSize: '11px' }}
                      >
                        น้ำดิบ
                      </p>
                    </div>
                  </div>

                  {/* ช่างประปา */}
                  {survey?.operator_name && (
                    <div className="p-2.5 rounded-lg bg-brand-50/60 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-white text-brand-600 flex items-center justify-center shrink-0">
                        <Phone size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-brand-500"
                          style={{ fontSize: '11px' }}
                        >
                          ช่างประปา
                        </p>
                        <p
                          className="font-medium text-brand-900 truncate"
                          style={{ fontSize: '14px' }}
                        >
                          {survey.operator_name}
                        </p>
                      </div>
                      {survey.operator_phone && (
                        <a
                          href={`tel:${survey.operator_phone}`}
                          className="font-mono text-brand-600 hover:underline shrink-0"
                          style={{ fontSize: '12px' }}
                        >
                          {survey.operator_phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* คณะกรรมการ */}
                  {committee.length > 0 && (
                    <div>
                      <p
                        className="font-semibold text-brand-600 mb-1.5 flex items-center gap-1.5"
                        style={{ fontSize: '13px' }}
                      >
                        <UserCheck size={13} />
                        คณะกรรมการ ({committee.length} คน)
                      </p>
                      <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {committee.map((m, i) => (
                          <li
                            key={i}
                            className="text-slate-700 flex gap-1.5"
                            style={{ fontSize: '12px' }}
                          >
                            <span className="text-brand-400 shrink-0">
                              {i + 1}.
                            </span>
                            <span className="flex-1 truncate">
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
                      </ul>
                    </div>
                  )}

                  {/* ปัญหา */}
                  {problems.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                      <p
                        className="font-semibold text-orange-700 mb-1 flex items-center gap-1.5"
                        style={{ fontSize: '13px' }}
                      >
                        <AlertCircle size={13} />
                        ปัญหา ({problems.length})
                      </p>
                      <ul className="space-y-0.5">
                        {problems.slice(0, 2).map((p, i) => (
                          <li
                            key={i}
                            className="text-slate-700 flex gap-1.5"
                            style={{ fontSize: '12px' }}
                          >
                            <span className="text-orange-500 shrink-0">•</span>
                            <span className="line-clamp-2">{p}</span>
                          </li>
                        ))}
                        {problems.length > 2 && (
                          <li
                            className="text-orange-500 pl-3"
                            style={{ fontSize: '11px' }}
                          >
                            และอีก {problems.length - 2} ข้อ
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* รูป 3 ภาพ */}
                  {survey?.photos && survey.photos.filter(Boolean).length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {survey.photos
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded overflow-hidden border border-brand-100"
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover hover:scale-110 transition"
                            />
                          </a>
                        ))}
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