'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface Props {
  boundary: GeoJSON.Feature | GeoJSON.FeatureCollection
  visible?: boolean
  hatchColor?: string
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

const HATCH_PATTERN_ID = 'thawangthong-hatch-pattern'

export default function ThawangthongBoundary({
  boundary,
  visible = true,
  hatchColor = '#94a3b8',
  outlineColor = '#7c3aed',
}: Props) {
  const map = useMap()

  useEffect(() => {
    // ลบ pattern เก่า
    const oldSvg = document.querySelector('svg.leaflet-zoom-animated')
    if (oldSvg) {
      const oldP = oldSvg.querySelector(`#${HATCH_PATTERN_ID}`)
      if (oldP) oldP.remove()
    }

    if (!visible) return

    const polygonFeature = extractPolygon(boundary)
    if (!polygonFeature) return
    const outerRing = getOuterRing(polygonFeature)
    if (!outerRing || outerRing.length < 3) return

    // World mask (โลก + รู)
    const worldRing: [number, number][] = [
      [-180, -90],
      [180, -90],
      [180, 90],
      [-180, 90],
      [-180, -90],
    ]

    const maskLatLngs = [
      worldRing.map(([lng, lat]) => [lat, lng] as [number, number]),
      outerRing.map(([lng, lat]) => [lat, lng] as [number, number]),
    ]

    const mask = L.polygon(maskLatLngs, {
      stroke: false,
      fillColor: '#ffffff',
      fillOpacity: 0,
      interactive: false,
    }).addTo(map)

    // Inject SVG pattern — บาง ๆ เบา ๆ
    const path = mask.getElement() as SVGPathElement | null
    if (path) {
      const svg = path.ownerSVGElement
      if (svg) {
        const existing = svg.querySelector(`#${HATCH_PATTERN_ID}`)
        if (existing) existing.remove()

        const defs = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'defs',
        )
        defs.innerHTML = `
          <pattern
            id="${HATCH_PATTERN_ID}"
            patternUnits="userSpaceOnUse"
            width="18"
            height="18"
            patternTransform="rotate(45)"
          >
            <line
              x1="0" y1="0"
              x2="0" y2="18"
              stroke="${hatchColor}"
              stroke-width="1.5"
              stroke-opacity="0.4"
            />
          </pattern>
        `
        svg.insertBefore(defs, svg.firstChild)
        path.setAttribute('fill', `url(#${HATCH_PATTERN_ID})`)
        path.setAttribute('fill-opacity', '1')
      }
    }

    // Outline ขอบเขต
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

    return () => {
      map.removeLayer(mask)
      map.removeLayer(outline)
      if (path?.ownerSVGElement) {
        const p = path.ownerSVGElement.querySelector(`#${HATCH_PATTERN_ID}`)
        if (p) p.remove()
      }
    }
  }, [map, boundary, visible, hatchColor, outlineColor])

  return null
}