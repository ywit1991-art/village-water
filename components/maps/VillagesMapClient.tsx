'use client'

import dynamic from 'next/dynamic'
import type { CommitteeMember } from '@/lib/types'

const VillagesMapInner = dynamic(() => import('./villages-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-brand-500">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
})

export type MarkerMode = 'status' | 'problem' | 'sufficiency'

export interface MarkerData {
  systemId: number
  villageId: number
  villageNo: number
  villageName: string
  systemName: string
  systemNo: number
  lat: number
  lng: number
  status: string
  userCount: number
  householdCount: number
  tankCapacity: number | null
  productionCapacity: number | null
  totalHP: number
  waterRate: number | null
  waterRateType: string | null
  waterRateTiers: Array<{
    from: number
    to: number | null
    rate: number
    label?: string
  }> | null
  productionTypes: string[]
  sufficiency: string | null
  operatorName: string | null
  operatorPhone: string | null
  surveyDate: string | null
  updatedAt: string | null
  committee: CommitteeMember[]
  problems: string[]
  improvements: string[]
  photos: string[]
}

interface Props {
  markers: MarkerData[]
  height?: string
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  markerMode?: MarkerMode
  onMarkerModeChange?: (mode: MarkerMode) => void
}

export default function VillagesMapClient({
  markers,
  height,
  isFullscreen,
  onToggleFullscreen,
  markerMode,
  onMarkerModeChange,
}: Props) {
  return (
    <VillagesMapInner
      markers={markers}
      height={height}
      isFullscreen={isFullscreen}
      onToggleFullscreen={onToggleFullscreen}
      markerMode={markerMode}
      onMarkerModeChange={onMarkerModeChange}
    />
  )
}