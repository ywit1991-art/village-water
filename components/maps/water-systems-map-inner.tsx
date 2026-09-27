'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import LeafletBase from './LeafletBase'
import MapLegend from './map-legend'
import MapControls from './map-controls'
import MapSidebar from './map-sidebar'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { getRoute, fmtKm, fmtDuration, type RouteResult } from '@/lib/osrm'
import { STATUS_COLORS } from '@/lib/constants'
import type { WaterSystemWithVillage, Village } from '@/lib/types'

interface Props {
  systems: WaterSystemWithVillage[]
  villages: Village[]
}

function MapController({
  flyTo,
}: {
  flyTo: { lat: number; lng: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, { duration: 1 })
    }
  }, [flyTo, map])
  return null
}

function MeasureHandler({
  enabled,
  onClick,
}: {
  enabled: boolean
  onClick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!enabled) return
    const handler = (e: L.LeafletMouseEvent) =>
      onClick(e.latlng.lat, e.latlng.lng)
    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [enabled, map, onClick])
  return null
}

export default function WaterSystemsMapInner({ systems, villages }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([])
  const [measureRoute, setMeasureRoute] = useState<RouteResult | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const validSystems = useMemo(
    () => systems.filter(s => s.lat && s.lng),
    [systems],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      'ดี': 0,
      'พอใช้': 0,
      'ต้องปรับปรุง': 0,
      'เร่งด่วน': 0,
      'ไม่มีข้อมูล': 0,
    }
    validSystems.forEach(s => {
      const k = s.overall_condition ?? 'ไม่มีข้อมูล'
      c[k] = (c[k] ?? 0) + 1
    })
    return c
  }, [validSystems])

  const totalUsers = useMemo(
    () => validSystems.reduce((a, s) => a + (s.user_count ?? 0), 0),
    [validSystems],
  )
  const totalHouseholds = useMemo(
    () => validSystems.reduce((a, s) => a + (s.household_count ?? 0), 0),
    [validSystems],
  )

  const visibleSystems = useMemo(() => {
    if (!activeFilter) return validSystems
    return validSystems.filter(
      s => (s.overall_condition ?? 'ไม่มีข้อมูล') === activeFilter,
    )
  }, [validSystems, activeFilter])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function handleSelectSystem(id: number) {
    const s = validSystems.find(x => x.id === id)
    if (!s || !s.lat || !s.lng) return
    setSelectedId(id)
    setFlyTo({ lat: s.lat, lng: s.lng })
    setSidebarOpen(false)
  }

  function handleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  function handleLocate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('ไม่สามารถระบุตำแหน่งได้'),
    )
  }

  async function handleMeasureClick(lat: number, lng: number) {
    const p: [number, number] = [lat, lng]
    if (measurePoints.length === 0) {
      setMeasurePoints([p])
      setMeasureRoute(null)
    } else if (measurePoints.length === 1) {
      const next = [measurePoints[0], p] as [number, number][]
      setMeasurePoints(next)
      const r = await getRoute(next[0], next[1])
      if (r) setMeasureRoute(r)
    } else {
      setMeasurePoints([p])
      setMeasureRoute(null)
    }
  }

  function toggleMeasuring() {
    setIsMeasuring(m => !m)
    setMeasurePoints([])
    setMeasureRoute(null)
  }

  const routeLine: [number, number][] =
    measureRoute?.geometry.coordinates.map(([lng, lat]) => [lat, lng]) ?? []

  return (
    <div
      ref={containerRef}
      className="relative flex w-full h-[calc(100vh-64px)] min-h-[500px] bg-brand-50/40"
    >
      <MapSidebar
        systems={validSystems}
        villages={villages}
        counts={counts}
        totalUsers={totalUsers}
        totalHouseholds={totalHouseholds}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedId={selectedId}
        onSelect={handleSelectSystem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1">
        <LeafletBase
          center={[19.1667, 99.9]}
          zoom={12}
          className="w-full h-full"
        >
          <MapController flyTo={flyTo} />
          <MeasureHandler enabled={isMeasuring} onClick={handleMeasureClick} />

          {visibleSystems.map(s => (
            <Marker
              key={s.id}
              position={[s.lat!, s.lng!]}
              icon={createWaterMarkerIcon(
                s.overall_condition,
                s.user_count ?? 0,
              )}
              eventHandlers={{
                click: () => setSelectedId(s.id),
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <p className="font-bold text-brand-900 text-sm">
                    {s.system_name}
                  </p>
                  <p className="text-xs text-brand-500 mb-2">
                    หมู่ {s.village.village_no} {s.village.village_name}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                      style={{
                        background:
                          STATUS_COLORS[s.overall_condition ?? 'ไม่มีข้อมูล']
                            .hex,
                      }}
                    >
                      {s.overall_condition ?? 'ไม่มีข้อมูล'}
                    </span>
                  </div>

{s.photo_url && (
  <img
    src={s.photo_url}
    alt={s.system_name}
    className="w-full h-24 object-cover rounded-md mb-2"
  />
)}

<div className="space-y-0.5 text-[11px] text-slate-600 mb-2">
  <p>👥 ผู้ใช้: {s.user_count ?? 0} ราย</p>
  <p>🏠 ครัวเรือน: {s.household_count ?? 0}</p>
  {s.water_rate && <p>💰 อัตรา: {s.water_rate} บาท/หน่วย</p>}
  {s.last_survey_date && <p>📅 ตรวจล่าสุด: {s.last_survey_date}</p>}
</div>

                  <Link
                    href={`/villages/${s.village_id}?system=${s.id}`}
                    className="block text-center text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md py-1.5"
                  >
                    ดูรายละเอียด →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {routeLine.length > 0 && (
            <Polyline
              positions={routeLine}
              pathOptions={{ color: '#0ea5e9', weight: 5, dashArray: '8 6' }}
            />
          )}
        </LeafletBase>

        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-[1000] w-10 h-10 flex items-center justify-center bg-white border border-brand-100 rounded-lg shadow-md"
        >
          <Menu size={18} />
        </button>

        <MapLegend
          counts={counts}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <MapControls
          onFullscreen={handleFullscreen}
          onLocate={handleLocate}
          onMeasure={toggleMeasuring}
          onPrint={() => window.print()}
          isFullscreen={isFullscreen}
          isMeasuring={isMeasuring}
        />

        {isMeasuring && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur rounded-xl border border-brand-100 shadow-lg px-4 py-2 text-center">
            <p className="text-xs text-brand-600 font-medium">
              📏 โหมดวัดระยะทาง
            </p>
            {measurePoints.length === 1 && (
              <p className="text-[11px] text-brand-500">
                คลิกจุดที่ 2 เพื่อคำนวณเส้นทาง
              </p>
            )}
            {measureRoute && (
              <p className="text-[11px] text-brand-700 font-semibold">
                {fmtKm(measureRoute.distance)} ·{' '}
                {fmtDuration(measureRoute.duration)}
              </p>
            )}
            <button
              onClick={toggleMeasuring}
              className="text-[10px] text-brand-500 hover:underline mt-0.5"
            >
              ปิดโหมด
            </button>
          </div>
        )}
      </div>
    </div>
  )
}