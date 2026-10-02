// ========================================
// ทฤษฎีและเกณฑ์อ้างอิง
// ========================================
// - อัตราการใช้น้ำ 50 ลิตร/คน/วัน (กรมทรัพยากรน้ำ)
// - Peak Day Factor ฤดูแล้ง 1.5 (การประปาส่วนภูมิภาค)
// - จำนวนคนต่อครัวเรือน 5 คน
// - กำลังผลิต 14 ชั่วโมง/วัน
// - ถังเก็บ ≥ 1/3 ของ PDD (มาตรฐานขั้นต่ำ)
// - สูตรปั๊ม: HP × 0.9 × 0.8 (Efficiency) = m³/hr สุทธิ
// ========================================

export const WATER_PER_PERSON_PER_DAY = 50
export const DRY_SEASON_FACTOR = 1.5
export const PEOPLE_PER_HOUSEHOLD = 5
export const PRODUCTION_HOURS_PER_DAY = 14
export const STORAGE_BUFFER_RATIO = 1 / 3

export const PUMP_FLOW_PER_HP = 0.9
export const PUMP_EFFICIENCY = 0.8
export const PUMP_NET_PER_HP = PUMP_FLOW_PER_HP * PUMP_EFFICIENCY

export type Season = 'normal' | 'dry'
export type SufficiencyLevel = 'good' | 'fair' | 'poor' | 'critical'

export interface SufficiencyResult {
  season: Season
  householdCount: number
  peopleCount: number
  litersPerPerson: number
  dailyDemand: number
  peakDayDemand: number
  requiredProduction: number
  actualProduction: number
  dailyProduction: number
  requiredStorage: number
  actualStorage: number
  productionRatio: number
  storageRatio: number
  ratio: number
  level: SufficiencyLevel
  bottleneck: 'production' | 'storage' | 'both-ok' | 'both-bad'
  isProductionEstimated: boolean
  totalHP: number
  usedEfficiency: number
}

export function calcProductionFromHP(hp: number): number {
  if (!hp || hp <= 0) return 0
  return round2(hp * PUMP_NET_PER_HP)
}

export function calcTheoreticalProduction(hp: number): number {
  if (!hp || hp <= 0) return 0
  return round2(hp * PUMP_FLOW_PER_HP)
}

export function calcSufficiency(
  householdCount: number,
  productionCapacity: number | null,
  tankCapacity: number | null,
  season: Season = 'normal',
  totalHP: number = 0,
): SufficiencyResult {
  const households = Math.max(0, householdCount || 0)
  const people = households * PEOPLE_PER_HOUSEHOLD

  const litersPerPerson =
    season === 'dry'
      ? WATER_PER_PERSON_PER_DAY * DRY_SEASON_FACTOR
      : WATER_PER_PERSON_PER_DAY

  const dailyDemand = (people * litersPerPerson) / 1000

  const peakDayDemand =
    season === 'dry' ? dailyDemand : dailyDemand * DRY_SEASON_FACTOR

  const requiredProduction = dailyDemand / PRODUCTION_HOURS_PER_DAY

  let actualProduction: number
  let isProductionEstimated: boolean

  if (
    productionCapacity !== null &&
    productionCapacity !== undefined &&
    productionCapacity > 0
  ) {
    actualProduction = productionCapacity
    isProductionEstimated = false
  } else if (totalHP > 0) {
    actualProduction = calcProductionFromHP(totalHP)
    isProductionEstimated = true
  } else {
    actualProduction = 0
    isProductionEstimated = true
  }

  const dailyProduction = actualProduction * PRODUCTION_HOURS_PER_DAY

  const requiredStorage = peakDayDemand * STORAGE_BUFFER_RATIO
  const actualStorage = tankCapacity ?? 0

  const productionRatio =
    peakDayDemand > 0 ? (dailyProduction / peakDayDemand) * 100 : 0
  const storageRatio =
    requiredStorage > 0 ? (actualStorage / requiredStorage) * 100 : 100

  const ratio = Math.min(productionRatio, storageRatio)

  let level: SufficiencyLevel
  if (ratio >= 90) level = 'good'
  else if (ratio >= 70) level = 'fair'
  else if (ratio >= 50) level = 'poor'
  else level = 'critical'

  let bottleneck: SufficiencyResult['bottleneck']
  const prodOk = productionRatio >= 90
  const storOk = storageRatio >= 90
  if (prodOk && storOk) bottleneck = 'both-ok'
  else if (!prodOk && !storOk) bottleneck = 'both-bad'
  else if (productionRatio < storageRatio) bottleneck = 'production'
  else bottleneck = 'storage'

  return {
    season,
    householdCount: households,
    peopleCount: people,
    litersPerPerson,
    dailyDemand: round2(dailyDemand),
    peakDayDemand: round2(peakDayDemand),
    requiredProduction: round2(requiredProduction),
    actualProduction: round2(actualProduction),
    dailyProduction: round2(dailyProduction),
    requiredStorage: round2(requiredStorage),
    actualStorage: round2(actualStorage),
    productionRatio: Math.round(productionRatio),
    storageRatio: Math.round(storageRatio),
    ratio: Math.round(ratio),
    level,
    bottleneck,
    isProductionEstimated,
    totalHP: round2(totalHP),
    usedEfficiency: PUMP_EFFICIENCY,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ⭐ สีใหม่ — น้ำเงิน → ฟ้า → เทา
export const SUFFICIENCY_COLORS: Record<
  SufficiencyLevel,
  { hex: string; bg: string; text: string; label: string; emoji: string }
> = {
  good: {
    hex: '#1e40af',       // น้ำเงินเข้มสุด (blue-800)
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'เพียงพอ',
    emoji: '✅',
  },
  fair: {
    hex: '#3b82f6',       // น้ำเงิน (blue-500)
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: 'พอใช้',
    emoji: '⚠️',
  },
  poor: {
    hex: '#0ea5e9',       // ฟ้า (sky-500)
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    label: 'ไม่เพียงพอ',
    emoji: '🔧',
  },
  critical: {
    hex: '#94a3b8',       // เทา (slate-400)
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    label: 'วิกฤต',
    emoji: '🚨',
  },
}

export const SUFFICIENCY_THRESHOLDS = [
  {
    min: 90,
    max: Infinity,
    level: 'good' as const,
    label: 'เพียงพอ',
    range: '≥ 90%',
  },
  { min: 70, max: 89, level: 'fair' as const, label: 'พอใช้', range: '70-89%' },
  {
    min: 50,
    max: 69,
    level: 'poor' as const,
    label: 'ไม่เพียงพอ',
    range: '50-69%',
  },
  {
    min: 0,
    max: 49,
    level: 'critical' as const,
    label: 'วิกฤต',
    range: '< 50%',
  },
]