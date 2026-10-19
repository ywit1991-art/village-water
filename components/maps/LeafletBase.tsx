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

// ⭐ กำหนด maxZoom ให้ตรงกับที่แต่ละ Provider รองรับ
const LAYER_URLS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> · Maxar · Earthstar Geographics',
    maxZoom: 18, // ⭐ ดาวเทียมส่วนใหญ่จะชัดสุดประมาณ 18
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17, // ⭐ OpenTopoMap จำกัดที่ 17
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
  center = [19.1907, 99.9315],
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
      minZoom={10}
      // ⭐ ใช้ maxZoom ของแต่ละ Layer แทนการฟิกซ์ที่ 20
      maxZoom={layer.maxZoom} 
      zoomSnap={0.5}
    >
      <MapResizer />
      <TileLayer
        key={layerType} 
        url={layer.url}
        attribution={layer.attribution}
        // ⭐ ใส่ maxZoom ให้ TileLayer ด้วย
        maxZoom={layer.maxZoom} 
      />
      {children}
    </MapContainer>
  )
}