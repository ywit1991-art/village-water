'use client'

import { useEffect, useState } from 'react'
import { Marker, Polyline, Popup, useMap } from 'react-leaflet'
import LeafletBase from './LeafletBase'
import { getRoute, fmtKm, fmtDuration, type RouteResult } from '@/lib/osrm'

interface Point {
  lat: number
  lng: number
  label?: string
}

interface Props {
  from: Point
  to: Point
  height?: string
}

function FitBounds({ from, to }: { from: Point; to: Point }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(
      [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      { padding: [40, 40] },
    )
  }, [from, to, map])
  return null
}

export default function RouteMapInner({ from, to, height = 'h-80' }: Props) {
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getRoute([from.lng, from.lat], [to.lng, to.lat]).then(r => {
      setRoute(r)
      setLoading(false)
    })
  }, [from, to])

  const line: [number, number][] =
    route?.geometry.coordinates.map(([lng, lat]) => [lat, lng]) ?? []

  return (
    <div>
      <div
        className={`${height} rounded-xl overflow-hidden border border-brand-100`}
      >
        <LeafletBase center={[from.lat, from.lng]} zoom={13}>
          <FitBounds from={from} to={to} />
          <Marker position={[from.lat, from.lng]}>
            <Popup>{from.label ?? 'ต้นทาง'}</Popup>
          </Marker>
          <Marker position={[to.lat, to.lng]}>
            <Popup>{to.label ?? 'ปลายทาง'}</Popup>
          </Marker>
          {line.length > 0 && (
            <Polyline
              positions={line}
              pathOptions={{ color: '#0ea5e9', weight: 5 }}
            />
          )}
        </LeafletBase>
      </div>

      {loading && (
        <p className="text-xs text-brand-500 mt-2">กำลังคำนวณเส้นทาง...</p>
      )}

      {route && !loading && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="card p-3 text-center">
            <p className="text-xs text-brand-500">ระยะทางตามถนน</p>
            <p className="text-lg font-bold text-brand-800">
              {fmtKm(route.distance)}
            </p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xs text-brand-500">เวลาโดยประมาณ</p>
            <p className="text-lg font-bold text-brand-800">
              {fmtDuration(route.duration)}
            </p>
          </div>
        </div>
      )}

      {!loading && !route && (
        <p className="text-xs text-red-500 mt-2">
          ไม่สามารถคำนวณเส้นทางได้ ลองอีกครั้ง
        </p>
      )}
    </div>
  )
}