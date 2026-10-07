import L from 'leaflet'
import { STATUS_COLORS, getMarkerSize } from './constants'
import {
  SUFFICIENCY_COLORS,
  type SufficiencyLevel,
} from './water-sufficiency'

const STATUS_EMOJI: Record<string, string> = {
  'ดี': '✅',
  'พอใช้': '⚠️',
  'ต้องปรับปรุง': '🔧',
  'เร่งด่วน': '🚨',
  'ไม่มีข้อมูล': '❔',
}

export function createWaterMarkerIcon(
  condition: string | null,
  userCount: number = 0,
): L.DivIcon {
  const c = condition ?? 'ไม่มีข้อมูล'
  const color = STATUS_COLORS[c]?.hex ?? STATUS_COLORS['ไม่มีข้อมูล'].hex
  const emoji = STATUS_EMOJI[c] ?? STATUS_EMOJI['ไม่มีข้อมูล']
  const size = getMarkerSize(userCount)

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.round(size * 0.5)}px;
      line-height: 1;
      user-select: none;
    ">${emoji}</div>
  `

  return L.divIcon({
    html,
    className: 'water-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export function createSufficiencyMarkerIcon(
  level: SufficiencyLevel,
  userCount: number = 0,
): L.DivIcon {
  const c = SUFFICIENCY_COLORS[level]
  const size = getMarkerSize(userCount)
  const isNoData = level === 'no-data'

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      background: ${isNoData ? '#f1f5f9' : c.hex};
      border: 3px ${isNoData ? 'dashed #94a3b8' : 'solid white'};
      box-shadow: 0 3px 8px ${isNoData ? 'rgba(0,0,0,0.15)' : `${c.hex}80`};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.round(size * 0.5)}px;
      line-height: 1;
      user-select: none;
      color: ${isNoData ? '#94a3b8' : 'white'};
      font-weight: bold;
    ">${size > 36 ? (isNoData ? '❔' : c.emoji) : ''}</div>
  `

  return L.divIcon({
    html,
    className: 'water-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}