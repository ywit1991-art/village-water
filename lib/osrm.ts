export interface RouteResult {
  distance: number
  duration: number
  geometry: GeoJSON.LineString
}

const OSRM_BASE =
  process.env.NEXT_PUBLIC_OSRM_URL || 'https://router.project-osrm.org'

export async function getRoute(
  from: [number, number],
  to: [number, number],
  profile: 'driving' | 'foot' | 'bike' = 'driving',
): Promise<RouteResult | null> {
  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`
  const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const r = data.routes?.[0]
    if (!r) return null
    return {
      distance: r.distance,
      duration: r.duration,
      geometry: r.geometry as GeoJSON.LineString,
    }
  } catch {
    return null
  }
}

export const fmtKm = (m: number) =>
  m < 1000 ? `${Math.round(m)} ม.` : `${(m / 1000).toFixed(2)} กม.`

export const fmtDuration = (s: number) => {
  const m = Math.round(s / 60)
  return m < 60 ? `${m} นาที` : `${Math.floor(m / 60)} ชม. ${m % 60} นาที`
}