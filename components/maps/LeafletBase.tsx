'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
    ._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

interface Props {
  center?: [number, number]
  zoom?: number
  className?: string
  children: React.ReactNode
}

function ScrollFix() {
  const map = useMap()
  useEffect(() => {
    map.scrollWheelZoom.disable()
    const enable = () => map.scrollWheelZoom.enable()
    const disable = () => map.scrollWheelZoom.disable()
    map.on('click', enable)
    map.on('mouseout', disable)
    return () => {
      map.off('click', enable)
      map.off('mouseout', disable)
    }
  }, [map])
  return null
}

export default function LeafletBase({
  center = [19.1667, 99.9],
  zoom = 13,
  className = 'h-full w-full',
  children,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ScrollFix />
      {children}
    </MapContainer>
  )
}