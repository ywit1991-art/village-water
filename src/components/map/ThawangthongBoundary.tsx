'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface Props {
  boundary: GeoJSON.Feature | GeoJSON.FeatureCollection
  spaceColor?: string
  outlineColor?: string
}

function extractPolygon(
  data: GeoJSON.Feature | GeoJSON.FeatureCollection,
): GeoJSON.Feature | null {
  const candidates: GeoJSON.Feature[] =
    data.type === 'FeatureCollection' ? data.features : [data]

  for (const f of candidates) {
    const t = f.geometry?.type
    if (t === 'Polygon' || t === 'MultiPolygon') return f
  }
  return null
}

function getOuterRing(feature: GeoJSON.Feature): number[][] | null {
  if (!feature.geometry) return null
  if (feature.geometry.type === 'Polygon') {
    return (feature.geometry as GeoJSON.Polygon).coordinates[0]
  }
  if (feature.geometry.type === 'MultiPolygon') {
    const polygons = (feature.geometry as GeoJSON.MultiPolygon).coordinates
    let best: number[][] | null = null
    for (const p of polygons) {
      if (!best || p[0].length > best.length) best = p[0]
    }
    return best
  }
  return null
}

export default function ThawangthongBoundary({
  boundary,
  spaceColor = '#ffffff', // เปลี่ยนเป็นสีขาว
  outlineColor = '#EC4899', // สีชมพู
}: Props) {
  const map = useMap()

  useEffect(() => {
    const polygonFeature = extractPolygon(boundary)
    if (!polygonFeature) {
      console.warn('[Boundary] ไม่พบ Polygon')
      return
    }

    const outerRing = getOuterRing(polygonFeature)
    if (!outerRing || outerRing.length < 3) {
      console.warn('[Boundary] outer ring ไม่ถูกต้อง')
      return
    }

    // 1. World mask polygon (สร้างหน้ากากสีขาวคลุมโลกทั้งใบ ยกเว้นพื้นที่ตำบล)
    const worldRing: [number, number][] = [
      [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
    ]

    const maskLatLngs = [
      worldRing.map(([lng, lat]) => [lat, lng] as [number, number]),
      outerRing.map(([lng, lat]) => [lat, lng] as [number, number]),
    ]

    // ลบโค้ด SVG Pattern ออก และใช้สีขาวทึบแทน
    const mask = L.polygon(maskLatLngs, {
      stroke: false,
      fillColor: spaceColor,
      fillOpacity: 0.85, // ความทึบของสีขาว (0.85 จะเห็นแผนที่จางๆ ด้านหลัง)
      interactive: false,
    }).addTo(map)

    // 2. Outline ของขอบเขตตำบล (เส้นประสีชมพู)
    const outline = L.geoJSON(polygonFeature, {
      style: {
        color: outlineColor,
        weight: 3,
        dashArray: '10 6',
        fillOpacity: 0,
        opacity: 0.95,
      },
      interactive: false,
    }).addTo(map)

    // Cleanup
    return () => {
      map.removeLayer(mask)
      map.removeLayer(outline)
    }
  }, [map, boundary, spaceColor, outlineColor])

  return null
}