import L from 'leaflet'
import { STATUS_COLORS, getMarkerSize } from './constants'

export function createWaterMarkerIcon(
  condition: string | null,
  userCount: number = 0,
  emoji: string = '💧',
): L.DivIcon {
  const c = condition ?? 'ไม่มีข้อมูล'
  const color = STATUS_COLORS[c]?.hex ?? STATUS_COLORS['ไม่มีข้อมูล'].hex
  const size = getMarkerSize(userCount)
  const height = Math.round(size * 1.3)

  const html = `
    <div style="position:relative;width:${size}px;height:${height}px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.25))">
      <svg viewBox="0 0 40 52" style="width:100%;height:100%">
        <path d="M20 1 C20 1, 2 22, 2 32 C2 43, 10 51, 20 51 C30 51, 38 43, 38 32 C38 22, 20 1, 20 1 Z"
              fill="${color}" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      </svg>
      <div style="position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);font-size:${Math.round(size * 0.42)}px;line-height:1;user-select:none">
        ${emoji}
      </div>
    </div>`

  return L.divIcon({
    html,
    className: 'water-marker-icon',
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 8],
  })
}