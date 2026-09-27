'use client'

import dynamic from 'next/dynamic'
import type { WaterSystemWithVillage, Village } from '@/lib/types'

const Inner = dynamic(() => import('./water-systems-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-brand-500">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
})

interface Props {
  systems: WaterSystemWithVillage[]
  villages: Village[]
}

export default function WaterSystemsMap({ systems, villages }: Props) {
  return <Inner systems={systems} villages={villages} />
}