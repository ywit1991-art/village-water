// ========================================
// ทฤษฎีและเกณฑ์อ้างอิง
// ========================================
// - อัตราการใช้น้ำขั้นพื้นฐาน 50 ลิตร/คน/วัน
//   อ้างอิง: กรมทรัพยากรน้ำ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม
// - Peak Day Factor ในฤดูแล้ง 1.5 เท่า
//   อ้างอิง: มาตรฐานการประปาส่วนภูมิภาค / คู่มือออกแบบระบบประปาหมู่บ้าน
// - จำนวนคนต่อครัวเรือน 5 คน (ค่ามาตรฐานชนบท)
// - กำลังผลิตสูงสุด 14 ชั่วโมง/วัน
// ========================================

export const WATER_PER_PERSON_PER_DAY = 50 // ลิตร/คน/วัน (ฤดูปกติ)
export const DRY_SEASON_FACTOR = 1.5 // Peak day factor ฤดูแล้ง
export const PEOPLE_PER_HOUSEHOLD = 5
export const PRODUCTION_HOURS_PER_DAY = 14

export type Season = 'normal' | 'dry'
export type SufficiencyLevel =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'critical'

export interface SufficiencyResult {
  season: Season
  householdCount: number
  peopleCount: number
  litersPerPerson: number
  dailyDemand: number // ลบ.ม./วัน
  requiredProduction: number // ลบ.ม./ชม.
  actualProduction: number // ลบ.ม./ชม.
  ratio: number // %
  level: SufficiencyLevel
  isEstimated: boolean
}

/**
 * ประมาณกำลังผลิตจากขนาดครัวเรือน
 * อ้างอิง: ตารางขนาดระบบประปาหมู่บ้าน กรมทรัพยากรน้ำ
 */
export function estimateProduction(households: number): number {
  if (households <= 50) return 2.5
  if (households <= 120) return 7
  if (households <= 300) return 10
  if (households <= 700) return 20
  return 50
}

export function calcSufficiency(
  householdCount: number,
  productionCapacity: number | null,
  season: Season = 'normal',
): SufficiencyResult {
  const households = Math.max(0, householdCount || 0)
  const people = households * PEOPLE_PER_HOUSEHOLD

  const litersPerPerson =
    season === 'dry'
      ? WATER_PER_PERSON_PER_DAY * DRY_SEASON_FACTOR
      : WATER_PER_PERSON_PER_DAY

  const dailyDemand = (people * litersPerPerson) / 1000 // ลบ.ม./วัน
  const requiredProduction = dailyDemand / PRODUCTION_HOURS_PER_DAY

  const isEstimated =
    productionCapacity === null || productionCapacity === undefined
  const actualProduction = isEstimated
    ? estimateProduction(households)
    : (productionCapacity as number)

  const ratio =
    requiredProduction > 0 ? (actualProduction / requiredProduction) * 100 : 0

  let level: SufficiencyLevel
  if (ratio >= 120) level = 'excellent'
  else if (ratio >= 100) level = 'good'
  else if (ratio >= 80) level = 'fair'
  else if (ratio >= 60) level = 'poor'
  else level = 'critical'

  return {
    season,
    householdCount: households,
    peopleCount: people,
    litersPerPerson,
    dailyDemand: Math.round(dailyDemand * 100) / 100,
    requiredProduction: Math.round(requiredProduction * 100) / 100,
    actualProduction: Math.round(actualProduction * 100) / 100,
    ratio: Math.round(ratio),
    level,
    isEstimated,
  }
}

export const SUFFICIENCY_COLORS: Record<
  SufficiencyLevel,
  {
    hex: string
    bg: string
    text: string
    label: string
    emoji: string
  }
> = {
  excellent: {
    hex: '#10b981',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    label: 'เพียงพอมาก',
    emoji: '✅',
  },
  good: {
    hex: '#22c55e',
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'เพียงพอ',
    emoji: '✅',
  },
  fair: {
    hex: '#eab308',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: 'พอใช้',
    emoji: '⚠️',
  },
  poor: {
    hex: '#f97316',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: 'ต้องปรับปรุง',
    emoji: '🔧',
  },
  critical: {
    hex: '#ef4444',
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'เร่งด่วน',
    emoji: '🚨',
  },
}