'use client'

import { useState } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import LeafletBase from './LeafletBase'

interface Props {
  value: { lat: number; lng: number } | null
  onChange: (v: { lat: number; lng: number }) => void
  height?: string
}

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPickerInner({
  value,
  onChange,
  height = 'h-72',
}: Props) {
  const [pos, setPos] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null,
  )

  function handle(lat: number, lng: number) {
    setPos([lat, lng])
    onChange({ lat, lng })
  }

  return (
    <div>
      <div
        className={`${height} rounded-xl overflow-hidden border border-brand-100`}
      >
        <LeafletBase center={pos ?? [19.1667, 99.9]} zoom={pos ? 15 : 12}>
          <ClickHandler onClick={handle} />
          {pos && <Marker position={pos} />}
        </LeafletBase>
      </div>
      <p className="text-xs text-brand-600 mt-2">
        💡 คลิกบนแผนที่เพื่อเลือกตำแหน่ง
        {pos && ` · ${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}`}
      </p>
    </div>
  )
}