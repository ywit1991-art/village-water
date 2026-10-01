'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  error?: Error & { digest?: string }
  reset?: () => void
  title?: string
  description?: string
}

export function ErrorState({
  error,
  reset,
  title = 'เกิดข้อผิดพลาด',
  description = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-50/30">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <AlertTriangle size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {description}
        </p>

        {error?.digest && (
          <p className="text-xs text-slate-400 mb-5 font-mono bg-slate-100 rounded-lg py-1.5 px-3 inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md transition-all hover:-translate-y-0.5"
            >
              <RefreshCw size={16} />
              ลองใหม่
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-700 font-semibold ring-2 ring-slate-200 hover:ring-slate-400 hover:bg-slate-50 transition-all"
          >
            <Home size={16} />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}