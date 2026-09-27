'use client'

import Link from 'next/link'
import { Marker, Popup } from 'react-leaflet'
import LeafletBase from './LeafletBase'

interface Point {
  id: number
  name: string
  lat: number
  lng: number
  status: string
}

const STATUS_EMOJI: Record<string, string> = {
  'ดี': '✅',
  'พอใช้': '⚠️',
  'ต้องปรับปรุง': '🔧',
  'เร่งด่วน': '🚨',
  'ไม่มีข้อมูล': '❔',
}

export default function VillagesMapInner({ points }: { points: Point[] }) {
  if (!points.length) {
    return (
      <div className="card p-10 text-center text-brand-400">
        ยังไม่มีข้อมูลพิกัดในระบบ
      </div>
    )
  }

  const center: [number, number] = [points[0].lat, points[0].lng]

  return (
    <div className="h-[420px] rounded-2xl overflow-hidden border border-brand-100">
      <LeafletBase center={center} zoom={12}>
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              <span style={{ fontSize: '12px' }}>
                {STATUS_EMOJI[p.status] ?? ''} สถานะ: {p.status}
              </span>
              <br />
              <Link
                href={`/villages/${p.id}`}
                style={{
                  color: '#0284c7',
                  fontSize: '12px',
                  textDecoration: 'underline',
                }}
              >
                ดูรายละเอียด →
              </Link>
            </Popup>
          </Marker>
        ))}
      </LeafletBase>
    </div>
  )
}