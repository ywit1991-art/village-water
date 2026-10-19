'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-brand-50 via-white to-brand-50/50 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 card p-8 md:p-12 max-w-md w-full text-center shadow-xl border-brand-100">
        <div className="w-20 h-20 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
          <WifiOff size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-brand-900 mb-2">
          การเชื่อมต่อขาดหาย
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          ขณะนี้คุณไม่มีการเชื่อมต่ออินเทอร์เน็ต <br />
          กรุณาตรวจสอบสัญญาณหรือเปิดใช้งาน Wi-Fi / ข้อมูลมือถือ แล้วลองใหม่อีกครั้ง
        </p>

        <button
          onClick={() => window.location.reload()}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          ลองเชื่อมต่อใหม่
        </button>
      </div>
    </div>
  )
}