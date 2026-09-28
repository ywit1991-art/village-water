'use client'

import dynamic from 'next/dynamic'
import type { WaterSystem, Survey } from '@/lib/types'

const Inner = dynamic(() => import('./village-systems-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  ),
})

interface Props {
  systems: WaterSystem[]
  surveys?: Survey[]
}

export default function VillageSystemsMap({ systems, surveys = [] }: Props) {
  return <Inner systems={systems} surveys={surveys} />
}