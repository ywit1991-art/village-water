'use client'

import { Marker, Popup } from 'react-leaflet'
import LeafletBase from '@/components/maps/LeafletBase'
import { createWaterMarkerIcon } from '@/lib/map-icons'
import { STATUS_COLORS } from '@/lib/constants'
import type { WaterSystem } from '@/lib/types'

export default function VillageSystemsMapInner({
  systems,
}: {
  systems: WaterSystem[]
}) {
  const valid = systems.filter(s => s.lat && s.lng)

  if (valid.length === 0) {
    return (
      <div className="card p-8 text-center text-brand-400 text-sm">
        ยังไม่มีพิกัดของระบบประปา
      </div>
    )
  }

  // คำนวณ bounds
  const lats = valid.map(s => s.lat!)
  const lngs = valid.map(s => s.lng!)
  const center: [number, number] = [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ]

  return (
    <div className="h-[360px] rounded-2xl overflow-hidden border border-brand-100">
      <LeafletBase center={center} zoom={14}>
        {valid.map(s => (
          <Marker
            key={s.id}
            position={[s.lat!, s.lng!]}
            icon={createWaterMarkerIcon(s.overall_condition, s.user_count ?? 0)}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-bold text-brand-900 text-sm">
                  {s.system_name}
                </p>
                <div className="mt-1 mb-1">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{
                      background:
                        STATUS_COLORS[s.overall_condition ?? 'ไม่มีข้อมูล'].hex,
                    }}
                  >
                    {s.overall_condition ?? 'ไม่มีข้อมูล'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  👥 {s.user_count ?? 0} ราย · 🏠 {s.household_count ?? 0} ครัวเรือน
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletBase>
    </div>
  )
}