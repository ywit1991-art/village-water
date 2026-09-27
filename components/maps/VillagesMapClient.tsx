'use client'

import dynamic from 'next/dynamic'

const VillagesMapInner = dynamic(() => import('./villages-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-2xl border border-brand-100 bg-brand-50/40 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-brand-500">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
})

interface Point {
  id: number
  name: string
  lat: number
  lng: number
  status: string
}

export default function VillagesMapClient({ points }: { points: Point[] }) {
  return <VillagesMapInner points={points} />
}