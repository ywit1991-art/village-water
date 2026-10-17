'use client'

import { useState } from 'react'
import { X, ExternalLink, Loader2, Info } from 'lucide-react'
import { useFocusTrap } from '@/components/ui/use-focus-trap'

interface Props {
  lat: number
  lng: number
  systemName: string
  onClose: () => void
}

export default function StreetViewModal({
  lat,
  lng,
  systemName,
  onClose,
}: Props) {
  const modalRef = useFocusTrap<HTMLDivElement>(true, onClose)
  const [loading, setLoading] = useState(true)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=0&pitch=0&fov=90`
    : null

  const externalUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Street View ของ ${systemName}`}
        tabIndex={-1}
        className="relative w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col outline-none animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">
                Street View — {systemName}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition active:scale-95"
              title="เปิดใน Google Maps"
            >
              <ExternalLink size={14} />
              <span className="hidden md:inline">เปิดใน Google Maps</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center transition active:scale-95"
              aria-label="ปิด Street View"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 bg-slate-950 relative">
          {embedUrl ? (
            <>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-0">
                  <Loader2 size={32} className="animate-spin mb-2" />
                  <p className="text-sm">กำลังโหลด Street View...</p>
                </div>
              )}

              {/* ⭐ แจ้งเตือนกรณีจอดำ (พิกัดไม่มีภาพ) */}
              <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
                <div className="bg-slate-900/80 backdrop-blur-sm text-white text-xs md:text-sm px-4 py-2 rounded-full border border-slate-700 shadow-lg flex items-center gap-2 pointer-events-auto max-w-lg text-center">
                  <Info size={16} className="text-amber-400 shrink-0" />
                  <span>
                    หากจอดำแสดงว่าพิกัดนี้ไม่มีภาพ Street View{' '}
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline font-semibold ml-1"
                    >
                      เปิดใน Google Maps
                    </a>
                  </span>
                </div>
              </div>

              <iframe
                src={embedUrl}
                className={`w-full h-full border-0 relative z-10 transition-opacity duration-500 ${
                  loading ? 'opacity-0' : 'opacity-100'
                }`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Street View ${systemName}`}
                onLoad={() => setLoading(false)}
              />
            </>
          ) : (
            // Fallback: ไม่มี API Key
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4">
                  <Info size={32} className="text-amber-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  ไม่สามารถแสดง Street View ได้
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  ยังไม่ได้ตั้งค่า Google Maps API Key หรือพิกัดนี้ไม่มีภาพ
                  <br />
                  กรุณาเปิดใน Google Maps แทน
                </p>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg transition active:scale-95"
                >
                  <ExternalLink size={18} />
                  เปิดใน Google Maps
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}