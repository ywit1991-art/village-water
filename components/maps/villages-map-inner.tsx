'use client'

import { useEffect } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import LeafletBase from './LeafletBase'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { STATUS_COLORS } from '@/lib/constants'
import type { MapPoint } from './VillagesMapClient'

interface Props {
  points: MapPoint[]
}

/**
 * จัด bounds อัตโนมัติให้พอดีกับ markers ทุกตัว
 */
function AutoFitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    if (points.length === 1) {
      // มีหมุดเดียว → zoom เข้า
      map.setView([points[0].lat, points[0].lng], 16)
      return
    }

    const lats = points.map(p => p.lat)
    const lngs = points.map(p => p.lng)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 16,   // ไม่ zoom เกิน 16
    })
  }, [points, map])

  return null
}

export default function VillagesMapInner({ points }: Props) {
  if (!points.length) {
    return (
      <div className="card p-10 text-center text-brand-400">
        ยังไม่มีข้อมูลพิกัดในระบบ
      </div>
    )
  }

  const center: [number, number] = [points[0].lat, points[0].lng]

  return (
    <div className="w-full aspect-[21/9] min-h-[400px] max-h-[700px] rounded-2xl overflow-hidden border border-brand-100 shadow-lg">
      <LeafletBase center={center} zoom={11} className="w-full h-full">
        <AutoFitBounds points={points} />

        {points.map(p => {
          const c = STATUS_COLORS[p.status] ?? STATUS_COLORS['ไม่มีข้อมูล']

          return (
            <Marker
              key={p.systemId ?? p.id}
              position={[p.lat, p.lng]}
              icon={createWaterMarkerIcon(p.status, p.userCount ?? 0)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-bold text-brand-900 text-sm">{p.name}</p>
                  {p.villageLabel && (
                    <p className="text-xs text-brand-500 mb-2">
                      {p.villageLabel}
                    </p>
                  )}

                  <div className="mb-2">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                      style={{ background: c.hex }}
                    >
                      {p.status}
                    </span>
                  </div>

                  <a
                    href={`/villages/${p.id}`}
                    className="block text-center text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md py-1.5"
                  >
                    ดูรายละเอียด →
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </LeafletBase>
    </div>
  )
}