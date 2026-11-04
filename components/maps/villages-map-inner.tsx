'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import Image from 'next/image'
import {
  X,
  AlertCircle,
  Wrench,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  Maximize2,
  Minimize2,
  Activity,
  Droplet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Map as MapIcon,
  Satellite,
  ZoomIn,
} from 'lucide-react'
import LeafletBase, { type MapLayerType } from './LeafletBase'
import {
  createWaterMarkerIcon,
  createSufficiencyMarkerIcon,
} from '@/lib/map-icons'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import {
  calcSufficiency,
  SUFFICIENCY_COLORS,
} from '@/lib/water-sufficiency'
import type { MarkerData, MarkerMode } from './VillagesMapClient'
import { maskPhone } from '@/lib/utils/phone'
import ThawangthongBoundary from './thawangthong-boundary'
import StreetViewModal from './street-view-modal'
import { useFocusTrap } from '@/components/ui/use-focus-trap'
import { Portal } from '@/components/ui/portal'

interface Props {
  markers: MarkerData[]
  height?: string
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  markerMode?: MarkerMode
  onMarkerModeChange?: (mode: MarkerMode) => void
  fullscreenRef?: React.RefObject<HTMLDivElement | null>
}

const HOVER_DELAY_MS = 800

/** Auto fit bounds */
function AutoFitBounds({
  points,
  boundary,
}: {
  points: [number, number][]
  boundary: GeoJSON.FeatureCollection | GeoJSON.Feature | null
}) {
  const map = useMap()
  const hasFittedRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()

      if (boundary) {
        try {
          const layer = L.geoJSON(boundary)
          const bounds = layer.getBounds()
          
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [0, 0] })
            hasFittedRef.current = true
            return
          }
        } catch (e) {
          console.warn('Boundary fit error', e)
        }
      }

      if (points.length > 0 && !hasFittedRef.current) {
        const bounds = L.latLngBounds(points)
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
        hasFittedRef.current = true
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [points, map, boundary])

  return null
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function openDirections(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function VillagesMapInner({
  markers,
  height = 'h-[500px]',
  isFullscreen = false,
  onToggleFullscreen,
  markerMode: externalMode,
  onMarkerModeChange,
  fullscreenRef,
}: Props) {
  const [selected, setSelected] = useState<MarkerData | null>(null)
  const [boundary, setBoundary] = useState<
    GeoJSON.FeatureCollection | GeoJSON.Feature | null
  >(null)
  const [showHatch, setShowHatch] = useState(true)
  const [internalMode, setInternalMode] = useState<MarkerMode>(
    externalMode ?? 'sufficiency',
  )
  const [streetViewMarker, setStreetViewMarker] = useState<MarkerData | null>(
    null,
  )
  const [layerType, setLayerType] = useState<MapLayerType>('street')
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const markerMode = externalMode ?? internalMode
  const portalContainer = isFullscreen ? fullscreenRef?.current : null

  function setMarkerMode(mode: MarkerMode) {
    setInternalMode(mode)
    onMarkerModeChange?.(mode)
  }

  useEffect(() => {
    fetch('/data/thawangthong.geojson')
      .then(r => {
        if (!r.ok) throw new Error('GeoJSON 404')
        return r.json()
      })
      .then(data => setBoundary(data))
      .catch(err => console.warn('Boundary error:', err))
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }, [])

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

  function handleOpenStreetView(m: MarkerData) {
    setStreetViewMarker(m)
  }

  const allPoints = useMemo(
    () => markers.map(m => [m.lat, m.lng] as [number, number]),
    [markers],
  )

  const problemCount = useMemo(() => {
    return markers.filter(m => {
      const hasProblems = (m.problems ?? []).length > 0
      const badStatus =
        m.status === 'ต้องปรับปรุง' || m.status === 'เร่งด่วน'
      return hasProblems || badStatus
    }).length
  }, [markers])

  const visibleMarkers = useMemo(() => {
    if (markerMode !== 'problem') return markers
    return markers.filter(m => {
      const hasProblems = (m.problems ?? []).length > 0
      const badStatus =
        m.status === 'ต้องปรับปรุง' || m.status === 'เร่งด่วน'
      return hasProblems || badStatus
    })
  }, [markers, markerMode])

  if (markers.length === 0) {
    return (
      <div
        className={`${height} rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center`}
      >
        <div className="text-center">
          <p className="text-base font-medium text-brand-600">
            ไม่พบข้อมูลประปาตามเงื่อนไข
          </p>
          <p className="text-sm text-slate-400 mt-1">
            ลองเปลี่ยนตัวกรองหรือเลือก "ทั้งหมด"
          </p>
        </div>
      </div>
    )
  }

  const center: [number, number] = [19.1907, 99.9315]

  return (
    <>
      <div className={`${height} rounded-2xl overflow-hidden relative`}>
        <LeafletBase
          center={center}
          zoom={13}
          className="w-full h-full"
          layerType={layerType}
        >
          <MapResizer />
          <AutoFitBounds points={allPoints} boundary={boundary} />
          {boundary && (
            <ThawangthongBoundary boundary={boundary} visible={showHatch} />
          )}

          {visibleMarkers.map(m => {
            let icon
            if (markerMode === 'sufficiency') {
              const suff = calcSufficiency(
                m.householdCount,
                m.productionCapacity ?? null,
                m.tankCapacity,
                'dry',
                m.totalHP ?? 0,
              )
              icon = createSufficiencyMarkerIcon(suff.level, m.userCount)
            } else {
              icon = createWaterMarkerIcon(m.status, m.userCount)
            }

            return (
              <Marker
                key={m.systemId}
                position={[m.lat, m.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    cancelHover()
                    setSelected(m)
                  },
                  mouseover: () => startHover(m),
                  mouseout: cancelHover,
                }}
              />
            )
          })}
        </LeafletBase>

        {/* Controls */}
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100%-1.5rem)]">
          <div className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-brand-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setMarkerMode('status')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap active:scale-95 ${
                markerMode === 'status'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity size={14} />
              <span className="hidden md:inline">สถานะ</span>
            </button>

            <button
              type="button"
              onClick={() => setMarkerMode('problem')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
                markerMode === 'problem'
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle size={14} />
              <span className="hidden md:inline">จุดที่พบปัญหา</span>
              {problemCount > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center ${
                    markerMode === 'problem'
                      ? 'bg-white/25 text-white'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {problemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMarkerMode('sufficiency')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
                markerMode === 'sufficiency'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Droplet size={14} />
              <span className="hidden md:inline">ความเพียงพอ</span>
            </button>
          </div>

          <div className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-brand-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setLayerType('street')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap active:scale-95 ${
                layerType === 'street'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapIcon size={14} />
              <span className="hidden md:inline">ถนน</span>
            </button>

            <button
              type="button"
              onClick={() => setLayerType('satellite')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
                layerType === 'satellite'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Satellite size={14} />
              <span className="hidden md:inline">ดาวเทียม</span>
            </button>

            <button
              type="button"
              onClick={() => setLayerType('terrain')}
              className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-medium transition whitespace-nowrap border-l border-slate-100 active:scale-95 ${
                layerType === 'terrain'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers size={14} />
              <span className="hidden md:inline">ภูมิประเทศ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowHatch(s => !s)}
            className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg border border-brand-100 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-medium transition active:scale-95"
          >
            {showHatch ? (
              <>
                <EyeOff size={14} />
                <span className="hidden md:inline">ซ่อนลายทแยง</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span className="hidden md:inline">แสดงลายทแยง</span>
              </>
            )}
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg border border-brand-100 hover:bg-white text-slate-700 hover:text-slate-900 transition active:scale-95 shrink-0"
              title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'ขยายเต็มจอ'}
            >
              {isFullscreen ? (
                <Minimize2 size={14} />
              ) : (
                <Maximize2 size={14} />
              )}
            </button>
          )}
        </div>
      </div>

      {selected && (
        <Portal container={portalContainer}>
          <DetailModal
            data={selected}
            onClose={() => setSelected(null)}
            onOpenStreetView={handleOpenStreetView}
          />
        </Portal>
      )}

      {streetViewMarker && (
        <Portal container={portalContainer}>
          <StreetViewModal
            lat={streetViewMarker.lat}
            lng={streetViewMarker.lng}
            systemName={streetViewMarker.systemName}
            onClose={() => setStreetViewMarker(null)}
          />
        </Portal>
      )}
    </>
  )
}

/* ============================================================ */
/* MODAL รายละเอียด                                              */
/* ============================================================ */
function DetailModal({
  data: m,
  onClose,
  onOpenStreetView,
}: {
  data: MarkerData
  onClose: () => void
  onOpenStreetView: (m: MarkerData) => void
}) {
  const modalRef = useFocusTrap<HTMLDivElement>(true, onClose)
  const c = STATUS_COLORS[m.status] ?? STATUS_COLORS['ไม่มีข้อมูล']
  
  // ⭐ State สำหรับ Lightbox และการซูม/ลาก
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  // ⭐ Ref สำหรับ Touch และ Mouse
  const dragStartRef = useRef({ x: 0, y: 0 })
  const initialDistanceRef = useRef<number>(0)
  const initialScaleRef = useRef<number>(1)

  const suff = calcSufficiency(
    m.householdCount,
    m.productionCapacity ?? null,
    m.tankCapacity,
    'dry',
    m.totalHP ?? 0,
  )
  const suffColor = SUFFICIENCY_COLORS[suff.level]

  const committee = m.committee ?? []
  const problems = m.problems ?? []
  const improvements = m.improvements ?? []
  const photos = m.photos ?? []
  const productionTypes = m.productionTypes ?? []

  const isNoData = suff.level === 'no-data'

  // รีเซ็ตซูมเมื่อเปลี่ยนรูป
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [zoomIndex])

  // ⭐ ฟังก์ชันซูมด้วยลูกล้อ (Desktop)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomSensitivity = 0.0015
    const newScale = scale - e.deltaY * zoomSensitivity
    setScale(Math.min(Math.max(newScale, 1), 4))
    if (newScale <= 1) setPosition({ x: 0, y: 0 })
  }

  // ⭐ ฟังก์ชันลากภาพ (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale === 1) return
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // ⭐⭐⭐ ฟังก์ชัน Touch Events (Mobile) ⭐⭐⭐
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // ถ้าใช้นิ้ว 2 นิ้ว (Pinch) -> เก็บระยะห่างเริ่มต้น
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      initialDistanceRef.current = dist
      initialScaleRef.current = scale
    } else if (e.touches.length === 1 && scale > 1) {
      // ถ้าใช้นิ้ว 1 นิ้ว (Pan) และซูมอยู่ -> เริ่มลาก
      setIsDragging(true)
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // คำนวณระยะห่างใหม่ -> อัปเดต Scale
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
      const newScale = (dist / initialDistanceRef.current) * initialScaleRef.current
      setScale(Math.min(Math.max(newScale, 1), 4))
      if (newScale <= 1) setPosition({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && isDragging) {
      // ลากรูปด้วยนิ้วเดียว
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (scale <= 1) setPosition({ x: 0, y: 0 }) // ถ้าซูมสุดแล้วให้กลับมากลางจอ
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (zoomIndex === null) return
    setZoomIndex((zoomIndex + 1) % photos.length)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (zoomIndex === null) return
    setZoomIndex((zoomIndex - 1 + photos.length) % photos.length)
  }

  // Keyboard Navigation
  useEffect(() => {
    if (zoomIndex === null) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomIndex(null)
      if (e.key === 'ArrowRight') setZoomIndex(prev => (prev! + 1) % photos.length)
      if (e.key === 'ArrowLeft') setZoomIndex(prev => (prev! - 1 + photos.length) % photos.length)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomIndex, photos.length])

  return (
    <>
      {/* ⭐ z-[99999] เพื่อไม่ให้ Header บัง */}
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`รายละเอียด ${m.systemName}`}
          tabIndex={-1}
          className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col outline-none"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition shadow-lg active:scale-95"
            aria-label="ปิด"
          >
            <X size={22} />
          </button>

          {/* HERO */}
          <div
            className="relative px-4 md:px-8 py-5 md:py-6 text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${c.hex} 0%, ${c.hex}DD 60%, ${c.hex}BB 100%)`,
            }}
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -right-4 w-32 h-32 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-4 md:gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center font-extrabold text-2xl md:text-3xl text-white shadow-xl shrink-0 ring-2 ring-white/40">
                {m.systemNo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl md:text-3xl font-extrabold leading-tight truncate">
                  {m.systemName}
                </p>
                <p className="text-sm md:text-base text-white/95 mt-1 flex items-center gap-2">
                  <span>📍</span>
                  <span className="truncate">
                    หมู่ {m.villageNo} {m.villageName}
                  </span>
                </p>
                {productionTypes.length > 0 && (
                  <p className="text-xs md:text-sm text-white/85 mt-1 truncate">
                    💧 {productionTypes.join(', ')}
                  </p>
                )}
              </div>
              <div className="text-4xl md:text-5xl shrink-0 drop-shadow-lg hidden sm:block">
                {STATUS_EMOJI[m.status] ?? ''}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-slate-100 border-b border-slate-100">
              <StatBox
                value={(m.householdCount ?? 0).toLocaleString()}
                label="ครัวเรือน"
                small
              />
              <StatBox
                value={m.tankCapacity != null ? `${m.tankCapacity}` : '–'}
                label="ความจุ (ลบ.ม.)"
                small
              />
              <StatBox
                value={m.waterRate != null ? `${m.waterRate}` : '–'}
                label="บาท/หน่วย"
                suffix={m.waterRate != null ? '฿' : undefined}
                small
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
              <StatBox
                value={isNoData ? '—' : `${suff.ratio}%`}
                label={suffColor.label}
                small
                color={suffColor.hex}
              />
              <StatBox
                value={
                  m.updatedAt
                    ? new Date(m.updatedAt).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })
                    : m.surveyDate
                      ? new Date(m.surveyDate).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })
                      : '–'
                }
                label="ข้อมูลล่าสุด"
                small
              />
            </div>

            {isNoData && (
              <div className="px-4 md:px-8 pt-5">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl shrink-0">
                    ❔
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-slate-700 text-sm md:text-base">
                      ยังไม่มีข้อมูลสำหรับประเมิน
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 md:px-8 py-5 md:py-6 space-y-5 md:space-y-6">
              {m.operatorName && (
                <Section title="ช่างประปา">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-brand-50/30 border border-brand-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600 shrink-0 text-2xl">
                        👷
                      </div>
                      <p className="text-base md:text-lg font-bold text-brand-900 leading-tight min-w-0 flex-1">
                        {m.operatorName}
                      </p>
                    </div>
                    {m.operatorPhone && (
                      <a
                        href={`tel:${m.operatorPhone}`}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 text-base font-mono font-semibold text-brand-600 hover:text-brand-800 px-4 py-2.5 rounded-lg bg-white border border-brand-100 hover:border-brand-300 active:scale-95 transition"
                      >
                        📞 {maskPhone(m.operatorPhone)}
                      </a>
                    )}
                  </div>
                </Section>
              )}

              {committee.length > 0 && (
                <Section
                  title={`คณะกรรมการ`}
                  collapsible
                  defaultOpen={false}
                  count={committee.length}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {committee.map((person, i) => (
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
                                📞 {maskPhone(person.phone)}
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

              {problems.length > 0 && (
                <Section
                  title={`ปัญหาที่พบ (${problems.length})`}
                  accent="orange"
                  icon={<AlertCircle size={16} />}
                >
                  <ul className="space-y-2">
                    {problems.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-base text-slate-700 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-100"
                      >
                        <span className="w-6 h-6 rounded-md bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {improvements.length > 0 && (
                <Section
                  title={`จุดที่ควรแก้ไข/ปรับปรุง (${improvements.length})`}
                  accent="amber"
                  icon={<Wrench size={16} />}
                >
                  <ul className="space-y-2">
                    {improvements.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-base text-slate-700 bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-100"
                      >
                        <span className="w-6 h-6 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {photos.length > 0 && (
                <Section title={`ภาพถ่าย (${photos.length})`} accent="emerald">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {photos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setZoomIndex(i)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md hover:scale-105 hover:shadow-xl transition-all ring-1 ring-slate-200 cursor-pointer"
                      >
                        <Image
                          src={url}
                          alt={`ภาพที่ ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 33vw, 20vw"
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-4 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>ข้อมูลที่ {m.systemNo}</span>
              <span className="font-mono text-xs hidden sm:inline">
                {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  openDirections(m.lat, m.lng)
                }}
                className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Navigation size={18} />
                นำทาง
              </button>

              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpenStreetView(m)
                }}
                className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <MapPin size={18} />
                Street View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐⭐⭐ Lightbox Modal (ภาพขยาย ซูมด้วยลูกล้อ/นิ้ว ลากได้) ⭐⭐⭐ */}
      {zoomIndex !== null && (
        <div
          className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center backdrop-blur-md overflow-hidden touch-none"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            if (e.target === e.currentTarget && scale === 1) {
              setZoomIndex(null)
            }
          }}
        >
          {/* ปุ่มปิด */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setZoomIndex(null)
            }}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition active:scale-95 z-50 shadow-lg"
          >
            <X size={28} />
          </button>

          {/* คำแนะนำการใช้งาน */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white/80 px-4 py-2 rounded-full text-xs md:text-sm backdrop-blur-sm z-50 flex items-center gap-2 pointer-events-none opacity-70 hidden md:flex">
            <ZoomIn size={16} /> เลื่อนลูกล้อเพื่อซูม · คลิกค้างเพื่อลากภาพ
          </div>

          {/* ⭐ ปุ่มลูกศรซ้าย (ซ่อนเมื่อซูม) */}
          {photos.length > 1 && scale === 1 && (
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition active:scale-95 z-50"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          
          {/* ตัวรูปภาพ */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <div
              className={`relative transition-transform duration-75 ease-out ${
                scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              }`}
              style={{
                width: '100%',
                height: '100%',
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
              onMouseDown={handleMouseDown}
            >
              <Image
                src={photos[zoomIndex]}
                alt={`รูปภาพขยาย ${zoomIndex + 1}`}
                fill
                className="object-contain pointer-events-none select-none"
                sizes="100vw"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* ตัวเลขบอกลำดับ */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm backdrop-blur-sm z-50 pointer-events-none">
            {zoomIndex + 1} / {photos.length}
          </div>

          {/* ⭐ ปุ่มลูกศรขวา (ซ่อนเมื่อซูม) */}
          {photos.length > 1 && scale === 1 && (
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition active:scale-95 z-50"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  )
}

/* ============================================================ */
/* SUB COMPONENTS                                                */
/* ============================================================ */
function StatBox({
  value,
  label,
  suffix,
  small,
  color,
}: {
  value: string
  label: string
  suffix?: string
  small?: boolean
  color?: string
}) {
  return (
    <div className="text-center py-4 md:py-5 px-1.5 md:px-2">
      <p
        className={`font-extrabold leading-none tabular-nums ${
          small ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'
        }`}
        style={color ? { color } : undefined}
      >
        <span className={color ? '' : 'text-brand-900'}>{value}</span>
        {suffix && (
          <span className="text-base text-brand-500 ml-1 font-semibold">
            {suffix}
          </span>
        )}
      </p>
      <p className="text-[10px] md:text-xs uppercase text-slate-400 font-semibold tracking-wide mt-2">
        {label}
      </p>
    </div>
  )
}

function Section({
  title,
  children,
  accent = 'brand',
  icon,
  collapsible = false,
  defaultOpen = false,
  count,
}: {
  title: string
  children: React.ReactNode
  accent?: 'brand' | 'orange' | 'amber' | 'emerald'
  icon?: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  count?: number
}) {
  const [open, setOpen] = useState(defaultOpen)

  const colorMap = {
    brand: 'from-brand-400 to-brand-600',
    orange: 'from-orange-400 to-orange-600',
    amber: 'from-amber-400 to-amber-600',
    emerald: 'from-emerald-400 to-emerald-600',
  }
  const textMap = {
    brand: 'text-brand-800',
    orange: 'text-orange-800',
    amber: 'text-amber-800',
    emerald: 'text-emerald-800',
  }
  const hoverMap = {
    brand: 'hover:bg-brand-50',
    orange: 'hover:bg-orange-50',
    amber: 'hover:bg-amber-50',
    emerald: 'hover:bg-emerald-50',
  }

  if (!collapsible) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`w-1.5 h-5 bg-gradient-to-b ${colorMap[accent]} rounded-full`}
          />
          {icon && <span className={textMap[accent]}>{icon}</span>}
          <h3 className={`text-base font-bold ${textMap[accent]}`}>{title}</h3>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 mb-3 px-2 py-1.5 -mx-2 rounded-lg transition active:scale-[0.99] ${hoverMap[accent]}`}
        aria-expanded={open}
      >
        <span
          className={`w-1.5 h-5 bg-gradient-to-b ${colorMap[accent]} rounded-full shrink-0`}
        />
        {icon && <span className={textMap[accent]}>{icon}</span>}
        <h3 className={`text-base font-bold ${textMap[accent]} flex-1 text-left`}>
          {title}
        </h3>
        {count != null && !open && (
          <span className="text-xs text-slate-400 font-normal">
            ({count} คน)
          </span>
        )}
        <ChevronDown
          size={16}
          className={`${textMap[accent]} transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}