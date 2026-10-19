'use client'

import { useEffect, useState } from 'react'
import { WifiOff, RotateCw, Droplets, ShieldAlert } from 'lucide-react'

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // ฟังก์ชันเช็คสถานะ
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    // เช็คครั้งแรกที่โหลด
    if (!navigator.onLine) {
      setIsOffline(true)
    }

    // ดักฟัง Event เมื่อเน็ตหลุด/กลับมา
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!mounted || !isOffline) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-brand-50 via-white to-sky-50 flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden">
      
      {/* ⭐ ลูกเล่นพื้นหลัง: แสงฟุ้งๆ (Blobs) */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-brand-200/50 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* ⭐ Card หลัก */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl p-8 md:p-12 max-w-lg w-full rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50">
        
        {/* ไอคอนแสดงสถานะออฟไลน์ */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
          <div className="relative w-full h-full bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shadow-inner border-4 border-white">
            <WifiOff size={44} className="text-slate-500" />
          </div>
          {/* ไอคอนกากบาทเล็กๆ */}
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm">
            <ShieldAlert size={16} />
          </div>
        </div>
        
        {/* หัวข้อ */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
          การเชื่อมต่อขาดหาย
        </h1>
        
        {/* ⭐ ข้อความตามที่คุณต้องการ */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            ขออภัยในความไม่สะดวก <br className="hidden md:block" />
            <strong className="text-brand-700 font-bold">
              ขณะนี้คุณไม่สามารถดูข้อมูลน้ำประปา <br className="hidden md:block" />
              ของเทศบาลตำบลท่าวังทองได้
            </strong> 
            <br />
            เนื่องจากไม่พบสัญญาณอินเทอร์เน็ตในอุปกรณ์ของคุณ
          </p>
          <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
            <Droplets size={12} /> กรุณาตรวจสอบ Wi-Fi หรือข้อมูลมือถือ แล้วลองอีกครั้ง
          </p>
        </div>

        {/* ปุ่มกดลองใหม่ */}
        <button
          onClick={() => window.location.reload()}
          className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/30 transition-all duration-300 active:scale-95 overflow-hidden"
        >
          {/* เอฟเฟกต์แสงวิ่งผ่านปุ่มตอน Hover */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <RotateCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          ลองเชื่อมต่อใหม่
        </button>
        
      </div>
    </div>
  )
}