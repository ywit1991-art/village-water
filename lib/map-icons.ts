import L from 'leaflet'
import { STATUS_COLORS, getMarkerSize } from './constants'

const STATUS_EMOJI: Record<string, string> = {
  'ดี': '✅',
  'พอใช้': '⚠️',
  'ต้องปรับปรุง': '🔧',
  'เร่งด่วน': '🚨',
  'ไม่มีข้อมูล': '❔',
}

/** Marker ปกติ — สีตามสถานะ */
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

/** Marker ปัญหา — แสดงจำนวนปัญหาที่พบ */
export function createProblemMarkerIcon(problemCount: number): L.DivIcon {
  let size = 36
  if (problemCount >= 5) size = 56
  else if (problemCount >= 3) size = 48
  else if (problemCount >= 1) size = 40

  let color = '#f59e0b'
  if (problemCount >= 5) color = '#dc2626'
  else if (problemCount >= 3) color = '#ea580c'
  else if (problemCount >= 1) color = '#f59e0b'

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      <div style="
        position: absolute; inset: -6px; border-radius: 9999px;
        background: ${color}33; animation: problemPulse 1.8s ease-out infinite;
      "></div>
      <div style="
        position: relative; width: ${size}px; height: ${size}px;
        border-radius: 9999px; background: ${color}; border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 800;
        font-size: ${Math.round(size * 0.42)}px; line-height: 1;
        font-family: 'Noto Sans Thai', sans-serif; user-select: none;
      ">${problemCount > 9 ? '9+' : problemCount}</div>
      <div style="
        position: absolute; top: -4px; right: -4px;
        width: 18px; height: 18px; border-radius: 9999px;
        background: #ffffff; display: flex; align-items: center; justify-content: center;
        font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      ">⚠️</div>
    </div>
  `

  if (
    typeof window !== 'undefined' &&
    !document.getElementById('problem-marker-css')
  ) {
    const style = document.createElement('style')
    style.id = 'problem-marker-css'
    style.textContent = `
      @keyframes problemPulse {
        0% { transform: scale(1); opacity: 0.9; }
        70% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  return L.divIcon({
    html,
    className: 'water-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// ============================================================
// ⭐ Marker ความเพียงพอของน้ำ
//    น้ำเงินเข้ม = เพียงพอมาก → ฟ้าอ่อน = เพียงพอน้อย
// ============================================================

/**
 * ดึงสีตามอัตราความเพียงพอ (น้ำเงินเข้ม → ฟ้าอ่อน)
 * แบ่งช่วงตามข้อมูลจริง: 100-622%
 */
export function getSufficiencyColor(ratio: number): {
  hex: string
  textColor: string
  label: string
} {
  if (ratio >= 500) {
    return { hex: '#06486e', textColor: '#ffffff', label: 'เพียงพอมาก' }
  }
  if (ratio >= 450) {
    return { hex: '#1a6c97', textColor: '#ffffff', label: 'เพียงพอมาก' }
  }
  if (ratio >= 400) {
    return { hex: '#3c88b0', textColor: '#ffffff', label: 'เพียงพอ' }
  }
  if (ratio >= 350) {
    return { hex: '#6dbce0', textColor: '#ffffff', label: 'เพียงพอ' }
  }
  if (ratio >= 300) {
    return { hex: '#95d8f8', textColor: '#0c4a6e', label: 'พอใช้' }
  }
  return { hex: '#c9e9fa', textColor: '#0c4a6e', label: 'ไม่เพียงพอ' }
}

/**
 * Marker ความเพียงพอ — แสดงเฉพาะสี + icon 💧
 * ตัวเลข % จะแสดงตอน hover (ผ่าน Leaflet Tooltip)
 */
export function createSufficiencyMarkerIcon(
  ratio: number | null,
  hasData: boolean,
): L.DivIcon {
  // ---- ไม่มีข้อมูลครัวเรือน ----
  if (!hasData || ratio === null) {
    const size = 30
    const html = `
      <div style="
        width: ${size}px; height: ${size}px; border-radius: 9999px;
        background: repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 3px, #e2e8f0 3px, #e2e8f0 6px);
        border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; line-height: 1; user-select: none;
      ">💧</div>
    `
    return L.divIcon({
      html,
      className: 'water-marker-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    })
  }

  const { hex } = getSufficiencyColor(ratio)

  // ---- ขนาดคงที่ — ลด overlap ----
  const size = 32

  // ---- pulse ring เฉพาะที่ ≥400% ----
  const showPulse = ratio >= 400

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      ${
        showPulse
          ? `
        <div style="
          position: absolute; inset: -5px; border-radius: 9999px;
          background: ${hex}40;
          animation: suffPulse 2.4s ease-out infinite;
        "></div>
      `
          : ''
      }

      <div style="
        position: relative; width: ${size}px; height: ${size}px;
        border-radius: 9999px; background: ${hex};
        border: 2.5px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; line-height: 1; user-select: none;
      ">💧</div>
    </div>
  `

  if (
    typeof window !== 'undefined' &&
    !document.getElementById('suff-marker-css')
  ) {
    const style = document.createElement('style')
    style.id = 'suff-marker-css'
    style.textContent = `
      @keyframes suffPulse {
        0% { transform: scale(1); opacity: 0.85; }
        70% { transform: scale(1.5); opacity: 0; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  return L.divIcon({
    html,
    className: 'water-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}