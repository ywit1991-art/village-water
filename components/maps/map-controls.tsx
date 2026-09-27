'use client'

import { Maximize2, Minimize2, Locate, Ruler, Printer } from 'lucide-react'

interface Props {
  onFullscreen: () => void
  onLocate: () => void
  onMeasure: () => void
  onPrint: () => void
  isFullscreen: boolean
  isMeasuring: boolean
}

export default function MapControls({
  onFullscreen,
  onLocate,
  onMeasure,
  onPrint,
  isFullscreen,
  isMeasuring,
}: Props) {
  const btn =
    'w-10 h-10 flex items-center justify-center bg-white border border-brand-100 text-brand-700 hover:bg-brand-50 rounded-lg shadow-md transition disabled:opacity-50'

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onFullscreen}
        className={btn}
        title={isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
      <button onClick={onLocate} className={btn} title="ตำแหน่งของฉัน">
        <Locate size={18} />
      </button>
      <button
        onClick={onMeasure}
        className={`${btn} ${isMeasuring ? '!bg-brand-500 !text-white' : ''}`}
        title="วัดระยะทาง"
      >
        <Ruler size={18} />
      </button>
      <button onClick={onPrint} className={btn} title="พิมพ์แผนที่">
        <Printer size={18} />
      </button>
    </div>
  )
}