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

export type MapLayerType = 'street' | 'satellite' | 'terrain'

interface Props {
  center?: [number, number]
  zoom?: number
  className?: string
  children: React.ReactNode
  layerType?: MapLayerType
}

const LAYER_URLS: Record<MapLayerType, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> · Maxar · Earthstar Geographics',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  },
}

/** จัดการขนาดแผนที่เมื่อ Fullscreen เปลี่ยน */
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

export default function LeafletBase({
  center = [19.1907, 99.9315], // ⭐ ตั้งพิกัดเริ่มต้นที่ท่าวังทอง
  zoom = 13,
  className = 'h-full w-full',
  children,
  layerType = 'street',
}: Props) {
  const layer = LAYER_URLS[layerType]

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={true}
      minZoom={11}
      maxZoom={19}
      maxBounds={[
        [18.95, 99.75],
        [19.4, 100.1],
      ]}
      maxBoundsViscosity={1.0}
      bounceAtZoomLimits={false}
    >
      <MapResizer />
      <TileLayer
        key={layerType} // ⭐ บังคับโหลด Layer ใหม่เมื่อเปลี่ยนประเภท
        url={layer.url}
        attribution={layer.attribution}
        maxZoom={19}
      />
      {children}
    </MapContainer>
  )
}