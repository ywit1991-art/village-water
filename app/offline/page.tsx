import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <WifiOff size={48} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          ไม่มีการเชื่อมต่ออินเทอร์เน็ต
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          กรุณาตรวจสอบสัญญาณ Wi-Fi หรือข้อมูลมือถือ
          แล้วลองใหม่อีกครั้ง
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md transition active:scale-95"
          >
            <RefreshCw size={16} />
            ลองใหม่
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-700 font-semibold ring-2 ring-slate-200 hover:ring-slate-400 transition"
          >
            <Home size={16} />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}