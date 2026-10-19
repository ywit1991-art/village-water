'use client'

import { WifiOff, RotateCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-50 via-white to-sky-50 text-slate-900 relative overflow-hidden">
      
      {/* Background Blobs (ตกแต่งพื้นหลัง) */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-brand-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 md:p-12 max-w-md w-full text-center rounded-3xl shadow-xl border border-brand-100">
        
        {/* ไอคอน */}
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <WifiOff size={40} className="md:w-12 md:h-12" />
        </div>
        
        {/* ข้อความ */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-900 mb-3">
          การเชื่อมต่อขาดหาย
        </h1>
        <p className="text-sm md:text-base text-slate-500 mb-8 leading-relaxed">
          ขณะนี้คุณไม่มีการเชื่อมต่ออินเทอร์เน็ต <br />
          กรุณาตรวจสอบสัญญาณ Wi-Fi หรือข้อมูลมือถือ แล้วลองใหม่อีกครั้ง
        </p>

        {/* ปุ่มกดลองใหม่ */}
        <button
          onClick={() => window.location.reload()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all active:scale-95"
        >
          <RotateCw size={18} />
          ลองเชื่อมต่อใหม่
        </button>
        
      </div>
    </div>
  )
}